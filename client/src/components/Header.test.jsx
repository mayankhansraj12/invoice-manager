import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from './Header';
import { company } from '../config/company';

const baseInvoice = {
  invoiceNumber: 'INV-2024-002',
  customerName: 'Tata Consultancy Services',
  issueDate: '2024-02-01T00:00:00.000Z',
  dueDate: '2024-02-15T00:00:00.000Z',
  status: 'PARTIALLY_PAID',
  balanceDue: 75000,
};

describe('Header bill-to block', () => {
  it('shows the customer address stored on the invoice, one line per newline', () => {
    render(
      <Header
        invoice={{
          ...baseInvoice,
          customerAddress: '105, Koramangala 4th Block\nBengaluru, Karnataka 560034',
        }}
      />,
    );

    expect(screen.getByText('105, Koramangala 4th Block')).toBeInTheDocument();
    expect(screen.getByText('Bengaluru, Karnataka 560034')).toBeInTheDocument();
  });

  it('prints the issuer name, address and GSTIN from the company configuration', () => {
    render(<Header invoice={baseInvoice} />);

    expect(screen.getByText(company.name)).toBeInTheDocument();
    expect(screen.getByText(company.addressLines[0])).toBeInTheDocument();
    expect(screen.getByText(`GSTIN: ${company.gstin}`)).toBeInTheDocument();
  });

  it('does not show an address when the invoice has none', () => {
    render(<Header invoice={baseInvoice} />);

    expect(screen.getByText('Tata Consultancy Services')).toBeInTheDocument();
    expect(screen.queryByText(/Koramangala/)).not.toBeInTheDocument();
  });
});
