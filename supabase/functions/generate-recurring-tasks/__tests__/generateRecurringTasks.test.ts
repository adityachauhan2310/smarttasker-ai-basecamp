import { describe, test, expect } from '@jest/globals';
import { 
  generateDailyTasks, 
  generateWeeklyTasks, 
  generateMonthlyTasks,
  RecurringTask,
  Task
} from '../src/taskGenerators';

describe('Recurring Task Generation', () => {
  const mockTemplateTask: Task = {
    id: 'template-1',
    user_id: 'user-1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    due_date: null,
    tags: ['test']
  };

  const mockConfig: RecurringTask = {
    id: 'config-1',
    user_id: 'user-1',
    task_template_id: 'template-1',
    frequency: 'daily',
    interval_count: 1,
    weekdays: null,
    month_day: null,
    start_date: '2024-03-01',
    end_date: null,
    max_instances: null,
    created_instances: 0,
    last_generated_date: null
  };

  describe('Daily Tasks', () => {
    test('should generate daily tasks with interval of 1', () => {
      const startDate = new Date('2024-03-01');
      const endDate = new Date('2024-03-03');
      const tasksLimit = 10;

      const tasks = generateDailyTasks(mockConfig, mockTemplateTask, startDate, endDate, tasksLimit);

      expect(tasks).toHaveLength(3); // Should generate tasks for March 1, 2, and 3
      expect(tasks[0].due_date).toBe('2024-03-01T00:00:00.000Z');
      expect(tasks[1].due_date).toBe('2024-03-02T00:00:00.000Z');
      expect(tasks[2].due_date).toBe('2024-03-03T00:00:00.000Z');
    });

    test('should generate daily tasks with interval of 2', () => {
      const config: RecurringTask = { ...mockConfig, interval_count: 2 };
      const startDate = new Date('2024-03-01');
      const endDate = new Date('2024-03-05');
      const tasksLimit = 10;

      const tasks = generateDailyTasks(config, mockTemplateTask, startDate, endDate, tasksLimit);

      expect(tasks).toHaveLength(3); // Should generate tasks for March 1, 3, and 5
      expect(tasks[0].due_date).toBe('2024-03-01T00:00:00.000Z');
      expect(tasks[1].due_date).toBe('2024-03-03T00:00:00.000Z');
      expect(tasks[2].due_date).toBe('2024-03-05T00:00:00.000Z');
    });
  });

  describe('Weekly Tasks', () => {
    test('should generate weekly tasks on specified weekdays', () => {
      const config: RecurringTask = {
        ...mockConfig,
        frequency: 'weekly',
        interval_count: 1,
        weekdays: [1, 3, 5], // Monday (1), Wednesday (3), Friday (5)
        start_date: '2024-03-01' // Friday
      };
      const startDate = new Date('2024-03-01'); // Friday
      const endDate = new Date('2024-03-07'); // Thursday
      const tasksLimit = 10;

      const tasks = generateWeeklyTasks(config, mockTemplateTask, startDate, endDate, tasksLimit);

      expect(tasks).toHaveLength(3); // Friday (3/1), Monday (3/4), Wednesday (3/6)
      expect(tasks[0].due_date).toBe('2024-03-01T00:00:00.000Z'); // Friday
      expect(tasks[1].due_date).toBe('2024-03-04T00:00:00.000Z'); // Monday
      expect(tasks[2].due_date).toBe('2024-03-06T00:00:00.000Z'); // Wednesday
    });

    test('should generate weekly tasks with interval of 2 weeks', () => {
      const config: RecurringTask = {
        ...mockConfig,
        frequency: 'weekly',
        interval_count: 2,
        weekdays: [1], // Monday only
        start_date: '2024-03-04' // Monday
      };
      const startDate = new Date('2024-03-04'); // First Monday
      const endDate = new Date('2024-03-18'); // Second Monday
      const tasksLimit = 10;

      const tasks = generateWeeklyTasks(config, mockTemplateTask, startDate, endDate, tasksLimit);

      expect(tasks).toHaveLength(2); // First Monday (3/4) and third Monday (3/18)
      expect(tasks[0].due_date).toBe('2024-03-04T00:00:00.000Z'); // First Monday
      expect(tasks[1].due_date).toBe('2024-03-18T00:00:00.000Z'); // Third Monday
    });
  });

  describe('Monthly Tasks', () => {
    test('should generate monthly tasks on specified day', () => {
      const config: RecurringTask = {
        ...mockConfig,
        frequency: 'monthly',
        interval_count: 1,
        month_day: 15 // 15th of each month
      };
      const startDate = new Date('2024-03-01');
      const endDate = new Date('2024-04-30');
      const tasksLimit = 10;

      const tasks = generateMonthlyTasks(config, mockTemplateTask, startDate, endDate, tasksLimit);

      expect(tasks).toHaveLength(2); // Should generate tasks for March 15 and April 15
      expect(tasks[0].due_date).toBe('2024-03-15T00:00:00.000Z');
      expect(tasks[1].due_date).toBe('2024-04-15T00:00:00.000Z');
    });

    test('should generate monthly tasks with interval of 2 months', () => {
      const config: RecurringTask = {
        ...mockConfig,
        frequency: 'monthly',
        interval_count: 2,
        month_day: 1 // 1st of every other month
      };
      const startDate = new Date('2024-03-01');
      const endDate = new Date('2024-06-30');
      const tasksLimit = 10;

      const tasks = generateMonthlyTasks(config, mockTemplateTask, startDate, endDate, tasksLimit);

      expect(tasks).toHaveLength(2); // Should generate tasks for March 1 and May 1
      expect(tasks[0].due_date).toBe('2024-03-01T00:00:00.000Z');
      expect(tasks[1].due_date).toBe('2024-05-01T00:00:00.000Z');
    });
  });
}); 