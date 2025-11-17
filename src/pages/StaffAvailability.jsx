import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Users, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import apiService from '../services/apiService';

const StaffAvailability = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEmployees();
      if (response.success) {
        setEmployees(response.employees);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = (empId, currentStatus) => {
    // Toggle the availability status in local state immediately for better UX
    setEmployees(prevEmployees =>
      prevEmployees.map(emp =>
        emp.id === empId
          ? { ...emp, availability: currentStatus === 'available' ? 'unavailable' : 'available' }
          : emp
      )
    );
  };

  const getAvailabilityColor = (status) => {
    return status === 'available' ? 'bg-green-500' : 'bg-red-500';
  };

  const getAvailabilityText = (status) => {
    return status === 'available' ? 'Available' : 'Unavailable';
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-neutral-50">
        <Sidebar />
        <div className="flex-1">
          <Navbar title="Staff Availability" />
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
              <p className="mt-4 text-neutral-600">Loading staff...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Navbar title="Staff Availability" />
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">Staff Availability Management</h2>
              <p className="text-neutral-600">View and manage employee availability status</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Total Staff</p>
                    <p className="text-2xl font-bold text-neutral-900">{employees.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Available</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {employees.filter(e => e.availability === 'available').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle size={24} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Unavailable</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {employees.filter(e => e.availability === 'unavailable').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee List */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-neutral-900">Employee List</h3>
                  <button
                    onClick={fetchEmployees}
                    className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <RefreshCw size={18} />
                    <span className="text-sm font-medium">Refresh</span>
                  </button>
                </div>
              </div>

              {employees.length === 0 ? (
                <div className="p-12 text-center">
                  <Users size={48} className="mx-auto text-neutral-400 mb-4" />
                  <p className="text-neutral-600">No employees found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Employee ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Availability Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                {employee.email?.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-neutral-900">#{employee.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-neutral-900">{employee.email}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              employee.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {employee.role === 'admin' ? '👨‍💼 Admin' : '👨‍💻 Cashier'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${
                              getAvailabilityColor(employee.availability)
                            }`}>
                              {employee.availability === 'available' ? (
                                <CheckCircle size={14} />
                              ) : (
                                <XCircle size={14} />
                              )}
                              {getAvailabilityText(employee.availability)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleAvailability(employee.id, employee.availability)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                                employee.availability === 'available' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  employee.availability === 'available' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Info Banner */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Toggle the switch to change employee availability status. 
                Available employees are shown in green, unavailable in red.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAvailability;
