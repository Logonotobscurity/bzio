import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders a default badge', () => {
    render(<Badge>Default</Badge>);

    const badge = screen.getByText('Default');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('border-transparent bg-primary text-primary-foreground');
  });

  it('renders a destructive badge', () => {
    render(<Badge variant="destructive">Destructive</Badge>);

    const badge = screen.getByText('Destructive');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('border-transparent bg-destructive text-destructive-foreground');
  });

  it('renders an outline badge', () => {
    render(<Badge variant="outline">Outline</Badge>);

    const badge = screen.getByText('Outline');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-foreground');
  });
});
