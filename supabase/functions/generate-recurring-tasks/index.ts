
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecurringTask {
  id: string;
  user_id: string;
  task_template_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval_count: number;
  weekdays: number[] | null;
  month_day: number | null;
  start_date: string;
  end_date: string | null;
  max_instances: number | null;
  created_instances: number;
  last_generated_date: string | null;
}

interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  tags: string[] | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the user that called the function
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user information
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Set the lookAhead value in days (how far in the future to generate tasks)
    // Default is 30 days, can be passed as a parameter
    const url = new URL(req.url)
    const lookAheadDays = parseInt(url.searchParams.get('lookAhead') || '30')
    
    // Get current date in UTC
    const today = new Date()
    const lookAheadDate = new Date(today)
    lookAheadDate.setDate(today.getDate() + lookAheadDays)
    
    const todayStr = today.toISOString().split('T')[0]
    const lookAheadStr = lookAheadDate.toISOString().split('T')[0]

    console.log(`Generating recurring tasks from ${todayStr} to ${lookAheadStr}`)

    // Get all recurring task configs that need processing
    // Either they have no last_generated_date or it's before our lookAhead date
    // And they haven't reached max_instances if set
    const { data: recurringConfigs, error: configError } = await supabase
      .from('recurring_tasks')
      .select('*')
      .or(`last_generated_date.is.null,last_generated_date.lt.${lookAheadStr}`)
      .or('max_instances.is.null,created_instances.lt.max_instances')
      .or(`end_date.is.null,end_date.gte.${todayStr}`)

    if (configError) {
      return new Response(JSON.stringify({ error: configError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (!recurringConfigs || recurringConfigs.length === 0) {
      return new Response(JSON.stringify({ message: 'No recurring tasks to process' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`Found ${recurringConfigs.length} recurring task configs to process`)

    const results = []

    // Process each recurring task config
    for (const config of recurringConfigs as RecurringTask[]) {
      // Get the template task
      const { data: templateTask, error: templateError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', config.task_template_id)
        .single()

      if (templateError || !templateTask) {
        results.push({ 
          id: config.id, 
          error: `Template task not found: ${templateError?.message || 'Unknown error'}` 
        })
        continue
      }

      // Determine the date range to generate tasks for
      const startDate = new Date(config.last_generated_date ? 
        new Date(config.last_generated_date).getTime() + 24*60*60*1000 : // day after last generated
        config.start_date) // or the start date if no tasks generated yet
      
      // Don't generate tasks before today
      if (startDate < today) {
        startDate.setTime(today.getTime())
      }
      
      // Don't generate beyond the end date if set
      const endDate = config.end_date && new Date(config.end_date) < lookAheadDate ? 
        new Date(config.end_date) : 
        lookAheadDate

      // Safety check - don't proceed if start date is after end date
      if (startDate > endDate) {
        results.push({
          id: config.id,
          message: 'No tasks to generate in the specified period'
        })
        continue
      }

      // Determine how many instances we have left to create (if max_instances is set)
      const remainingInstances = config.max_instances ? 
        config.max_instances - config.created_instances : 
        Number.MAX_SAFE_INTEGER // No limit

      // Safety valve - limit max tasks per run to prevent too many insertions
      const MAX_TASKS_PER_RUN = 100
      const tasksLimit = Math.min(remainingInstances, MAX_TASKS_PER_RUN)

      if (tasksLimit <= 0) {
        results.push({
          id: config.id,
          message: 'Max instances reached, no more tasks will be generated'
        })
        continue
      }

      const tasksToCreate = []
      let createdCount = 0
      let currentDate = new Date(startDate)

      // Generate tasks according to frequency until we reach the end date or tasksLimit
      switch(config.frequency) {
        case 'daily':
          while (currentDate <= endDate && createdCount < tasksLimit) {
            // Skip dates that don't match the interval
            const daysSinceStart = Math.floor((currentDate.getTime() - new Date(config.start_date).getTime()) / (24*60*60*1000))
            if (daysSinceStart % config.interval_count === 0) {
              tasksToCreate.push(createTaskInstance(templateTask, config, currentDate))
              createdCount++
            }
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1)
          }
          break
          
        case 'weekly':
          while (currentDate <= endDate && createdCount < tasksLimit) {
            // For weekly tasks, check if the current day of week is in the weekdays array
            const dayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, etc.
            const weeksSinceStart = Math.floor((currentDate.getTime() - new Date(config.start_date).getTime()) / (7*24*60*60*1000))
            
            // Check if this week matches the interval and the day is in the weekdays array
            if (weeksSinceStart % config.interval_count === 0 && 
                (!config.weekdays || config.weekdays.includes(dayOfWeek))) {
              tasksToCreate.push(createTaskInstance(templateTask, config, currentDate))
              createdCount++
            }
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1)
          }
          break
          
        case 'monthly':
          while (currentDate <= endDate && createdCount < tasksLimit) {
            const monthsSinceStart = 
              (currentDate.getFullYear() - new Date(config.start_date).getFullYear()) * 12 + 
              (currentDate.getMonth() - new Date(config.start_date).getMonth())
            
            // Check if this month matches the interval and day of month matches
            if (monthsSinceStart % config.interval_count === 0 &&
                (!config.month_day || currentDate.getDate() === config.month_day)) {
              tasksToCreate.push(createTaskInstance(templateTask, config, currentDate))
              createdCount++
              
              // For monthly, jump to the next month instead of incrementing days
              currentDate.setMonth(currentDate.getMonth() + 1)
              // Reset to desired day of month
              if (config.month_day) {
                currentDate.setDate(config.month_day)
              }
            } else {
              // If not matching day, move to next day
              currentDate.setDate(currentDate.getDate() + 1)
            }
          }
          break
      }

      if (tasksToCreate.length > 0) {
        // Insert the new task instances
        const { data: newTasks, error: insertError } = await supabase
          .from('tasks')
          .insert(tasksToCreate)
          .select('id')
        
        if (insertError) {
          results.push({
            id: config.id,
            error: `Failed to insert tasks: ${insertError.message}`
          })
          continue
        }
        
        // Update the recurring task config with new counts and last generated date
        const { error: updateError } = await supabase
          .from('recurring_tasks')
          .update({
            created_instances: config.created_instances + tasksToCreate.length,
            last_generated_date: endDate.toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', config.id)
        
        if (updateError) {
          results.push({
            id: config.id,
            error: `Tasks created but failed to update config: ${updateError.message}`
          })
          continue
        }
        
        results.push({
          id: config.id,
          tasksCreated: tasksToCreate.length,
          newTotal: config.created_instances + tasksToCreate.length
        })
      } else {
        results.push({
          id: config.id,
          message: 'No tasks created in this period'
        })
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: recurringConfigs.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

// Helper function to create a new task instance from a template task
function createTaskInstance(
  template: Task, 
  config: RecurringTask, 
  dueDate: Date
): any {
  // Calculate the due date based on the template's due date
  let taskDueDate = null
  if (template.due_date) {
    // If template has a due date, maintain the same time but change the date
    const templateDueDate = new Date(template.due_date)
    taskDueDate = new Date(dueDate)
    taskDueDate.setHours(
      templateDueDate.getHours(),
      templateDueDate.getMinutes(),
      templateDueDate.getSeconds()
    )
  } else {
    // If no due date, use the generated date
    taskDueDate = dueDate
  }

  return {
    user_id: config.user_id,
    title: template.title,
    description: template.description,
    status: 'pending', // Always create new instances as pending
    priority: template.priority,
    due_date: taskDueDate.toISOString(),
    original_task_id: config.task_template_id, // Link to original template task
    tags: template.tags,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}
