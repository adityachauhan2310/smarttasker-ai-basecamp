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

interface ProcessResult {
  id: string;
  tasksCreated?: number;
  error?: string;
  message?: string;
  newTotal?: number;
}

interface TaskInstance {
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string;
  tags: string[] | null;
  original_task_id: string;
  recurring_task_id: string;
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

    const results: ProcessResult[] = []

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

      const result = await processRecurringConfig(supabase, config, templateTask, today, lookAheadDate)
      results.push(result)
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

// Helper function to calculate the date range for task generation
function calculateDateRange(
  config: RecurringTask,
  today: Date,
  lookAheadDate: Date
): { startDate: Date; endDate: Date } {
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

  return { startDate, endDate }
}

// Helper function to calculate remaining instances and task limit
function calculateTaskLimits(
  config: RecurringTask,
  maxTasksPerRun: number = 100
): { remainingInstances: number; tasksLimit: number } {
  const remainingInstances = config.max_instances ? 
    config.max_instances - config.created_instances : 
    Number.MAX_SAFE_INTEGER // No limit

  const tasksLimit = Math.min(remainingInstances, maxTasksPerRun)
  
  return { remainingInstances, tasksLimit }
}

// Helper function to create a task instance
function createTaskInstance(
  template: Task, 
  config: RecurringTask, 
  dueDate: Date
): TaskInstance {
  return {
    user_id: template.user_id,
    title: template.title,
    description: template.description,
    status: 'pending',
    priority: template.priority,
    due_date: dueDate.toISOString(),
    tags: template.tags,
    original_task_id: template.id,
    recurring_task_id: config.id
  }
}

// Helper function to generate daily tasks
export function generateDailyTasks(
  config: RecurringTask,
  templateTask: Task,
  startDate: Date,
  endDate: Date,
  tasksLimit: number
): TaskInstance[] {
  const tasksToCreate: TaskInstance[] = []
  let createdCount = 0
  let currentDate = new Date(startDate)

  while (currentDate <= endDate && createdCount < tasksLimit) {
    const daysSinceStart = Math.floor((currentDate.getTime() - new Date(config.start_date).getTime()) / (24*60*60*1000))
    if (daysSinceStart % config.interval_count === 0) {
      tasksToCreate.push(createTaskInstance(templateTask, config, currentDate))
      createdCount++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return tasksToCreate
}

// Helper function to generate weekly tasks
export function generateWeeklyTasks(
  config: RecurringTask,
  templateTask: Task,
  startDate: Date,
  endDate: Date,
  tasksLimit: number
): TaskInstance[] {
  const tasksToCreate: TaskInstance[] = []
  let createdCount = 0
  let currentDate = new Date(startDate)

  while (currentDate <= endDate && createdCount < tasksLimit) {
    const dayOfWeek = currentDate.getDay()
    const weeksSinceStart = Math.floor((currentDate.getTime() - new Date(config.start_date).getTime()) / (7*24*60*60*1000))
    
    if (weeksSinceStart % config.interval_count === 0 && 
        (!config.weekdays || config.weekdays.includes(dayOfWeek))) {
      tasksToCreate.push(createTaskInstance(templateTask, config, currentDate))
      createdCount++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return tasksToCreate
}

// Helper function to generate monthly tasks
export function generateMonthlyTasks(
  config: RecurringTask,
  templateTask: Task,
  startDate: Date,
  endDate: Date,
  tasksLimit: number
): TaskInstance[] {
  const tasksToCreate: TaskInstance[] = []
  let createdCount = 0
  let currentDate = new Date(startDate)

  while (currentDate <= endDate && createdCount < tasksLimit) {
    const monthsSinceStart = 
      (currentDate.getFullYear() - new Date(config.start_date).getFullYear()) * 12 + 
      (currentDate.getMonth() - new Date(config.start_date).getMonth())
    
    if (monthsSinceStart % config.interval_count === 0 &&
        (!config.month_day || currentDate.getDate() === config.month_day)) {
      tasksToCreate.push(createTaskInstance(templateTask, config, currentDate))
      createdCount++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return tasksToCreate
}

// Helper function to insert tasks and update config
async function insertTasksAndUpdateConfig(
  supabase: any,
  tasksToCreate: TaskInstance[],
  config: RecurringTask,
  endDate: Date
): Promise<{ success: boolean; error?: string }> {
  // Insert the new task instances
  const { data: newTasks, error: insertError } = await supabase
    .from('tasks')
    .insert(tasksToCreate)
    .select('id')
  
  if (insertError) {
    return { success: false, error: `Failed to insert tasks: ${insertError.message}` }
  }
  
  // Update the recurring task config
  const { error: updateError } = await supabase
    .from('recurring_tasks')
    .update({
      created_instances: config.created_instances + tasksToCreate.length,
      last_generated_date: endDate.toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    })
    .eq('id', config.id)
  
  if (updateError) {
    return { success: false, error: `Tasks created but failed to update config: ${updateError.message}` }
  }
  
  return { success: true }
}

// Main function to process a single recurring task config
async function processRecurringConfig(
  supabase: any,
  config: RecurringTask,
  templateTask: Task,
  today: Date,
  lookAheadDate: Date
): Promise<ProcessResult> {
  // Calculate date range
  const { startDate, endDate } = calculateDateRange(config, today, lookAheadDate)
  
  // Safety check - don't proceed if start date is after end date
  if (startDate > endDate) {
    return {
      id: config.id,
      message: 'No tasks to generate in the specified period'
    }
  }

  // Calculate task limits
  const { remainingInstances, tasksLimit } = calculateTaskLimits(config)
  
  if (tasksLimit <= 0) {
    return {
      id: config.id,
      message: 'Max instances reached, no more tasks will be generated'
    }
  }

  // Generate tasks based on frequency
  let tasksToCreate: TaskInstance[] = []
  switch(config.frequency) {
    case 'daily':
      tasksToCreate = generateDailyTasks(config, templateTask, startDate, endDate, tasksLimit)
      break
    case 'weekly':
      tasksToCreate = generateWeeklyTasks(config, templateTask, startDate, endDate, tasksLimit)
      break
    case 'monthly':
      tasksToCreate = generateMonthlyTasks(config, templateTask, startDate, endDate, tasksLimit)
      break
  }

  if (tasksToCreate.length > 0) {
    const result = await insertTasksAndUpdateConfig(supabase, tasksToCreate, config, endDate)
    if (!result.success) {
      return { id: config.id, error: result.error }
    }
    return {
      id: config.id,
      tasksCreated: tasksToCreate.length,
      newTotal: config.created_instances + tasksToCreate.length
    }
  }

  return {
    id: config.id,
    message: 'No tasks created in this period'
  }
}
