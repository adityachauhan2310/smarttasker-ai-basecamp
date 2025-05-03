// Task summarization utility for dashboard insights

export interface TaskSummary {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  upcoming: number;
}

export function summarizeTasks(tasks: Array<{ status: string; due_date?: string }>): TaskSummary {
  const now = new Date();
  let completed = 0, pending = 0, overdue = 0, upcoming = 0;
  for (const task of tasks) {
    if (task.status === 'completed') completed++;
    else if (task.status === 'pending' || task.status === 'in_progress') {
      pending++;
      if (task.due_date) {
        const due = new Date(task.due_date);
        if (due < now) overdue++;
        else upcoming++;
      }
    }
  }
  return {
    total: tasks.length,
    completed,
    pending,
    overdue,
    upcoming,
  };
} 