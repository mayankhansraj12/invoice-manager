
import { formatAmount } from '../utils/format';

const TotalsSection = ({ invoice }) => {
    return (
        <div className="flex justify-end">
            <div className="w-full md:w-1/2 lg:w-5/12 space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">₹{formatAmount(invoice.total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Tax (0%)</span>
                    <span className="font-medium text-gray-900">₹0.00</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Amount Paid</span>
                    <span className="font-medium text-green-600">-₹{formatAmount(invoice.amountPaid)}</span>
                </div>
                <div className="border-t-2 border-gray-900 pt-3 flex justify-between items-end">
                    <span className="font-bold text-gray-900 text-lg">Balance Due</span>
                    <span className="font-bold text-gray-900 text-2xl">₹{formatAmount(invoice.balanceDue)}</span>
                </div>
            </div>
        </div>
    );
};

export default TotalsSection;
