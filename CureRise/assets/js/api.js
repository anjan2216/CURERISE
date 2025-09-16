// CureRise API Utility
// Shared API functions for all pages

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Helper Class
class CureRiseAPI {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // Add authorization header if token exists
    const token = localStorage.getItem('access_token');
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = { ...defaultOptions, ...options };
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  static async register(userData) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async login(credentials) {
    return await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  static async getProfile() {
    return await this.request('/auth/profile');
  }

  static async updateProfile(profileData) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Patient endpoints
  static async getPatients(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);
    if (filters.category) params.append('category', filters.category);
    if (filters.urgency) params.append('urgency', filters.urgency);
    if (filters.location) params.append('location', filters.location);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/patients?${queryString}` : '/patients';
    
    return await this.request(endpoint);
  }

  static async getPatient(patientId) {
    return await this.request(`/patients/${patientId}`);
  }

  static async createPatient(patientData) {
    return await this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  // Donation endpoints
  static async createDonation(donationData) {
    return await this.request('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  static async confirmDonation(donationId, transactionData) {
    return await this.request(`/donations/${donationId}/confirm`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  }

  // Food Bank endpoints
  static async createFoodBankDonation(donationData) {
    return await this.request('/food-bank/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  static async getFoodBankStats() {
    return await this.request('/food-bank/stats');
  }

  // Hospital endpoints
  static async getHospitals() {
    return await this.request('/hospitals');
  }

  // Education endpoints
  static async getEducationContent(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);
    if (filters.category) params.append('category', filters.category);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/education?${queryString}` : '/education';
    
    return await this.request(endpoint);
  }

  static async getEducationItem(contentId) {
    return await this.request(`/education/${contentId}`);
  }

  // Admin endpoints
  static async getAdminStats() {
    return await this.request('/admin/stats');
  }

  static async getAdminPatients(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/admin/patients?${queryString}` : '/admin/patients';
    
    return await this.request(endpoint);
  }

  static async verifyPatient(patientId) {
    return await this.request(`/admin/patients/${patientId}/verify`, {
      method: 'PUT',
    });
  }

  // Utility functions
  static isAuthenticated() {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('currentUser');
    return !!(token && user);
  }

  static getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  static logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('pendingDonation');
  }

  static async refreshUserData() {
    if (!this.isAuthenticated()) return null;
    
    try {
      const response = await this.getProfile();
      const userData = {
        ...response.user,
        access_token: localStorage.getItem('access_token'),
        loginTime: new Date().toISOString(),
        isLoggedIn: true
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      this.logout();
      return null;
    }
  }
}

// Make API available globally
window.CureRiseAPI = CureRiseAPI;

