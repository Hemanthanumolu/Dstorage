import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock(
  './artifacts/contracts/Upload.sol/Upload.json',
  () => ({
    abi: [],
  }),
  { virtual: true }
);

jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));

test('renders connect wallet prompt', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { name: /connect your wallet/i })
  ).toBeInTheDocument();
  const walletButtons = screen.getAllByRole('button', { name: /connect wallet/i });
  expect(walletButtons.length).toBeGreaterThan(0);
});
