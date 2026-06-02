import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Web Sanity Check', () => {
  it('should pass a basic truthiness test', () => {
    expect(true).toBe(true);
  });

  it('renders a simple element', () => {
    render(<div>Hello Vitest</div>);
    expect(screen.getByText('Hello Vitest')).toBeInTheDocument();
  });
});
