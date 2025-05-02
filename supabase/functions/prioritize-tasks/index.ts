/**
 * Performance Profile - Task Prioritization Edge Function
 * 
 * Current Bottlenecks:
 * 1. Sequential Database Operations: Two separate database calls (select + update)
 * 2. Synchronous LLM API Call: Blocking call to Groq API (~500-1000ms)
 * 3. No Caching: Repeated priority calculations for similar tasks
 * 
 * Optimization Strategy A - Batch Processing:
 * + Combine DB operations into single RPC call
 * + Cache LLM responses for similar tasks
 * + Batch multiple priority requests
 * - Higher implementation complexity
 * - Slightly delayed priority updates
 * - Additional storage for cache
 * 
 * Optimization Strategy B - Async Processing:
 * + Non-blocking priority updates
 * + Immediate response to client
 * + Better user experience
 * - Eventually consistent priorities
 * - More complex error handling
 * - Requires webhook or polling for completion
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const groqApiKey = Deno.env.get('GROQ_API_KEY') ?? '';

// Batch processing configuration
const BATCH_WINDOW_MS = 100; // Window to collect tasks for batching
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // Cache TTL: 24 hours

interface BatchItem {
  taskId: string;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

interface CacheEntry {
  priority: string;
  timestamp: number;
}

// In-memory batch queue and cache
let batchQueue: BatchItem[] = [];
const priorityCache = new Map<string, CacheEntry>();

// Function to get cache key from task
function getCacheKey(task: { title: string; description: string | null }): string {
  return `${task.title}:${task.description || ''}`.toLowerCase();
}

// Function to clean old cache entries
function cleanCache() {
  const now = Date.now();
  for (const [key, entry] of priorityCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      priorityCache.delete(key);
    }
  }
}

// Function to process a batch of tasks
async function processBatch(supabase: any, items: BatchItem[]) {
  try {
    // 1. Fetch all tasks in a single query
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title, description')
      .in('id', items.map(item => item.taskId));

    if (fetchError) throw fetchError;

    // Group tasks by cache key for efficient LLM usage
    const taskGroups = new Map<string, typeof tasks>();
    tasks.forEach(task => {
      const cacheKey = getCacheKey(task);
      if (!taskGroups.has(cacheKey)) {
        taskGroups.set(cacheKey, []);
      }
      taskGroups.get(cacheKey)!.push(task);
    });

    // Process each unique task group
    const priorityUpdates = [];
    for (const [cacheKey, groupTasks] of taskGroups) {
      let priority: string;

      // Check cache first
      const cached = priorityCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        priority = cached.priority;
      } else {
        // Call Groq API for new priority
        if (groqApiKey) {
          const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: "llama3-8b-8192",
              messages: [
                {
                  role: "system",
                  content: "You are a task prioritization assistant. Based on the task description, assign a priority level from these options only: low, medium, high. Respond with only one of these three words."
                },
                {
                  role: "user",
                  content: `Task: ${groupTasks[0].title}\nDescription: ${groupTasks[0].description || '(No description provided)'}`
                }
              ],
              temperature: 0.2,
              max_tokens: 10
            })
          });

          const groqData = await groqResponse.json();
          priority = groqData?.choices?.[0]?.message?.content?.toLowerCase().trim();
          
          if (!['low', 'medium', 'high'].includes(priority)) {
            priority = 'medium';
          }
        } else {
          // Mock response if no API key
          const priorities = ['low', 'medium', 'high'];
          priority = priorities[Math.floor(Math.random() * priorities.length)];
        }

        // Cache the result
        priorityCache.set(cacheKey, {
          priority,
          timestamp: Date.now()
        });
      }

      // Add priority updates for all tasks in this group
      groupTasks.forEach(task => {
        priorityUpdates.push({
          id: task.id,
          priority
        });
      });
    }

    // Update all tasks in a single transaction
    const { data: updateData, error: updateError } = await supabase
      .from('tasks')
      .upsert(priorityUpdates)
      .select('id, title, priority');

    if (updateError) throw updateError;

    // Map results back to promises
    const resultMap = new Map(updateData.map(task => [task.id, task]));
    items.forEach(item => {
      const result = resultMap.get(item.taskId);
      if (result) {
        item.resolve({ success: true, task: result });
      } else {
        item.reject(new Error('Task not found in results'));
      }
    });

    // Clean cache periodically
    if (Math.random() < 0.1) { // 10% chance to clean on each batch
      cleanCache();
    }

  } catch (error) {
    // Reject all promises in case of error
    items.forEach(item => item.reject(error));
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create Supabase client with user's auth token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get task ID from request
    const { taskId } = await req.json();
    
    if (!taskId) {
      return new Response(JSON.stringify({ error: 'Task ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create a promise that will be resolved when the batch is processed
    const result = await new Promise((resolve, reject) => {
      batchQueue.push({ taskId, resolve, reject });

      // Process batch after window or if queue gets too large
      if (batchQueue.length === 1) {
        setTimeout(() => {
          const items = batchQueue;
          batchQueue = [];
          processBatch(supabase, items);
        }, BATCH_WINDOW_MS);
      }
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error in prioritize-tasks function:", error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
