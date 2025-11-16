import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Menu, 
  ShoppingCart, 
  FileText, 
  Receipt, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'cashier'] },
    { path: '/menu', icon: Menu, label: 'Menu Management', roles: ['admin'] },
    { path: '/pos', icon: ShoppingCart, label: 'POS', roles: ['admin', 'cashier'] },
    { path: '/orders', icon: FileText, label: 'Orders', roles: ['admin', 'cashier'] },
    { path: '/billing', icon: Receipt, label: 'Billing', roles: ['admin', 'cashier'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="h-screen w-64 bg-neutral-900 text-white flex flex-col border-r border-neutral-800">
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-2xl shadow-sm">
            🍽️
          </div>
          <div>
            <h2 className="text-xl font-bold">RMS</h2>
            <p className="text-xs text-neutral-400">Restaurant System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-neutral-800 text-white font-medium' 
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <div className="mb-4 p-3 bg-neutral-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm truncate">{user?.name}</p>
              <p className="text-xs text-neutral-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium text-sm"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;