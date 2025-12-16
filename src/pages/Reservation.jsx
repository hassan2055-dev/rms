import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { X, Calendar, Users, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';

const Reservation = () => {
  const { user } = useAuth();
  const isStaff = user && (user.role === 'admin' || user.role === 'cashier');
  
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState('credit card');
  const [paymentAmount, setPaymentAmount] = useState(2.00);
  const [specialRequests, setSpecialRequests] = useState('');
  const [empId, setEmpId] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTables();
      if (response.success) {
        setTables(response.tables);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('Failed to load tables. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (table) => {
    // Staff can click reserved tables to remove reservation
    if (isStaff && table.status === 'reserved') {
      setTableToDelete(table);
      setShowDeleteModal(true);
    } else if (table.status === 'available') {
      setSelectedTable(table);
      setShowModal(true);
      setError('');
      setSuccess('');
      setCustomerName('');
      setCustomerPhone('');
      setReservationDate('');
      setPartySize(2);
      setPaymentMethod('credit card');
      setPaymentAmount(table.price || 2.00); // Set based on table price
      setSpecialRequests('');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTable(null);
    setCustomerName('');
    setCustomerPhone('');
    setReservationDate('');
    setPartySize(2);
    setPaymentMethod('credit card');
    setPaymentAmount(2.00);
    setSpecialRequests('');
    setError('');
    setSuccess('');
  };

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!customerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!reservationDate) {
      setError('Please select a reservation date');
      return;
    }

    if (partySize < 1) {
      setError('Party size must be at least 1');
      return;
    }

    if (selectedTable && partySize > selectedTable.capacity) {
      setError(`Party size (${partySize}) exceeds table capacity (${selectedTable.capacity}). Please select a larger table.`);
      return;
    }

    if (paymentAmount <= 0) {
      setError('Payment amount must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiService.makeReservation({
        tableId: selectedTable.id,
        customerName: customerName.trim(),
        phone: customerPhone.trim(),
        reservationDate: reservationDate,
        partySize: partySize,
        paymentMethod: paymentMethod,
        paymentAmount: paymentAmount,
        specialRequests: specialRequests.trim(),
        empId: empId,
      });

      if (response.success) {
        setSuccess('Reservation successful!');
        setTimeout(() => {
          handleCloseModal();
          fetchTables(); // Refresh tables
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to reserve table. Please check your code and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReservation = async () => {
    if (!tableToDelete || !tableToDelete.reservationId) return;

    try {
      setDeleting(true);
      const response = await apiService.cancelReservation(tableToDelete.reservationId);

      if (response.success) {
        setShowDeleteModal(false);
        setTableToDelete(null);
        fetchTables(); // Refresh tables
      }
    } catch (err) {
      console.error('Error canceling reservation:', err);
      alert('Failed to cancel reservation. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setTableToDelete(null);
  };

  const getTableStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 hover:border-green-500 cursor-pointer';
      case 'reserved':
        return isStaff 
          ? 'bg-amber-100 border-amber-300 hover:border-red-400 cursor-pointer' 
          : 'bg-amber-100 border-amber-300 cursor-not-allowed';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getTableStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'reserved':
        return 'Reserved';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar title="Table Reservation" />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-neutral-600">Loading tables...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {isStaff ? (
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <Navbar title="Table Reservation" />
            <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">
              {isStaff ? 'Manage Table Reservations' : 'Reserve Your Table'}
            </h2>
            <p className="text-neutral-600">
              {isStaff 
                ? 'Click on reserved tables to remove reservations, or available tables to make new reservations' 
                : 'Select an available table to make your reservation'}
            </p>
          </div>

          {/* Legend */}
          <div className="flex gap-6 mb-8 p-4 bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
              <span className="text-sm text-neutral-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-100 border-2 border-amber-300 rounded"></div>
              <span className="text-sm text-neutral-600">Reserved</span>
            </div>
          </div>

          {/* Tables Grid */}
          {tables.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-neutral-200">
              <Calendar size={48} className="mx-auto text-neutral-400 mb-4" />
              <p className="text-neutral-600">No tables available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tables.map((table) => (
                <div
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 ${getTableStatusColor(
                    table.status
                  )}`}
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Users size={32} className="text-neutral-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Table {table.id}
                    </h3>
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded">
                        {table.category}
                      </span>
                    </div>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        table.status === 'available'
                          ? 'bg-green-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {getTableStatusText(table.status)}
                    </div>
                    {table.status === 'available' && (
                      <div className="mt-3 pt-3 border-t border-neutral-300">
                        <div className="flex justify-between text-xs text-neutral-600 mb-1">
                          <span>Capacity:</span>
                          <span className="font-semibold">{table.capacity} people</span>
                        </div>
                        <div className="flex justify-between text-xs text-neutral-600">
                          <span>Price:</span>
                          <span className="font-semibold text-amber-600">${table.price}</span>
                        </div>
                      </div>
                    )}
                    {table.status === 'reserved' && table.customerName && (
                      <div className="mt-3 pt-3 border-t border-neutral-300">
                        <p className="text-xs text-neutral-500">Reserved by</p>
                        <p className="text-sm font-medium text-neutral-700">
                          {table.customerName}
                        </p>
                        {isStaff && (
                          <p className="text-xs text-red-600 mt-2 font-medium">
                            Click to remove
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Navbar title="Table Reservation" />
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Reserve Your Table</h2>
                <p className="text-neutral-600">Select an available table to make your reservation</p>
              </div>

              {/* Legend */}
              <div className="flex gap-6 mb-8 p-4 bg-white rounded-lg shadow-sm border border-neutral-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                  <span className="text-sm text-neutral-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-100 border-2 border-amber-300 rounded"></div>
                  <span className="text-sm text-neutral-600">Reserved</span>
                </div>
              </div>

              {/* Tables Grid */}
              {tables.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-neutral-200">
                  <Calendar size={48} className="mx-auto text-neutral-400 mb-4" />
                  <p className="text-neutral-600">No tables available at the moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      onClick={() => handleTableClick(table)}
                      className={`p-6 rounded-lg border-2 transition-all duration-200 ${getTableStatusColor(
                        table.status
                      )}`}
                    >
                      <div className="text-center">
                        <div className="flex justify-center mb-4">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Users size={32} className="text-neutral-600" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">
                          Table {table.id}
                        </h3>
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            table.status === 'available'
                              ? 'bg-green-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {getTableStatusText(table.status)}
                        </div>
                        {table.status === 'reserved' && table.customerName && (
                          <div className="mt-3 pt-3 border-t border-neutral-300">
                            <p className="text-xs text-neutral-500">Reserved by</p>
                            <p className="text-sm font-medium text-neutral-700">
                              {table.customerName}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Reservation Modal */}
      {showModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Reserve Table {selectedTable.id}
                </h3>
                <div className="flex gap-3 mt-2">
                  <span className="inline-block px-2 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded">
                    {selectedTable.category}
                  </span>
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                    Capacity: {selectedTable.capacity}
                  </span>
                  <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded">
                    ${selectedTable.price}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReservation} className="p-6">
              <div className="mb-6">
                <p className="text-neutral-600 mb-4">
                  Complete the payment and reservation details below. A unique reservation code will be generated for you.
                </p>

                {/* Customer Name Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    disabled={submitting}
                    required
                  />
                </div>

                {/* Phone Number Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    disabled={submitting}
                  />
                </div>

                {/* Reservation Date Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Reservation Date *
                  </label>
                  <input
                    type="date"
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    disabled={submitting}
                    required
                  />
                </div>

                {/* Party Size Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Party Size * <span className="text-xs text-neutral-500">(Max: {selectedTable.capacity})</span>
                  </label>
                  <input
                    type="number"
                    value={partySize}
                    onChange={(e) => setPartySize(parseInt(e.target.value))}
                    min="1"
                    max={selectedTable.capacity}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    disabled={submitting}
                    required
                  />
                </div>

                {/* Payment Method Dropdown */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    disabled={submitting}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="credit card">Credit Card</option>
                    <option value="debit card">Debit Card</option>
                    <option value="mobile payment">Mobile Payment</option>
                  </select>
                </div>

                {/* Payment Amount Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Reservation Fee (USD) *
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    readOnly
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-700 font-semibold"
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-1">Based on {selectedTable.category} table pricing</p>
                </div>

                {/* Special Requests Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g., Window seat, high chair needed"
                    rows="3"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    disabled={submitting}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Processing Payment...' : 'Pay & Reserve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && tableToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Remove Reservation
                </h3>
              </div>
              <button
                onClick={handleCloseDeleteModal}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                disabled={deleting}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-neutral-700 mb-4">
                Are you sure you want to remove the reservation for <strong>Table {tableToDelete.id}</strong>?
              </p>
              {tableToDelete.customerName && (
                <div className="p-4 bg-neutral-50 rounded-lg mb-4">
                  <p className="text-sm text-neutral-600 mb-1">Customer Name:</p>
                  <p className="font-semibold text-neutral-900">{tableToDelete.customerName}</p>
                </div>
              )}
              <p className="text-sm text-red-600">
                This action cannot be undone. The table will become available for new reservations.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-neutral-200">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteReservation}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Remove Reservation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservation;
