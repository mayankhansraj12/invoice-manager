import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../services/api';
import Header from '../components/Header';
import LineItemsTable from '../components/LineItemsTable';
import TotalsSection from '../components/TotalsSection';
import PaymentsList from '../components/PaymentsList';
import AddPaymentModal from '../components/AddPaymentModal';

const InvoiceDetails = () => {
    // ... params, state ...
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // ... fetchData, effects, handlers ...

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await api.getInvoice(id);
            setData(result);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load invoice details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const handleAddPayment = async (amount) => {
        try {
            await api.addPayment(id, amount);
            await fetchData(); // Refresh data
            setIsPaymentModalOpen(false);
        } catch (err) {
            console.error('Failed to add payment: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleArchive = async () => {
        // Removed confirmation as requested
        try {
            await api.archiveInvoice(id);
            await fetchData();
        } catch (err) {
            console.error('Failed to archive invoice');
        }
    };

    const handleRestore = async () => {
        try {
            await api.restoreInvoice(id);
            await fetchData();
        } catch (err) {
            console.error('Failed to restore invoice');
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center min-h-screen text-red-600">{error}</div>;
    if (!data) return null;

    const { invoice, lines, payments } = data;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans print:bg-white print:p-0">
            <div className="max-w-4xl mx-auto space-y-8 print:max-w-none print:space-y-0">
                {/* Action Bar - Hidden in Print */}
                <div className="flex justify-between items-center print:hidden">
                    <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center transition-colors">
                        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 shadow-sm transition-all flex items-center"
                        >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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

                {/* Invoice Paper Document */}
                <div className="bg-white shadow-2xl rounded-none sm:rounded-lg overflow-hidden print:shadow-none print:rounded-none">
                    <div className="p-8 sm:p-12 print:p-0">
                        {/* Status Watermark for specific states */}
                        {invoice.status === 'PAID' && (
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none hidden sm:block">
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
                            <p className="mb-1">Payment is due within 15 days.</p>
                            <p>Please make checks payable to TechSolutions India Pvt Ltd.</p>
                        </div>
                    </div>
                </div>

                {/* Payment History Section (Separate from Invoice) */}
                <div className="mt-8 print:hidden">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 px-2">Payment History</h3>
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden p-6">
                        <PaymentsList payments={payments} onAddPayment={() => setIsPaymentModalOpen(true)} />
                    </div>
                </div>

                <AddPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSubmit={handleAddPayment}
                    balanceDue={invoice.balanceDue}
                />
            </div>
        </div>
    );
};

export default InvoiceDetails;
