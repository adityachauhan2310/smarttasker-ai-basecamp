
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

    // Get task description from request
    const { taskId } = await req.json();
    
    if (!taskId) {
      return new Response(JSON.stringify({ error: 'Task ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get task information
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, description')
      .eq('id', taskId)
      .single();

    if (taskError) {
      return new Response(JSON.stringify({ error: 'Error fetching task', details: taskError }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let priority = 'medium'; // Default priority

    // If we have a GROQ API key, use Groq to determine priority
    if (groqApiKey) {
      try {
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
                content: `Task: ${task.title}\nDescription: ${task.description || '(No description provided)'}`
              }
            ],
            temperature: 0.2,
            max_tokens: 10
          })
        });

        const groqData = await groqResponse.json();
        if (groqData?.choices?.[0]?.message?.content) {
          const response = groqData.choices[0].message.content.toLowerCase().trim();
          if (['low', 'medium', 'high'].includes(response)) {
            priority = response;
          }
        }
      } catch (groqError) {
        console.error("Error calling Groq API:", groqError);
        // Continue with default priority
      }
    } else {
      // Mock response if no API key set - randomly select a priority
      const priorities = ['low', 'medium', 'high'];
      priority = priorities[Math.floor(Math.random() * priorities.length)];
    }

    // Update task with new priority
    const { data: updateData, error: updateError } = await supabase
      .from('tasks')
      .update({ priority })
      .eq('id', taskId)
      .select('id, title, priority');

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Error updating task priority', details: updateError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      task: updateData[0]
    }), {
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
