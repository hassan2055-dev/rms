import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MenuItem from '../components/MenuItem';
import { Plus, Edit, Trash2, X, Grid, List } from 'lucide-react';
import apiService from '../services/apiService';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const categories = ['Pizza', 'Burgers', 'Sides', 'Drinks', 'Salads', 'Appetizers', 'Desserts'];
  const [formData, setFormData] = useState({
    name: '',
    category: 'Pizza',
    price: '',
    description: ''
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const menuResponse = await apiService.getMenu();
        
        if (menuResponse.success) {
          setMenuItems(menuResponse.menu);
        }
      } catch (err) {
        setError('Failed to load menu data: ' + err.message);
        console.error('Error fetching menu data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', category: categories[0] || 'Pizza', price: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await apiService.deleteMenuItem(id);
        if (response.success) {
          setMenuItems(menuItems.filter(item => item.id !== id));
        } else {
          alert('Failed to delete item: ' + response.error);
        }
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('Failed to delete item: ' + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      let response;
      if (editingItem) {
        response = await apiService.updateMenuItem(editingItem.id, itemData);
        if (response.success) {
          setMenuItems(menuItems.map(item => 
            item.id === editingItem.id ? response.item : item
          ));
        }
      } else {
        response = await apiService.createMenuItem(itemData);
        if (response.success) {
          setMenuItems([...menuItems, response.item]);
        }
      }
      
      if (response.success) {
        setShowModal(false);
        setFormData({ name: '', category: categories[0] || 'Pizza', price: '', description: '' });
      } else {
        alert('Failed to save item: ' + response.error);
      }
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Failed to save item: ' + err.message);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-neutral-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar title="Menu Management" />
          <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading menu items...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen bg-neutral-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar title="Menu Management" />
          <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
              >
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Menu Management" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Menu Items</h2>
                  <p className="text-neutral-600 text-sm mt-1">Manage your restaurant menu</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex bg-neutral-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('card')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'card'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'table'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <List size={18} />
                    </button>
                  </div>
                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
                  >
                    <Plus size={18} />
                    Add Item
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'card' ? (
              <div className="p-6">
                {menuItems.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">No menu items present</h3>
                    <p className="text-neutral-600 mb-6">Start by adding your first menu item</p>
                    <button
                      onClick={handleAdd}
                      className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <Plus size={18} />
                      Add First Item
                    </button>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="relative group">
                      <MenuItem
                        item={item}
                        showAddButton={false}
                      />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 bg-white/90 backdrop-blur-sm text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-lg transition-colors shadow-sm"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 bg-white/90 backdrop-blur-sm text-red-600 hover:text-red-700 hover:bg-white rounded-lg transition-colors shadow-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                {menuItems.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">No menu items present</h3>
                    <p className="text-neutral-600 mb-6">Start by adding your first menu item</p>
                    <button
                      onClick={handleAdd}
                      className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <Plus size={18} />
                      Add First Item
                    </button>
                  </div>
                ) : (
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {menuItems.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-xl shadow-sm">
                              🍕
                            </div>
                            <div className="font-medium text-neutral-900 text-sm">{item.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-neutral-900">${item.price.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-neutral-600 text-sm max-w-xs line-clamp-2">{item.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900">
                {editingItem ? 'Edit Menu Item' : 'Add New Item'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ name: '', category: categories[0] || 'Pizza', price: '', description: '' });
                }}
                className="text-neutral-500 hover:text-neutral-700 p-1 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 transition-all text-sm"
                  placeholder="e.g., Margherita Pizza"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 transition-all text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 transition-all text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 transition-all text-sm resize-none"
                  placeholder="Describe this item..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', category: categories[0] || 'Pizza', price: '', description: '' });
                  }}
                  className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;