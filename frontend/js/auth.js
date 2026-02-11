/**
 * ============================================================================
 * Authentication Module
 * ============================================================================
 * Handles user authentication state and token management.
 * Provides utilities for secure API communication.
 * 
 * Maintained by: Frontend Team
 * Last Updated: 2026-02-09
 * ============================================================================
 */

const AUTH = {
  // API Configuration
  API_BASE_URL: 'http://localhost:5000/api',
  TOKEN_KEY: 'rza_auth_token',
  USER_KEY: 'rza_user_data',

  /**
   * Check if user is authenticated
   * @returns {boolean} True if token exists and is valid
   */
  isAuthenticated() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token;
  },

  /**
   * Get stored authentication token
   * @returns {string | null} JWT token or null
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  /**
   * Get stored user data
   * @returns {object | null} User data or null
   */
  getCurrentUser() {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Store authentication data
   * @param {string} token - JWT token
   * @param {object} user - User data
   */
  setAuthData(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.updateUIForAuth();
  },

  /**
   * Clear authentication data on logout
   */
  clearAuthData() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.updateUIForAuth();
  },

  /**
   * Update UI based on authentication state
   */
  updateUIForAuth() {
    const isAuth = this.isAuthenticated();
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const accountLink = document.getElementById('accountLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const navAuth = document.getElementById('navAuth');

    if (isAuth) {
      // Hide login/register, show account/logout
      if (loginLink) loginLink.classList.add('hidden');
      if (registerLink) registerLink.classList.add('hidden');
      if (accountLink) accountLink.classList.remove('hidden');
      if (logoutBtn) logoutBtn.classList.remove('hidden');

      // Add user greeting in navbar
      if (navAuth) {
        const user = this.getCurrentUser();
        navAuth.innerHTML = `<span>Welcome, ${user?.first_name || 'User'}!</span>`;
      }

      // Setup logout button
      if (logoutBtn) {
        logoutBtn.onclick = () => this.logout();
      }
    } else {
      // Show login/register, hide account/logout
      if (loginLink) loginLink.classList.remove('hidden');
      if (registerLink) registerLink.classList.remove('hidden');
      if (accountLink) accountLink.classList.add('hidden');
      if (logoutBtn) logoutBtn.classList.add('hidden');
      if (navAuth) navAuth.innerHTML = '';
    }
  },

  /**
   * Make authenticated API request
   * @param {string} endpoint - API endpoint (without /api prefix)
   * @param {object} options - Fetch options
   * @returns {Promise} Response data
   */
  async apiRequest(endpoint, options = {}) {
    const url = `${this.API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      // Handle token expiration
      if (response.status === 401) {
        this.clearAuthData();
        window.location.href = '/pages/login.html';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  /**
   * Register new user
   * @param {object} userData - User registration data
   * @returns {Promise} Registration result
   */
  async register(userData) {
    return await this.apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Login result with token
   */
  async login(email, password) {
    const data = await this.apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    // Store auth data
    if (data.token && data.user) {
      this.setAuthData(data.token, data.user);
    }

    return data;
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      if (this.isAuthenticated()) {
        await this.apiRequest('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
      window.location.href = '/index.html';
    }
  },

  /**
   * Initialize authentication on page load
   */
  init() {
    this.updateUIForAuth();

    // Check if user needs to be logged in for this page
    const currentPage = window.location.pathname;
    const protectedPages = ['/pages/account.html', '/pages/booking.html', '/pages/hotel.html'];
    
    if (protectedPages.some(page => currentPage.includes(page)) && !this.isAuthenticated()) {
      // Redirect to login immediately if trying to access protected page without auth
      document.body.innerHTML = '';
      window.location.href = '/pages/login.html?redirect=' + encodeURIComponent(currentPage);
    }
  }
};

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AUTH.init());
} else {
  AUTH.init();
}
