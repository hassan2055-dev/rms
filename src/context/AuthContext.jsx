import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (employeeData) => {
    // Store employee data from API response
    setUser({
      id: employeeData.id,
      email: employeeData.email,
      role: employeeData.role,
      name: employeeData.role === 'admin' ? 'Admin User' : 'Cashier User'
    });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCashier: user?.role === 'cashier'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
