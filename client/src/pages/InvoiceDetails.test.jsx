import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '../services/api';
import InvoiceDetails from './InvoiceDetails';

vi.mock('../services/api', () => ({
  getInvoice: vi.fn(),
  addPayment: vi.fn(),
  archiveInvoice: vi.fn(),
  restoreInvoice: vi.fn(),
  getErrorMessage: (error) => error.response?.data?.message || error.message,
}));

const httpError = (status) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    response: { status, data: {} },
  });

const detail = (invoice = {}) => ({
  invoice: {
    _id: 'abc',
    invoiceNumber: 'INV-1',
    customerName: 'Acme Ltd',
    issueDate: '2025-01-10T00:00:00.000Z',
    dueDate: '2025-02-10T12:00:00.000Z',
    status: 'PARTIALLY_PAID',
    total: 1000,
    amountPaid: 400,
    balanceDue: 600,
    isArchived: false,
    ...invoice,
  },
  lines: [{ _id: 'l1', description: 'Consulting', quantity: 1, unitPrice: 1000, lineTotal: 1000 }],
  payments: [],
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/invoices/INV-1']}>
      <Routes>
        <Route path="/invoices/:id" element={<InvoiceDetails />} />
      </Routes>
    </MemoryRouter>,
  );

describe('InvoiceDetails', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.getInvoice.mockResolvedValue(detail());
  });

  it('shows a not-found message when the invoice does not exist', async () => {
    api.getInvoice.mockRejectedValue(httpError(404));

    renderPage();

    expect(await screen.findByText('Invoice not found')).toBeInTheDocument();
    expect(screen.queryByText('Failed to load invoice details')).not.toBeInTheDocument();
  });

  it('shows a generic failure message for other errors', async () => {
    api.getInvoice.mockRejectedValue(httpError(500));

    renderPage();

    expect(await screen.findByText('Failed to load invoice details')).toBeInTheDocument();
  });

  it('keeps the invoice on screen while it refreshes after a payment', async () => {
    const user = userEvent.setup();
    let resolveRefresh;
    api.getInvoice
      .mockResolvedValueOnce(detail())
      .mockReturnValueOnce(new Promise((resolve) => (resolveRefresh = resolve)));
    api.addPayment.mockResolvedValue({});

    renderPage();
    await screen.findByText('Acme Ltd');
    await user.click(screen.getByRole('button', { name: 'Add Payment' }));
    await user.type(screen.getByRole('spinbutton'), '100');
    await user.click(screen.getByRole('button', { name: 'Confirm Payment' }));

    await waitFor(() => expect(api.getInvoice).toHaveBeenCalledTimes(2));
    expect(screen.getByText('Acme Ltd')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

    resolveRefresh(detail());
  });

  it('states the invoice due date in the terms instead of a fixed number of days', async () => {
    renderPage();

    expect(await screen.findByText('Payment is due by Feb 10, 2025.')).toBeInTheDocument();
    expect(screen.queryByText(/15 days/)).not.toBeInTheDocument();
  });

  it('enables Add Payment for an open invoice with a balance', async () => {
    renderPage();

    expect(await screen.findByRole('button', { name: 'Add Payment' })).toBeEnabled();
  });

  it('disables Add Payment once the balance is cleared', async () => {
    api.getInvoice.mockResolvedValue(detail({ status: 'PAID', amountPaid: 1000, balanceDue: 0 }));

    renderPage();

    expect(await screen.findByRole('button', { name: 'Add Payment' })).toBeDisabled();
  });

  it('disables Add Payment for an archived invoice', async () => {
    api.getInvoice.mockResolvedValue(detail({ isArchived: true }));

    renderPage();

    expect(await screen.findByRole('button', { name: 'Add Payment' })).toBeDisabled();
  });

  it('renders the payment dialog outside the spaced page layout so its backdrop covers the viewport', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Add Payment' }));

    expect(screen.getByRole('dialog').closest('.space-y-8')).toBeNull();
  });

  it('tells the user when archiving fails', async () => {
    const user = userEvent.setup();
    api.archiveInvoice.mockRejectedValue(httpError(500));

    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Archive' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not archive this invoice. Try again.',
    );
  });
});
