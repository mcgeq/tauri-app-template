import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('💥');
  }
  return <div>safe</div>;
}

function TestApp() {
  const [shouldThrow, setShouldThrow] = useState(false);
  return (
    <ErrorBoundary>
      <Bomb shouldThrow={shouldThrow} />
      <button onClick={() => setShouldThrow(true)}>trigger</button>
    </ErrorBoundary>
  );
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

it('renders children when no error', () => {
  render(<ErrorBoundary><div>ok</div></ErrorBoundary>);
  expect(screen.getByText('ok')).toBeInTheDocument();
});

it('renders fallback on error', () => {
  render(<TestApp />);
  expect(screen.getByText('safe')).toBeInTheDocument();
});
