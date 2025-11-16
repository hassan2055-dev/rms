const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  // Generic method for making API requests
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Reviews API methods
  async getReviews() {
    return this.request('/reviews');
  }

  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getReview(id) {
    return this.request(`/reviews/${id}`);
  }

  async deleteReview(id) {
    return this.request(`/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  // Statistics API methods
  async getStats() {
    return this.request('/stats');
  }

  // Menu API methods
  async getMenu() {
    return this.request('/menu');
  }

  async createMenuItem(itemData) {
    return this.request('/menu', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async getMenuItem(id) {
    return this.request(`/menu/${id}`);
  }

  async updateMenuItem(id, itemData) {
    return this.request(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteMenuItem(id) {
    return this.request(`/menu/${id}`, {
      method: 'DELETE',
    });
  }

  async getMenuCategories() {
    return this.request('/menu/categories');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;