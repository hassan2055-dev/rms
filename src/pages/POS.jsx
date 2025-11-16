import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MenuItem from '../components/MenuItem';
import { Plus, Minus, Trash2, ShoppingCart, User } from 'lucide-react';
import apiService from '../services/apiService';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customerName, setCustomerName] = useState('');
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['All', ...new Set(menuData.map(item => item.category))];

  // Fetch menu data on component mount
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getMenu();
        if (response.success) {
          setMenuData(response.menu);
        } else {
          setError('Failed to load menu items');
        }
      } catch (err) {
        setError('Failed to load menu items: ' + err.message);
        console.error('Error fetching menu data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const filteredMenu = selectedCategory === 'All' 
    ? menuData 
    : menuData.filter(item => item.category === selectedCategory);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const generateBill = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter customer name!');
      return;
    }

    const orderId = `ORD${Date.now().toString().slice(-6)}`;
    const billId = `BILL${Date.now().toString().slice(-6)}`;
    
    alert(`Bill Generated!\n\nOrder ID: ${orderId}\nBill ID: ${billId}\nCustomer: ${customerName}\nTotal: $${total.toFixed(2)}\n\nThank you for your order!`);
    
    setCart([]);
    setCustomerName('');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-neutral-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar title="Point of Sale" />
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
          <Navbar title="Point of Sale" />
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
        <Navbar title="Point of Sale" />
        <main className="flex-1 overflow-hidden flex gap-6 p-6">
          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Category Filter */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200">
              <h3 className="font-semibold text-neutral-900 mb-4 text-sm">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      selectedCategory === category
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenu.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  onAddToCart={addToCart}
                  showAddButton={true}
                />
              ))}
            </div>
          </div>

          {/* Cart Panel */}
          <div className="w-96 bg-white border border-neutral-200 rounded-xl flex flex-col shadow-sm">
            <div className="p-5 border-b border-neutral-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <ShoppingCart size={20} className="text-neutral-700" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-neutral-900">Cart</h2>
                  <p className="text-xs text-neutral-500">{cart.length} items</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center text-neutral-400 mt-20">
                  <div className="bg-neutral-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart size={32} className="opacity-50" />
                  </div>
                  <p className="text-sm font-medium mb-1">Cart is empty</p>
                  <p className="text-xs">Add items from the menu</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-900 text-sm mb-0.5">{item.name}</h4>
                          <p className="text-neutral-600 text-xs">${item.price.toFixed(2)} each</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-neutral-200">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 bg-neutral-100 hover:bg-neutral-200 rounded flex items-center justify-center transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 bg-neutral-100 hover:bg-neutral-200 rounded flex items-center justify-center transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-bold text-neutral-900 text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Summary */}
            <div className="border-t border-neutral-200 p-5 bg-neutral-50">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-neutral-600 text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600 text-sm">
                  <span>Tax (10%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-300">
                  <span>Total</span>
                  <span className="text-amber-600">${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={generateBill}
                disabled={cart.length === 0}
                className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-sm transition-colors"
              >
                Generate Bill
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default POS;