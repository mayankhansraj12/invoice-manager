import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/invoices`;

export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong';

export const getInvoices = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getInvoice = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const addPayment = async (id, amount) => {
  const response = await axios.post(`${API_URL}/${id}/payments`, { amount });
  return response.data;
};

export const archiveInvoice = async (id) => {
  const response = await axios.post(`${API_URL}/archive`, { id });
  return response.data;
};

export const restoreInvoice = async (id) => {
  const response = await axios.post(`${API_URL}/restore`, { id });
  return response.data;
};
