import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import '../App.css';

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'cashier'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.email && !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (isSignup && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      
      if (isSignup) {
        response = await apiService.signup({
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
      } else {
        response = await apiService.signin({
          email: formData.email,
          password: formData.password
        });
      }

      if (response.success) {
        // Store employee data in auth context
        login(response.employee);
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError(response.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      role: 'cashier'
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <h1 style={styles.title}>
          {isSignup ? 'Employee Sign Up' : 'Employee Sign In'}
        </h1>
        
        <p style={styles.subtitle}>
          {isSignup 
            ? 'Create a new employee account' 
            : 'Sign in to access the restaurant management system'}
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="employee@restaurant.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              style={styles.input}
              required
            />
          </div>

          {isSignup && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <div style={styles.roleSelector}>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'admin'})}
                    style={{
                      ...styles.roleButton,
                      ...(formData.role === 'admin' ? styles.roleButtonActive : {})
                    }}
                  >
                    <div style={styles.roleIcon}>👨‍💼</div>
                    <div style={styles.roleTitle}>Admin</div>
                    <div style={styles.roleDesc}>Full Access</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'cashier'})}
                    style={{
                      ...styles.roleButton,
                      ...(formData.role === 'cashier' ? styles.roleButtonActive : {})
                    }}
                  >
                    <div style={styles.roleIcon}>👨‍💻</div>
                    <div style={styles.roleTitle}>Cashier</div>
                    <div style={styles.roleDesc}>POS Access</div>
                  </button>
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div style={styles.toggleContainer}>
          <p style={styles.toggleText}>
            {isSignup 
              ? 'Already have an account?' 
              : "Don't have an account?"}
          </p>
          <button 
            onClick={toggleMode} 
            style={styles.toggleButton}
            type="button"
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>


        <button 
          onClick={() => navigate('/')} 
          style={styles.backButton}
          type="button"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    padding: '40px',
    width: '100%',
    maxWidth: '450px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '30px',
    textAlign: 'center'
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
    border: '1px solid #fcc'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s',
    fontFamily: 'inherit'
  },
  button: {
    backgroundColor: '#667eea',
    color: 'white',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginTop: '10px'
  },
  toggleContainer: {
    marginTop: '25px',
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0'
  },
  toggleText: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '10px'
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  testCredentials: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '13px'
  },
  testTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px'
  },
  testText: {
    color: '#666',
    margin: '4px 0'
  },
  backButton: {
    marginTop: '20px',
    width: '100%',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  roleSelector: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  roleButton: {
    padding: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textAlign: 'center'
  },
  roleButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff'
  },
  roleIcon: {
    fontSize: '32px',
    marginBottom: '8px'
  },
  roleTitle: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#333',
    marginBottom: '4px'
  },
  roleDesc: {
    fontSize: '12px',
    color: '#666'
  }
};

export default Login;
