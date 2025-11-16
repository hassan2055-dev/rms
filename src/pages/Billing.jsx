import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Printer, Eye, X } from 'lucide-react';
import { billsData as initialBillsData } from '../data/billsData';
import { ordersData } from '../data/ordersData';

const Billing = () => {
  const [bills] = useState(initialBillsData);
  const [viewingBill, setViewingBill] = useState(null);

  const handlePrint = (bill) => {
    const order = ordersData.find(o => o.id === bill.orderId);
    
    const printContent = `
      ========================================
      DELICIOUS BITES RESTAURANT
      ========================================
      
      Bill ID: ${bill.id}
      Order ID: ${bill.orderId}
      Date: ${bill.date}
      Time: ${bill.time}
      
      ----------------------------------------
      ${order ? order.items.map(item => 
        `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
      ).join('\n') : 'Items not available'}
      ----------------------------------------
      
      Total Amount: $${bill.total.toFixed(2)}
      Payment Method: ${bill.paymentMethod}
      
      ========================================
      Thank you for dining with us!
      ========================================
    `;
    
    alert('Print Preview:\n' + printContent);
  };

  const viewBillDetails = (bill) => {
    const order = ordersData.find(o => o.id === bill.orderId);
    setViewingBill({ ...bill, order });
  };

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);
  const averageBill = bills.length > 0 ? totalRevenue / bills.length : 0;

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Billing & Payments" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Billing</h2>
                  <p className="text-neutral-600 text-sm mt-1">View and manage bills and payments</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                  <p className="text-xs text-neutral-600 mb-1">Total Bills</p>
                  <p className="text-2xl font-bold text-neutral-900">{bills.length}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <p className="text-xs text-emerald-700 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 mb-1">Average Bill</p>
                  <p className="text-2xl font-bold text-blue-600">${averageBill.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Bill ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-neutral-900 text-sm">{bill.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-neutral-900 text-sm">{bill.orderId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-neutral-900">${bill.total.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          bill.paymentMethod === 'Cash' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {bill.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{bill.date}</div>
                        <div className="text-xs text-neutral-500">{bill.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewBillDetails(bill)}
                            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handlePrint(bill)}
                            className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Print Bill"
                          >
                            <Printer size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bills.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-block p-6 bg-neutral-100 rounded-xl mb-3">
                    <span className="text-4xl">🧾</span>
                  </div>
                  <p className="text-neutral-500 font-medium">No bills found.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {viewingBill && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900">Bill Details</h3>
              <button
                onClick={() => setViewingBill(null)}
                className="text-neutral-500 hover:text-neutral-700 p-1 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="text-center mb-6 pb-6 border-b border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900">DELICIOUS BITES</h2>
              <p className="text-sm text-neutral-600 mt-1">Fine Dining Experience</p>
              <p className="text-xs text-neutral-500 mt-1">123 Food Street, Culinary City</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Bill ID</p>
                <p className="font-semibold text-neutral-900">{viewingBill.id}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Order ID</p>
                <p className="font-semibold text-neutral-900">{viewingBill.orderId}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Date</p>
                <p className="font-semibold text-neutral-900">{viewingBill.date}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Time</p>
                <p className="font-semibold text-neutral-900">{viewingBill.time}</p>
              </div>
            </div>

            {viewingBill.order && (
              <div className="mb-6">
                <h4 className="font-semibold text-neutral-900 mb-3 pb-2 border-b border-neutral-200">Items</h4>
                <div className="space-y-3">
                  {viewingBill.order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-neutral-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-900 text-sm">{item.name}</p>
                        <p className="text-xs text-neutral-600">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-neutral-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-neutral-200 pt-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-neutral-900">Total Amount</span>
                <span className="text-2xl font-bold text-emerald-600">
                  ${viewingBill.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Payment Method</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  viewingBill.paymentMethod === 'Cash' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {viewingBill.paymentMethod}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handlePrint(viewingBill)}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                <Printer size={18} />
                Print Bill
              </button>
              <button
                onClick={() => setViewingBill(null)}
                className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 py-3 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>

            <p className="text-center text-xs text-neutral-500 mt-4">
              Thank you for dining with us!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;