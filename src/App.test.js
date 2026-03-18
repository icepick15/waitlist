import { render, screen } from '@testing-library/react';
import App from './App';

test('renders waitlist dashboard heading', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /waitlist/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /service providers/i })).toBeInTheDocument();
});

