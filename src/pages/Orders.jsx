import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Eye, X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchMenu();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrders();
      if (response.success) {
        setOrders(response.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await apiService.getMenu();
      if (response.success) {
        setMenuItems(response.menu || []);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setCustomerName('');
    setSelectedItems([]);
    setError('');
    setSuccess('');
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCustomerName('');
    setCustomerPhone('');
    setSelectedItems([]);
    setError('');
    setSuccess('');
  };

  const addItemToOrder = (menuItem) => {
    const existingItem = selectedItems.find(item => item.itemId === menuItem.id);
    if (existingItem) {
      setSelectedItems(selectedItems.map(item =>
        item.itemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedItems([...selectedItems, {
        itemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }]);
    }
  };

  const updateItemQuantity = (itemId, change) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.itemId === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeItem = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!customerName.trim()) {
      setError('Please enter customer name');
      return;
    }

    if (selectedItems.length === 0) {
      setError('Please add at least one item to the order');
      return;
    }

    if (!user || !user.id) {
      setError('Employee ID not found. Please login again.');
      return;
    }

    try {
      setSubmitting(true);
      const orderData = {
        customerName: customerName.trim(),
        phone: customerPhone.trim(),
        empId: user.id,
        items: selectedItems.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity
        }))
      };

      const response = await apiService.createOrder(orderData);

      if (response.success) {
        setSuccess('Order created successfully!');
        setTimeout(() => {
          handleCloseCreateModal();
          fetchOrders();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      setDeleting(true);
      setError('');
      
      const response = await apiService.deleteOrder(orderToDelete.orderId);
      
      if (response.success) {
        setSuccess('Order deleted successfully!');
        setShowDeleteModal(false);
        setOrderToDelete(null);
        fetchOrders();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Failed to delete order');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete order. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Orders Management" />
        <main className="flex-1 overflow-y-auto p-8">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-700 font-medium">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && !showDeleteModal && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Orders</h2>
                  <p className="text-neutral-600 text-sm mt-1">Track and manage customer orders</p>
                </div>
                <button
                  onClick={handleOpenCreateModal}
                  className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  <Plus size={20} />
                  Create Order
                </button>
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
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-neutral-600">
                        Loading orders...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <div className="text-center py-16">
                          <ShoppingBag size={48} className="text-neutral-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No orders present</h3>
                          <p className="text-neutral-600 mb-4">Create your first order to get started.</p>
                          <button
                            onClick={handleOpenCreateModal}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                          >
                            Create Order
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-neutral-900 text-sm">#{order.orderId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                              {order.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="font-medium text-neutral-900 text-sm">{order.customerName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900">{new Date(order.date).toLocaleDateString()}</div>
                          <div className="text-xs text-neutral-500">{new Date(order.date).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-600">{order.items?.length || 0} items</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-neutral-900">${order.totalAmount?.toFixed(2) || '0.00'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewingOrder(order)}
                              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(order)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 size={18} />
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

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900">Create New Order</h3>
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

            <form onSubmit={handleCreateOrder}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">Select Items</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 max-h-60 overflow-y-auto">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900 text-sm">{item.name}</p>
                        <p className="text-xs text-neutral-600">{item.category}</p>
                        <p className="text-sm font-semibold text-neutral-900 mt-1">${item.price.toFixed(2)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addItemToOrder(item)}
                        className="bg-neutral-900 hover:bg-neutral-800 text-white p-2 rounded-lg transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-neutral-900 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {selectedItems.map((item) => (
                      <div key={item.itemId} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900 text-sm">{item.name}</p>
                          <p className="text-xs text-neutral-600">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.itemId, -1)}
                            className="p-1 text-neutral-600 hover:bg-neutral-200 rounded"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-semibold text-neutral-900 w-8 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.itemId, 1)}
                            className="p-1 text-neutral-600 hover:bg-neutral-200 rounded"
                          >
                            <Plus size={16} />
                          </button>
                          <span className="font-semibold text-neutral-900 ml-2 w-20 text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.itemId)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded ml-2"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-between items-center">
                    <span className="text-lg font-bold text-neutral-900">Total:</span>
                    <span className="text-2xl font-bold text-emerald-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || selectedItems.length === 0}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create Order'}
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
                <p className="font-semibold text-neutral-900">#{viewingOrder.orderId}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Customer</p>
                <p className="font-semibold text-neutral-900">{viewingOrder.customerName}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Date</p>
                <p className="font-semibold text-neutral-900">{new Date(viewingOrder.date).toLocaleDateString()}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Time</p>
                <p className="font-semibold text-neutral-900">{new Date(viewingOrder.date).toLocaleTimeString()}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Employee</p>
                <p className="font-semibold text-neutral-900">{viewingOrder.empEmail || `ID: ${viewingOrder.empId}`}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Total Amount</p>
                <p className="font-bold text-lg text-neutral-900">${viewingOrder.totalAmount?.toFixed(2) || '0.00'}</p>
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
                      <p className="font-semibold text-neutral-900">${(item.total || (item.price * item.quantity)).toFixed(2)}</p>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Delete Order</h3>
                <p className="text-neutral-600">
                  Are you sure you want to delete order <span className="font-semibold">#{orderToDelete?.orderId}</span> for <span className="font-semibold">{orderToDelete?.customerName}</span>?
                </p>
                <p className="text-sm text-red-600 mt-2">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
