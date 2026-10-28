import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { formatDate } from '../utils/format';
import * as api from '../services/api';
import Header from '../components/Header';
import LineItemsTable from '../components/LineItemsTable';
import TotalsSection from '../components/TotalsSection';
import PaymentsList from '../components/PaymentsList';
import AddPaymentModal from '../components/AddPaymentModal';
import { company } from '../config/company';

const InvoiceDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Refreshes update the page in place; only the first load replaces it with a placeholder
  const loadInvoice = useCallback(async () => {
    try {
      setData(await api.getInvoice(id));
      setLoadError(null);
    } catch (err) {
      setLoadError(err.response?.status === 404 ? 'not-found' : 'failed');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setData(null);
    setLoading(true);
    loadInvoice();
  }, [loadInvoice]);

  const handleAddPayment = async (amount) => {
    await api.addPayment(id, amount);
    setIsPaymentModalOpen(false);
    await loadInvoice();
  };

  const changeArchiveState = async (request, failureMessage) => {
    setActionError(null);
    try {
      await request(id);
      await loadInvoice();
    } catch {
      setActionError(failureMessage);
    }
  };

  const handleArchive = () =>
    changeArchiveState(api.archiveInvoice, 'Could not archive this invoice. Try again.');

  const handleRestore = () =>
    changeArchiveState(api.restoreInvoice, 'Could not restore this invoice. Try again.');

  if (loading)
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (loadError === 'not-found') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-700">
        <p className="text-lg font-medium">Invoice not found</p>
        <Link to="/" className="mt-2 text-blue-600 hover:text-blue-800">
          Back to Dashboard
        </Link>
      </div>
    );
  }
  if (loadError)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        Failed to load invoice details
      </div>
    );
  if (!data) return null;

  const { invoice, lines, payments } = data;
  const canRecordPayment = !invoice.isArchived && invoice.balanceDue > 0;

  return (
    <>
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans print:bg-white print:p-0">
        <div className="max-w-4xl mx-auto space-y-8 print:max-w-none print:space-y-0">
          {/* Action Bar - Hidden in Print */}
          <div className="print:hidden">
            <div className="flex justify-between items-center">
              <Link
                to="/"
                className="text-gray-500 hover:text-gray-700 flex items-center transition-colors"
              >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Dashboard
              </Link>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 shadow-sm transition-all flex items-center"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print
                </button>
                {invoice.isArchived ? (
                  <button
                    onClick={handleRestore}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 shadow-sm transition-all"
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={handleArchive}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-all"
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
            {actionError && (
              <p role="alert" className="mt-3 text-right text-sm text-red-600">
                {actionError}
              </p>
            )}
          </div>

          {/* Invoice Paper Document */}
          <div className="relative bg-white shadow-2xl rounded-none sm:rounded-lg overflow-hidden print:shadow-none print:rounded-none">
            <div className="p-8 sm:p-12 print:p-0">
              {/* Status Watermark for specific states */}
              {invoice.status === 'PAID' && (
                <div className="absolute top-10 right-10 p-4 opacity-10 pointer-events-none hidden sm:block">
                  <span className="text-9xl font-black text-green-600 uppercase transform -rotate-12 border-8 border-green-600 p-4 rounded-xl">
                    PAID
                  </span>
                </div>
              )}

              <Header invoice={invoice} />

              <div className="mt-8">
                <LineItemsTable lines={lines} />
              </div>

              <div className="mt-4 border-t border-gray-100 pt-8">
                <TotalsSection invoice={invoice} />
              </div>

              {/* Terms & Footer */}
              <div className="mt-12 pt-8 border-t-2 border-gray-100 text-gray-500 text-sm">
                <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                <p className="mb-1">Payment is due by {formatDate(invoice.dueDate)}.</p>
                <p>Please make checks payable to {company.paymentPayableTo}.</p>
              </div>
            </div>
          </div>

          {/* Payment History Section (Separate from Invoice) */}
          <div className="mt-8 print:hidden">
            <h3 className="text-lg font-medium text-gray-900 mb-4 px-2">Payment History</h3>
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden p-6">
              <PaymentsList
                payments={payments}
                canAddPayment={canRecordPayment}
                onAddPayment={() => setIsPaymentModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSubmit={handleAddPayment}
        balanceDue={invoice.balanceDue}
      />
    </>
  );
};

export default InvoiceDetails;
