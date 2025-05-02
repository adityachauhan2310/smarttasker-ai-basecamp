export interface RecurringTask {
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

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  tags: string[] | null;
}

export interface TaskInstance {
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

// Helper function to create a task instance
export function createTaskInstance(
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

  // Calculate the start of the week for the config's start date
  const configStartDate = new Date(config.start_date)
  const configStartWeek = Math.floor(configStartDate.getTime() / (7 * 24 * 60 * 60 * 1000))

  while (currentDate <= endDate && createdCount < tasksLimit) {
    const currentWeek = Math.floor(currentDate.getTime() / (7 * 24 * 60 * 60 * 1000))
    const weeksSinceStart = currentWeek - configStartWeek
    
    // Check if this is a week we should generate tasks for
    if (weeksSinceStart % config.interval_count === 0) {
      // Check if this day of the week is included in the weekdays config
      const dayOfWeek = currentDate.getDay()
      if (!config.weekdays || config.weekdays.includes(dayOfWeek)) {
        tasksToCreate.push(createTaskInstance(templateTask, config, currentDate))
        createdCount++
      }
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