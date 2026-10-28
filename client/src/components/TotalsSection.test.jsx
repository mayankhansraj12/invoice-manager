import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TotalsSection from './TotalsSection';

const invoice = (fields) => ({ total: 1000, amountPaid: 0, balanceDue: 1000, ...fields });

describe('TotalsSection', () => {
  it('shows no minus sign on the amount paid row when nothing has been paid', () => {
    render(<TotalsSection invoice={invoice({})} />);

    const row = screen.getByText('Amount Paid').parentElement;
    expect(row).toHaveTextContent('₹0.00');
    expect(row).not.toHaveTextContent('-₹');
  });

  it('shows a minus sign on the amount paid row once a payment is recorded', () => {
    render(<TotalsSection invoice={invoice({ amountPaid: 500, balanceDue: 500 })} />);

    expect(screen.getByText('Amount Paid').parentElement).toHaveTextContent('-₹500.00');
  });
});
