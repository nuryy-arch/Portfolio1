import { describe, it, expect } from 'vitest';
import { taskSchema } from './TaskForm';

describe('Task Validation Schema', () => {
  it('validates a correct task payload', () => {
    const validData = {
      title: 'Setup automated deployment pipeline',
      description: 'Using GitHub actions and Supabase CLI',
      status: 'todo',
      priority: 'high',
      due_date: '2026-12-31',
      project_id: 'proj-123',
    };

    const result = taskSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails if title is empty', () => {
    const invalidData = {
      title: '',
      status: 'todo',
      priority: 'medium',
    };

    const result = taskSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Title is required');
    }
  });

  it('fails if status is invalid', () => {
    const invalidData = {
      title: 'Clean refactor',
      status: 'invalid_status_value',
      priority: 'low',
    };

    const result = taskSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
