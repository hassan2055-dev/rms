import { useAuth } from '../context/AuthContext';
import { Bell, Search, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ title }) => {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow-sm border-b border-neutral-200 px-8 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/reservation" 
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <Calendar size={18} />
            <span>Reserve Table</span>
          </Link>
          <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <Search size={20} className="text-neutral-600" />
          </button>
          <button className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <Bell size={20} className="text-neutral-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3 ml-3 pl-3 border-l border-neutral-200">
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
              <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;