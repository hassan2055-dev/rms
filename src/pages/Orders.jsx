import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Filter, Trash2, Eye, X, ShoppingBag } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewingOrder, setViewingOrder] = useState(null);

  const statuses = ['All', 'Pending', 'Preparing', 'Served', 'Cancelled'];

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const deleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders(orders.filter(order => order.id !== orderId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Served': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Preparing': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pending': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Orders Management" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Orders</h2>
                  <p className="text-neutral-600 text-sm mt-1">Track and manage customer orders</p>
                </div>
                <div className="flex items-center gap-2 text-neutral-600 text-sm">
                  <Filter size={18} />
                  <span className="font-medium">Filter:</span>
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="flex gap-2 flex-wrap">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filterStatus === status
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-neutral-900 text-sm">{order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {order.customer.charAt(0)}
                          </div>
                          <div className="font-medium text-neutral-900 text-sm">{order.customer}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{order.date}</div>
                        <div className="text-xs text-neutral-500">{order.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-neutral-900">${order.total.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border focus:ring-2 focus:ring-neutral-500 ${getStatusColor(order.status)}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Served">Served</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag size={48} className="text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">No orders present</h3>
                  <p className="text-neutral-600">Orders will appear here once customers place them.</p>
                </div>
              ) : filteredOrders.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-block p-6 bg-neutral-100 rounded-xl mb-3">
                    <span className="text-4xl">📋</span>
                  </div>
                  <p className="text-neutral-500 font-medium">No orders found for the selected filter.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900">Order Details</h3>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-neutral-500 hover:text-neutral-700 p-1 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Order ID</p>
                <p className="font-semibold text-neutral-900">{viewingOrder.id}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Customer</p>
                <p className="font-semibold text-neutral-900">{viewingOrder.customer}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Date</p>
                <p className="font-semibold text-neutral-900">{viewingOrder.date}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Time</p>
                <p className="font-semibold text-neutral-900">{viewingOrder.time}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-lg border ${getStatusColor(viewingOrder.status)}`}>
                  {viewingOrder.status}
                </span>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Total Amount</p>
                <p className="font-bold text-lg text-neutral-900">${viewingOrder.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <h4 className="font-semibold text-neutral-900 mb-4">Order Items</h4>
              <div className="space-y-3">
                {viewingOrder.items && viewingOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-neutral-50 p-4 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-900 text-sm">{item.name}</p>
                      <p className="text-xs text-neutral-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-neutral-600">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <button
                onClick={() => setViewingOrder(null)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;