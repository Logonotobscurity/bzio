import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card', () => {
  it('renders a card with all its components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card Title</CardTitle>
          <CardDescription>Test Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Test Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Test Card Footer</p>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Card Title')).toBeInTheDocument();
    expect(screen.getByText('Test Card Description')).toBeInTheDocument();
    expect(screen.getByText('Test Card Content')).toBeInTheDocument();
    expect(screen.getByText('Test Card Footer')).toBeInTheDocument();
  });
});
