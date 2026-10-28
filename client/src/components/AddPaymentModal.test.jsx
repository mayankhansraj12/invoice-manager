import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AddPaymentModal from './AddPaymentModal';

describe('AddPaymentModal', () => {
  it('renders nothing while closed', () => {
    const { container } = render(
      <AddPaymentModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} balanceDue={100} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the balance as the maximum amount when open', () => {
    render(<AddPaymentModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} balanceDue={1250} />);

    expect(screen.getByText('Amount to Pay (Max: ₹1250.00)')).toBeInTheDocument();
  });
});
