import { formatAmount } from '../utils/format';

const LineItemsTable = ({ lines }) => {
  return (
    <div className="overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th
              scope="col"
              className="py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
            >
              Description
            </th>
            <th
              scope="col"
              className="py-3 text-right text-xs font-bold text-gray-800 uppercase tracking-wider"
            >
              Qty
            </th>
            <th
              scope="col"
              className="py-3 text-right text-xs font-bold text-gray-800 uppercase tracking-wider"
            >
              Price
            </th>
            <th
              scope="col"
              className="py-3 text-right text-xs font-bold text-gray-800 uppercase tracking-wider"
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {lines.map((line) => (
            <tr key={line._id} className="border-b border-gray-100 last:border-0">
              <td className="py-4 text-sm text-gray-900 font-medium">{line.description}</td>
              <td className="py-4 text-sm text-gray-500 text-right">{line.quantity}</td>
              <td className="py-4 text-sm text-gray-500 text-right">
                ₹{formatAmount(line.unitPrice)}
              </td>
              <td className="py-4 text-sm font-bold text-gray-900 text-right">
                ₹{formatAmount(line.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LineItemsTable;
