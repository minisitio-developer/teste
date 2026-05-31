import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renderiza a aplicação sem quebrar a rota inicial', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText(/O Minisitio utiliza cookies/i)).toBeInTheDocument();
});
