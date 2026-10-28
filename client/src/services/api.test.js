import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addPayment, getInvoice } from './api';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('invoice API paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: {} });
    axios.post.mockResolvedValue({ data: {} });
  });

  it('encodes invoice numbers that contain path separators when fetching details', async () => {
    await getInvoice('INV/2025?draft');

    expect(axios.get.mock.calls[0][0]).toMatch(/\/api\/invoices\/INV%2F2025%3Fdraft$/);
  });

  it('encodes invoice numbers that contain path separators when recording payments', async () => {
    await addPayment('INV/2025', 10);

    expect(axios.post.mock.calls[0][0]).toMatch(/\/api\/invoices\/INV%2F2025\/payments$/);
  });
});
