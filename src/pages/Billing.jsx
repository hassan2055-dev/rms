import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Printer, Eye, X, DollarSign, Plus } from 'lucide-react';
import apiService from '../services/apiService';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingBill, setViewingBill] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBills();
    fetchOrders();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBills();
      if (response.success) {
        setBills(response.bills || []);
      }
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await apiService.getOrders();
      if (response.success) {
        setOrders(response.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setSelectedOrderId('');
    setPaymentMethod('cash');
    setError('');
    setSuccess('');
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setSelectedOrderId('');
    setPaymentMethod('cash');
    setError('');
    setSuccess('');
  };

  const getUnbilledOrders = () => {
    const billedOrderIds = new Set(bills.map(bill => bill.orderId));
    return orders.filter(order => !billedOrderIds.has(order.orderId));
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedOrderId) {
      setError('Please select an order');
      return;
    }

    try {
      setSubmitting(true);
      const billData = {
        orderId: parseInt(selectedOrderId),
        paymentMethod: paymentMethod
      };

      const response = await apiService.createBill(billData);

      if (response.success) {
        setSuccess('Bill created successfully!');
        setTimeout(() => {
          handleCloseCreateModal();
          fetchBills();
          fetchOrders();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to create bill. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = (bill) => {
    const printContent = `
========================================
DELICIOUS BITES RESTAURANT
========================================

Bill ID: ${bill.billId}
Order ID: ${bill.orderId}
Customer: ${bill.customerName}
Date: ${new Date(bill.date).toLocaleDateString()}
Time: ${new Date(bill.date).toLocaleTimeString()}

----------------------------------------
${bill.items ? bill.items.map(item => 
  `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
).join('\n') : 'Items not available'}
----------------------------------------

Total Amount: $${bill.amount.toFixed(2)}
Payment Method: ${bill.paymentMethod}

========================================
Thank you for dining with us!
========================================
    `;
    
    alert('Print Preview:\n' + printContent);
  };

  const viewBillDetails = async (bill) => {
    try {
      const response = await apiService.getBill(bill.billId);
      if (response.success) {
        setViewingBill(response.bill);
      }
    } catch (err) {
      console.error('Error fetching bill details:', err);
      setViewingBill(bill);
    }
  };

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const averageBill = bills.length > 0 ? totalRevenue / bills.length : 0;
  const unbilledOrders = getUnbilledOrders();

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
                <button
                  onClick={handleOpenCreateModal}
                  className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  <Plus size={20} />
                  Create Bill
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700 mb-1">Unbilled Orders</p>
                  <p className="text-2xl font-bold text-amber-600">{unbilledOrders.length}</p>
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
                      Customer
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
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-neutral-600">
                        Loading bills...
                      </td>
                    </tr>
                  ) : bills.length === 0 ? (
                    <tr>
                      <td colSpan="7">
                        <div className="text-center py-16">
                          <DollarSign size={48} className="text-neutral-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No bills present</h3>
                          <p className="text-neutral-600 mb-4">Create your first bill from an order.</p>
                          <button
                            onClick={handleOpenCreateModal}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                          >
                            Create Bill
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill) => (
                      <tr key={bill.billId} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-neutral-900 text-sm">#{bill.billId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-neutral-900 text-sm">#{bill.orderId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-neutral-900 text-sm">{bill.customerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-neutral-900">${bill.amount.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {bill.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900">{new Date(bill.date).toLocaleDateString()}</div>
                          <div className="text-xs text-neutral-500">{new Date(bill.date).toLocaleTimeString()}</div>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Create Bill Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900">Create New Bill</h3>
              <button
                onClick={handleCloseCreateModal}
                className="text-neutral-500 hover:text-neutral-700 p-1 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleCreateBill}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Select Order *
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose an order...</option>
                  {unbilledOrders.map((order) => (
                    <option key={order.orderId} value={order.orderId}>
                      Order #{order.orderId} - {order.customerName} - ${order.totalAmount.toFixed(2)}
                    </option>
                  ))}
                </select>
                {unbilledOrders.length === 0 && (
                  <p className="text-xs text-neutral-600 mt-2">No unbilled orders available. All orders have been billed.</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="credit card">Credit Card</option>
                  <option value="debit card">Debit Card</option>
                  <option value="mobile payment">Mobile Payment</option>
                </select>
              </div>

              {selectedOrderId && (
                <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-neutral-900 mb-2">Order Preview</h4>
                  {(() => {
                    const selectedOrder = orders.find(o => o.orderId === parseInt(selectedOrderId));
                    return selectedOrder ? (
                      <div>
                        <p className="text-sm text-neutral-700">Customer: {selectedOrder.customerName}</p>
                        <p className="text-sm text-neutral-700">Items: {selectedOrder.items?.length || 0}</p>
                        <p className="text-lg font-bold text-emerald-600 mt-2">Total: ${selectedOrder.totalAmount.toFixed(2)}</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || unbilledOrders.length === 0}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create Bill'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Details Modal */}
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
                <p className="font-semibold text-neutral-900">#{viewingBill.billId}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Order ID</p>
                <p className="font-semibold text-neutral-900">#{viewingBill.orderId}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Customer</p>
                <p className="font-semibold text-neutral-900">{viewingBill.customerName}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Date</p>
                <p className="font-semibold text-neutral-900">{new Date(viewingBill.date).toLocaleDateString()}</p>
              </div>
            </div>

            {viewingBill.items && viewingBill.items.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-neutral-900 mb-3 pb-2 border-b border-neutral-200">Items</h4>
                <div className="space-y-3">
                  {viewingBill.items.map((item, index) => (
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
                  ${viewingBill.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Payment Method</span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
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
