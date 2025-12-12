import { render, screen } from '@testing-library/react';
import { Logo } from '@/components/logo';

describe('Logo', () => {
  it('renders a link to the homepage with the logo image', () => {
    render(<Logo />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', 'Bzion Hub Logo');
    expect(image).toHaveAttribute('src', '/logo.svg');
  });
});
