import { format } from 'date-fns';
import { company } from '../config/company';

const addressLines = (address = '') =>
    address
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

const Header = ({ invoice }) => {
    const statusColor = {
        DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
        PAID: 'bg-green-50 text-green-700 border-green-200',
        PARTIALLY_PAID: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        OVERDUE: 'bg-red-50 text-red-700 border-red-200'
    };

    return (
        <div className="mb-8">
            <div className="flex flex-col-reverse md:flex-row justify-between items-start mb-10">
                <div className="mt-6 md:mt-0">
                    <div className="flex items-center mb-2">
                        {/* Placeholder Logo */}
                        <div className="h-10 w-10 bg-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">
                            {company.name.charAt(0)}
                        </div>
                        <span className="font-extrabold text-2xl tracking-tight text-gray-900">{company.name}</span>
                    </div>
                    <div className="text-gray-500 text-sm leading-relaxed ml-1">
                        {company.addressLines.map((line) => (
                            <p key={line}>{line}</p>
                        ))}
                        <p className="mt-2 text-blue-600">{company.email}</p>
                        <p>GSTIN: {company.gstin}</p>
                    </div>
                </div>
                
                <div className="text-right">
                    <h1 className="text-5xl font-extralight text-gray-200 tracking-wider mb-2">INVOICE</h1>
                    <div className="flex flex-col items-end space-y-1">
                        <div className="text-gray-900 font-semibold text-lg">#{invoice.invoiceNumber}</div>
                        <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide ${statusColor[invoice.status] || 'bg-gray-100 text-gray-800'}`}>
                            {invoice.status.replace('_', ' ')}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-gray-100 py-8">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bill To</h3>
                    <div className="text-gray-900">
                        <p className="font-bold text-lg mb-1">{invoice.customerName}</p>
                        {addressLines(invoice.customerAddress).map((line, index) => (
                            <p key={index} className="text-gray-500 text-sm">{line}</p>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Date Issued</h3>
                        <p className="text-gray-900 font-medium">{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Due Date</h3>
                        <p className="text-gray-900 font-medium">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="col-span-2 mt-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount Due</h3>
                        <p className="text-2xl font-bold text-gray-900">₹{invoice.balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
