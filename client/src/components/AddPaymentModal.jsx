import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getErrorMessage } from '../services/api';
import { formatAmount } from '../utils/format';

const AddPaymentModal = ({ isOpen, onClose, onSubmit, balanceDue }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (!val || val <= 0) {
            setError('Amount must be greater than 0');
            return;
        }
        if (val > balanceDue) {
            setError('Amount cannot exceed balance due');
            return;
        }

        setError('');
        setSubmitting(true);
        try {
            await onSubmit(val);
            setAmount('');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="record-payment-title"
                className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
            >
                <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h2 id="record-payment-title" className="text-xl font-bold mb-4">
                    Record Payment
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="payment-amount"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Amount to Pay (Max: ₹{formatAmount(balanceDue)})
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                            </div>
                            <input
                                id="payment-amount"
                                type="number"
                                step="0.01"
                                autoFocus
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Confirm Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentModal;
