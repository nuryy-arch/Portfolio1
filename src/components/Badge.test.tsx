import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge Component', () => {
  it('renders status badge correctly', () => {
    render(<Badge status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeDefined();
  });

  it('renders priority badge correctly', () => {
    render(<Badge priority="urgent" />);
    expect(screen.getByText('Urgent')).toBeDefined();
  });

  it('renders custom children when provided', () => {
    render(<Badge variant="success">Completed Stage</Badge>);
    expect(screen.getByText('Completed Stage')).toBeDefined();
  });
});
