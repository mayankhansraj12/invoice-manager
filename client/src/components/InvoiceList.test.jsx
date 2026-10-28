import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '../services/api';
import InvoiceList from './InvoiceList';

vi.mock('../services/api', () => ({
  getInvoices: vi.fn(),
}));

const makeInvoice = (fields) => ({
  issueDate: '2025-01-10T00:00:00.000Z',
  dueDate: '2025-02-10T00:00:00.000Z',
  status: 'DRAFT',
  total: 0,
  amountPaid: 0,
  balanceDue: 0,
  isArchived: false,
  ...fields,
});

const renderList = () =>
  render(
    <MemoryRouter>
      <InvoiceList />
    </MemoryRouter>,
  );

describe('InvoiceList', () => {
  beforeEach(() => {
    api.getInvoices.mockResolvedValue([
      makeInvoice({
        _id: '1',
        invoiceNumber: 'INV-1',
        customerName: 'Active Co',
        total: 50000,
      }),
      makeInvoice({
        _id: '2',
        invoiceNumber: 'INV-2',
        customerName: 'Archived Co',
        total: 20000,
        amountPaid: 5000,
        isArchived: true,
      }),
    ]);
  });

  it('leaves archived invoices out of the list and the totals by default', async () => {
    renderList();

    expect(await screen.findByText('Active Co')).toBeInTheDocument();
    expect(screen.queryByText('Archived Co')).not.toBeInTheDocument();
    expect(screen.getByText('1 Total')).toBeInTheDocument();

    await waitFor(() => expect(screen.getAllByText('50,000')).toHaveLength(2), { timeout: 4000 });
    expect(screen.queryByText('70,000')).not.toBeInTheDocument();
  });

  it('lists archived invoices with a marker when the toggle is switched on', async () => {
    const user = userEvent.setup();
    renderList();
    await screen.findByText('Active Co');

    await user.click(screen.getByLabelText('Show archived'));

    expect(screen.getByText('Archived Co')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
    expect(screen.getByText('2 Total')).toBeInTheDocument();
  });
});
