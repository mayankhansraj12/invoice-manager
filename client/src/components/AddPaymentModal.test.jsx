import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AddPaymentModal from './AddPaymentModal';

const serverError = (message) =>
  Object.assign(new Error('Request failed with status code 409'), {
    response: { data: { message } },
  });

describe('AddPaymentModal', () => {
  it('renders nothing while closed', () => {
    const { container } = render(
      <AddPaymentModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} balanceDue={100} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the balance as the maximum amount when open', () => {
    render(<AddPaymentModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} balanceDue={1250} />);

    expect(screen.getByText('Amount to Pay (Max: ₹1,250.00)')).toBeInTheDocument();
  });

  it('clears the amount after a successful submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AddPaymentModal isOpen onClose={vi.fn()} onSubmit={onSubmit} balanceDue={500} />);

    await user.type(screen.getByRole('spinbutton'), '100');
    await user.click(screen.getByRole('button', { name: 'Confirm Payment' }));

    await waitFor(() => expect(screen.getByRole('spinbutton')).toHaveValue(null));
    expect(onSubmit).toHaveBeenCalledWith(100);
  });

  it('keeps the entered amount and shows the server message when submission fails', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(serverError('Invoice is archived'));
    render(<AddPaymentModal isOpen onClose={vi.fn()} onSubmit={onSubmit} balanceDue={500} />);

    await user.type(screen.getByRole('spinbutton'), '100');
    await user.click(screen.getByRole('button', { name: 'Confirm Payment' }));

    expect(await screen.findByText('Invoice is archived')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(100);
  });

  it('does not submit an amount above the balance', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddPaymentModal isOpen onClose={vi.fn()} onSubmit={onSubmit} balanceDue={500} />);

    await user.type(screen.getByRole('spinbutton'), '600');
    await user.click(screen.getByRole('button', { name: 'Confirm Payment' }));

    expect(screen.getByText('Amount cannot exceed balance due')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('asks for an amount greater than zero when none is entered', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddPaymentModal isOpen onClose={vi.fn()} onSubmit={onSubmit} balanceDue={500} />);

    await user.click(screen.getByRole('button', { name: 'Confirm Payment' }));

    expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('is announced as a named dialog and closes when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddPaymentModal isOpen onClose={onClose} onSubmit={vi.fn()} balanceDue={500} />);

    expect(screen.getByRole('dialog', { name: 'Record Payment' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('associates the amount label with its input and names the close button', () => {
    render(<AddPaymentModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} balanceDue={500} />);

    expect(screen.getByLabelText('Amount to Pay (Max: ₹500.00)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});
