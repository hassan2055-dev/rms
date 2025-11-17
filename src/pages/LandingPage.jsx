import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star, Mail, Lock, User, MessageSquare, ChevronRight, Award, Clock, Heart } from 'lucide-react';
import apiService from '../services/apiService';

const LandingPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'admin'
  });

  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    name: '',
    rating: 5,
    comment: ''
  });

  // Fetch reviews and menu when component mounts
  useEffect(() => {
    fetchReviews();
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await apiService.getMenu();
      if (response.success) {
        setMenuItems(response.menu);
      }
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await apiService.getReviews();
      if (response.success) {
        setFeedbackList(response.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError('Failed to load reviews from server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    login(loginData.email, loginData.password, loginData.role);
    navigate('/dashboard');
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.createReview(newFeedback);
      
      if (response.success) {
        // Add new review to the beginning of the list
        setFeedbackList([response.review, ...feedbackList]);
        setNewFeedback({ name: '', rating: 5, comment: '' });
        alert('Thank you for your feedback! It has been saved successfully.');
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError('Failed to submit feedback. Please try again.');
      alert('Sorry, there was an error submitting your feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getItemEmoji = (category) => {
    const emojiMap = {
      'Pizza': '🍕',
      'Burgers': '🍔',
      'Sides': '🍟',
      'Drinks': '🥤',
      'Salads': '🥗',
      'Appetizers': '🍗',
      'Desserts': '🍰',
      'Pasta': '🍝',
      'Sandwiches': '🥪'
    };
    return emojiMap[category] || '🍽️';
  };

  const featuredItems = menuItems.slice(0, 6);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-2xl shadow-sm">
                🍽️
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Delicious Bites</h1>
                <p className="text-xs text-amber-600 font-medium">Fine Dining Experience</p>
              </div>
            </div>
            <Link 
              to="/login"
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2"
            >
              <User size={18} />
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Award size={16} className="text-amber-400" />
              <span className="text-sm font-medium">Rated #1 Restaurant in Town</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Experience Culinary<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Excellence</span>
            </h2>
            <p className="text-xl text-neutral-300 mb-10 max-w-2xl leading-relaxed">
              Where exceptional flavors meet unforgettable moments. Indulge in our carefully crafted dishes made with the finest ingredients.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/full-menu" 
                className="group bg-amber-500 hover:bg-amber-600 text-neutral-900 px-8 py-4 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                View Our Menu
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#feedback" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-8 py-4 rounded-lg font-semibold transition-all">
                Share Feedback
              </a>
            </div>
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl">
              <div>
                <p className="text-3xl font-bold text-amber-400 mb-1">500+</p>
                <p className="text-sm text-neutral-400">Happy Customers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-400 mb-1">{menuItems.length}</p>
                <p className="text-sm text-neutral-400">Menu Items</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-400 mb-1">4.9★</p>
                <p className="text-sm text-neutral-400">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-neutral-100 rounded-full mb-4">
                <User size={28} className="text-neutral-700" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Staff Login</h3>
              <p className="text-neutral-600 text-sm">Enter your credentials to access the dashboard</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  placeholder="staff@deliciousbites.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  placeholder="Enter your password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Select Your Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLoginData({...loginData, role: 'admin'})}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      loginData.role === 'admin'
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">👨‍💼</div>
                    <div className="font-semibold text-sm">Admin</div>
                    <div className="text-xs text-neutral-600">Full Access</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginData({...loginData, role: 'cashier'})}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      loginData.role === 'cashier'
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">👨‍💻</div>
                    <div className="font-semibold text-sm">Cashier</div>
                    <div className="text-xs text-neutral-600">POS Access</div>
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Login to Dashboard
              </button>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-900 text-center">
                  <strong>Demo Mode:</strong> Use any email/password to login
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="w-full text-neutral-600 hover:text-neutral-900 py-2 font-medium text-sm"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Features */}
      <section className="py-16 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-4">
                <Award size={24} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Premium Quality</h3>
              <p className="text-neutral-600 text-sm">Fresh, locally sourced ingredients in every dish</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-4">
                <Clock size={24} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Fast Service</h3>
              <p className="text-neutral-600 text-sm">Quick preparation without compromising quality</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-4">
                <Heart size={24} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Made with Love</h3>
              <p className="text-neutral-600 text-sm">Passionate chefs dedicated to excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full mb-4">
              <span className="font-semibold text-sm">Our Specialties</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">Featured Dishes</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Explore our carefully crafted menu featuring dishes made with the finest ingredients
            </p>
          </div>
          {featuredItems.length === 0 ? (
            <div className="text-center py-16 col-span-full">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No menu items available</h3>
              <p className="text-neutral-600">Check back soon for our delicious dishes!</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.map((item) => (
              <div key={item.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <span className="text-6xl opacity-90">{getItemEmoji(item.category)}</span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">{item.name}</h3>
                      <span className="inline-block px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-xl font-bold text-amber-600">${item.price}</span>
                  </div>
                  <p className="text-neutral-600 text-sm mb-4 leading-relaxed">{item.description}</p>
                  <Link 
                    to="/full-menu" 
                    className="block w-full bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 rounded-lg font-medium text-sm transition-all text-center"
                  >
                    View Full Menu
                  </Link>
                </div>
              </div>
            ))}
          </div>
          )}
          {featuredItems.length > 0 && (
          <div className="text-center mt-12">
            <Link 
              to="/full-menu" 
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              View Full Menu
              <ChevronRight size={20} />
            </Link>
          </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">About Delicious Bites</h2>
          <p className="text-lg text-neutral-600 mb-4 leading-relaxed">
            Since 2020, we've been serving culinary excellence with a passion for quality and service. Our chefs use only the freshest, locally sourced ingredients to create memorable dining experiences.
          </p>
          <p className="text-lg text-neutral-600 leading-relaxed">
            Whether it's a casual meal or a special celebration, our dedicated team is here to make every moment delicious.
          </p>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Customer Feedback</h2>
            <p className="text-lg text-neutral-600">Hear what our customers have to say</p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm max-w-md mx-auto">
                {error}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {loading && feedbackList.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                <p className="mt-2 text-neutral-600">Loading reviews...</p>
              </div>
            ) : feedbackList.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <MessageSquare size={48} className="text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600">No reviews yet. Be the first to leave a review!</p>
              </div>
            ) : (
              feedbackList.slice(0, 4).map((feedback) => (
                <div key={feedback.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-neutral-900">{feedback.name}</h4>
                      <p className="text-sm text-neutral-500">{feedback.date}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < feedback.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-neutral-700 leading-relaxed">{feedback.comment}</p>
                </div>
              ))
            )}
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-2xl font-bold text-neutral-900 mb-2 text-center">
              Share Your Experience
            </h3>
            <p className="text-neutral-600 text-center mb-8">We'd love to hear from you</p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={newFeedback.name}
                  onChange={(e) => setNewFeedback({...newFeedback, name: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Rating
                </label>
                <select
                  value={newFeedback.rating}
                  onChange={(e) => setNewFeedback({...newFeedback, rating: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Comment
                </label>
                <textarea
                  required
                  rows="4"
                  value={newFeedback.comment}
                  onChange={(e) => setNewFeedback({...newFeedback, comment: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                  placeholder="Tell us about your experience..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  loading 
                    ? 'bg-neutral-400 cursor-not-allowed' 
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-3">Delicious Bites</h3>
            <p className="text-neutral-400 mb-2">123 Food Street, Culinary City, FC 12345</p>
            <p className="text-neutral-400 mb-6">Phone: (555) 123-4567 | Email: info@deliciousbites.com</p>
            <div className="pt-6 border-t border-neutral-800">
              <p className="text-neutral-500 text-sm">© 2025 Delicious Bites. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;