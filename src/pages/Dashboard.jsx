import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { DollarSign, ShoppingBag, TrendingUp, MessageSquare, ArrowUpRight, Star, Trash2 } from 'lucide-react';
import { ordersData } from '../data/ordersData';
import { billsData } from '../data/billsData';
import { feedbackData } from '../data/feedbackData';
import { menuData } from '../data/menuData';
import apiService from '../services/apiService';

const Dashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Fetch reviews and stats when component mounts
  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await apiService.getReviews();
      if (response.success) {
        setReviews(response.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      // Fallback to static data if API fails
      setReviews(feedbackData);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await apiService.getStats();
      if (response.success) {
        setReviewStats(response.stats);
      }
    } catch (err) {
      console.error('Failed to fetch review stats:', err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await apiService.deleteReview(reviewId);
        if (response.success) {
          setReviews(reviews.filter(review => review.id !== reviewId));
          fetchReviewStats(); // Refresh stats after deletion
        }
      } catch (err) {
        console.error('Failed to delete review:', err);
        alert('Failed to delete review. Please try again.');
      }
    }
  };

  // Calculate statistics
  const totalSales = billsData.reduce((sum, bill) => sum + bill.total, 0);
  const totalOrders = ordersData.length;
  const totalFeedback = reviews.length;
  
  // Find top selling item
  const topItem = menuData.reduce((max, item) => 
    item.price > max.price ? item : max, menuData[0]
  );

  const stats = [
    {
      title: 'Total Sales',
      value: `$${totalSales.toFixed(2)}`,
      icon: DollarSign,
      bgColor: 'bg-emerald-50',
      iconColor: 'bg-emerald-500',
      textColor: 'text-emerald-900',
      change: '+12.5%',
      changePositive: true
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingBag,
      bgColor: 'bg-blue-50',
      iconColor: 'bg-blue-500',
      textColor: 'text-blue-900',
      change: '+8.2%',
      changePositive: true
    },
    {
      title: 'Top Selling Item',
      value: topItem.name,
      icon: TrendingUp,
      bgColor: 'bg-purple-50',
      iconColor: 'bg-purple-500',
      textColor: 'text-purple-900',
      change: 'Most Popular',
      changePositive: true
    },
    {
      title: 'Total Feedback',
      value: totalFeedback,
      icon: MessageSquare,
      bgColor: 'bg-amber-50',
      iconColor: 'bg-amber-500',
      textColor: 'text-amber-900',
      change: reviewStats ? `Avg: ${reviewStats.average_rating}★` : '+5 today',
      changePositive: true
    }
  ];

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${stat.iconColor} p-3 rounded-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    {stat.changePositive && (
                      <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                        <ArrowUpRight size={16} />
                        <span>{stat.change}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-neutral-600 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Recent Orders</h2>
              <button className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {ordersData.slice(0, 6).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm">
                      {order.customer.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 mb-0.5">{order.customer}</p>
                      <p className="text-sm text-neutral-500">{order.id} • {order.time}</p>
                      {order.items && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="text-xs bg-white text-neutral-600 px-2 py-0.5 rounded border border-neutral-200">
                              {item.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <p className="font-bold text-neutral-900 text-lg">${order.total.toFixed(2)}</p>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      order.status === 'Served' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'Preparing' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-neutral-900">Customer Feedback</h2>
                {reviewStats && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium text-amber-700">
                      {reviewStats.average_rating}/5.0 Average
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                  {totalFeedback} Total Reviews
                </span>
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  {showAllReviews ? 'Show Less' : 'View All'}
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                <p className="mt-2 text-neutral-600">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={48} className="text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600">No reviews yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(showAllReviews ? reviews : reviews.slice(0, 4)).map((feedback) => (
                  <div key={feedback.id} className="p-5 bg-neutral-50 rounded-lg border border-neutral-200 group relative">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-neutral-900 mb-0.5">{feedback.name}</p>
                        <p className="text-sm text-neutral-500">{feedback.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < feedback.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => handleDeleteReview(feedback.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Delete review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-neutral-700 text-sm leading-relaxed">"{feedback.comment}"</p>
                  </div>
                ))}
              </div>
            )}
            
            {reviewStats && (
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Rating Distribution</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviewStats.rating_distribution[`${rating}_star`] || 0;
                    const percentage = totalFeedback > 0 ? (count / totalFeedback) * 100 : 0;
                    return (
                      <div key={rating} className="text-center">
                        <div className="flex items-center gap-1 justify-center mb-1">
                          <span className="text-xs font-medium">{rating}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        </div>
                        <div className="bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-amber-400 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-neutral-600 mt-1 block">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;