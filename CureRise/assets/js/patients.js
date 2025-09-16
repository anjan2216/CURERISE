// Patients Page JavaScript

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Helper Functions
class CureRiseAPI {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const config = { ...defaultOptions, ...options };
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

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

  static async createDonation(donationData) {
    return await this.request('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  static async createFoodBankDonation(donationData) {
    return await this.request('/food-bank/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  static async getFoodBankStats() {
    return await this.request('/food-bank/stats');
  }

  static async getHospitals() {
    return await this.request('/hospitals');
  }

  static async getEducationContent(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);
    if (filters.category) params.append('category', filters.category);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/education?${queryString}` : '/education';
    
    return await this.request(endpoint);
  }

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

  static async getProfile(token) {
    return await this.request('/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }


class PatientsPage {
  constructor() {
    this.patients = [];
    this.filteredPatients = [];
    this.currentPage = 1;
    this.patientsPerPage = 6;
    this.totalPages = 1;
    this.loading = false;
    
    this.init();
  }

  async init() {
    console.log('PatientsPage initializing...');
    this.setupEventListeners();
    await this.loadPatients();
    this.updateStats();
  }

  async loadPatients() {
    if (this.loading) return;
    
    this.loading = true;
    this.showLoadingState();
    
    try {
      const filters = this.getCurrentFilters();
      const response = await CureRiseAPI.getPatients(filters);
      
      this.patients = response.patients || [];
      this.filteredPatients = [...this.patients];
      this.totalPages = response.pages || 1;
      
      console.log('Loaded', this.patients.length, 'patients from API');
      this.renderPatients();
      this.updateStats();
    } catch (error) {
      console.error('Failed to load patients:', error);
      this.showErrorState('Failed to load patients. Please try again.');
    } finally {
      this.loading = false;
      this.hideLoadingState();
    }
  }

  getCurrentFilters() {
    const searchTerm = document.getElementById('searchInput')?.value || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const urgencyFilter = document.getElementById('urgencyFilter')?.value || '';
    const locationFilter = document.getElementById('locationFilter')?.value || '';
    
    return {
      page: this.currentPage,
      per_page: this.patientsPerPage,
      search: searchTerm,
      category: categoryFilter,
      urgency: urgencyFilter,
      location: locationFilter
    };
  }

  showLoadingState() {
    const casesGrid = document.getElementById('casesGrid');
    if (casesGrid) {
      casesGrid.innerHTML = `
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading patients...</p>
        </div>
      `;
    }
  }

  hideLoadingState() {
    // Loading state will be replaced by renderPatients()
  }

  showErrorState(message) {
    const casesGrid = document.getElementById('casesGrid');
    if (casesGrid) {
      casesGrid.innerHTML = `
        <div class="error-state">
          <p>${message}</p>
          <button onclick="location.reload()" class="btn btn-primary">Retry</button>
        </div>
      `;
    }
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', CureRise.utils.debounce(() => {
        this.filterPatients();
      }, 500));
    }

    // Filter functionality
    const filters = ['categoryFilter', 'urgencyFilter', 'locationFilter'];
    filters.forEach(filterId => {
      const filter = document.getElementById(filterId);
      if (filter) {
        filter.addEventListener('change', () => this.filterPatients());
      }
    });

    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => this.sortPatients());
    }

    // Load more functionality
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => this.loadMorePatients());
    }
  }

  async filterPatients() {
    this.currentPage = 1;
    await this.loadPatients();
  }

  sortPatients() {
    const sortValue = document.getElementById('sortSelect')?.value || 'newest';

    this.filteredPatients.sort((a, b) => {
      switch (sortValue) {
        case 'newest':
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        case 'urgent':
          const urgencyOrder = { critical: 3, urgent: 2, moderate: 1 };
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        case 'amount-low':
          return a.targetAmount - b.targetAmount;
        case 'amount-high':
          return b.targetAmount - a.targetAmount;
        case 'progress':
          const progressA = (a.raisedAmount / a.targetAmount) * 100;
          const progressB = (b.raisedAmount / b.targetAmount) * 100;
          return progressB - progressA;
        default:
          return 0;
      }
    });

    this.renderPatients();
  }

  renderPatients() {
    const casesGrid = document.getElementById('casesGrid');
    if (!casesGrid) {
      console.error('Cases grid element not found');
      return;
    }

    const startIndex = 0;
    const endIndex = this.currentPage * this.patientsPerPage;
    const patientsToShow = this.filteredPatients.slice(startIndex, endIndex);

    console.log('Rendering', patientsToShow.length, 'patients');
    casesGrid.innerHTML = patientsToShow.map(patient => this.createPatientCard(patient)).join('');

    // Update load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      if (endIndex >= this.filteredPatients.length) {
        loadMoreBtn.style.display = 'none';
      } else {
        loadMoreBtn.style.display = 'block';
      }
    }

    // Add event listeners to donate buttons
    this.setupDonateButtons();
  }

  createPatientCard(patient) {
    const progressPercentage = patient.progress_percentage || Math.round((patient.raised_amount / patient.target_amount) * 100);
    const hospitalName = patient.hospital ? patient.hospital.name : 'Hospital not specified';
    const imageUrl = patient.image_url || 'assets/images/placeholder-patient.svg';
    
    return `
      <div class="patient-card" data-patient-id="${patient.id}">
        <img src="${imageUrl}" alt="${patient.name}" class="patient-image" onerror="this.src='assets/images/placeholder-patient.svg'">
        <div class="patient-content">
          <div class="patient-header">
            <div class="patient-info">
              <h3>${patient.name}</h3>
              <span class="patient-age">${patient.age} years old</span>
            </div>
            <span class="urgency-badge urgency-${patient.urgency}">${patient.urgency}</span>
          </div>
          
          <p class="patient-condition">${patient.condition}</p>
          
          <div class="patient-hospital">
            <svg class="hospital-icon" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            <span>${hospitalName}</span>
          </div>
          
          <div class="funding-progress">
            <div class="funding-header">
              <span class="funding-raised">${CureRise.utils.formatCurrency(patient.raised_amount)}</span>
              <span class="funding-target">of ${CureRise.utils.formatCurrency(patient.target_amount)}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progressPercentage}%"></div>
            </div>
          </div>
          
          <div class="patient-actions">
            <button class="btn-donate" data-patient-id="${patient.id}">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              Donate Now
            </button>
            <button class="btn-details" data-patient-id="${patient.id}">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  setupDonateButtons() {
    document.querySelectorAll('.btn-donate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const patientId = parseInt(e.target.closest('[data-patient-id]').dataset.patientId);
        this.openDonationModal(patientId);
      });
    });

    document.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const patientId = parseInt(e.target.closest('[data-patient-id]').dataset.patientId);
        this.showPatientDetails(patientId);
      });
    });
  }

  openDonationModal(patientId) {
    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) return;

    const modalContent = `
      <div class="donation-modal">
        <h2>Donate to ${patient.name}</h2>
        <p class="modal-description">${patient.condition}</p>
        
        <div class="donation-amounts">
          <button class="amount-btn" data-amount="1000">₹1,000</button>
          <button class="amount-btn" data-amount="2500">₹2,500</button>
          <button class="amount-btn" data-amount="5000">₹5,000</button>
          <button class="amount-btn" data-amount="10000">₹10,000</button>
        </div>
        
        <div class="custom-amount">
          <input type="number" id="customAmount" placeholder="Enter custom amount" min="100">
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-primary" id="proceedDonation">Proceed to Payment</button>
          <button class="btn btn-outline" id="closeModal">Cancel</button>
        </div>
      </div>
    `;

    const modal = CureRise.modal.create(modalContent, { maxWidth: '400px' });
    
    // Setup modal event listeners
    modal.querySelectorAll('.amount-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        modal.querySelector('#customAmount').value = btn.dataset.amount;
      });
    });

    modal.querySelector('#proceedDonation').addEventListener('click', () => {
      const amount = modal.querySelector('#customAmount').value;
      if (amount && amount >= 100) {
        this.processDonation(patientId, amount);
        CureRise.modal.close(modal);
      } else {
        CureRise.toast.show('Please enter a valid donation amount (minimum ₹100)', 'error');
      }
    });

    modal.querySelector('#closeModal').addEventListener('click', () => {
      CureRise.modal.close(modal);
    });
  }

  async processDonation(patientId, amount) {
    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) return;

    try {
      // Create donation via API
      const donationData = {
        amount: parseFloat(amount),
        donation_type: 'patient',
        patient_id: patientId,
        donor_name: 'Anonymous Donor', // You can get this from user profile
        donor_email: 'donor@example.com', // You can get this from user profile
        donor_phone: '+91-0000000000', // You can get this from user profile
        payment_method: 'card',
        is_anonymous: true
      };

      const response = await CureRiseAPI.createDonation(donationData);
      
      // Store donation details and redirect to payment page
      const paymentData = {
        type: 'patient-donation',
        recipient: `${patient.name} - ${patient.category.charAt(0).toUpperCase() + patient.category.slice(1)} Treatment`,
        hospital: patient.hospital ? patient.hospital.name : 'Hospital',
        amount: amount,
        patientId: patientId,
        donationId: response.donation.id,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('pendingDonation', JSON.stringify(paymentData));
      CureRise.toast.show('Redirecting to secure payment...', 'success');

      // Redirect to payment page
      setTimeout(() => {
        window.location.href = 'payment.html';
      }, 1000);
    } catch (error) {
      console.error('Failed to create donation:', error);
      CureRise.toast.show('Failed to process donation. Please try again.', 'error');
    }
  }

  showPatientDetails(patientId) {
    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) return;

    // In a real application, this would navigate to a detailed patient page
    window.location.href = `patient-details.html?id=${patientId}`;
  }

  loadMorePatients() {
    this.currentPage++;
    this.renderPatients();
  }

  updateStats() {
    const totalCasesEl = document.getElementById('totalCases');
    if (totalCasesEl) {
      totalCasesEl.textContent = this.filteredPatients.length;
    }
  }
}

// Initialize the patients page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PatientsPage();
});
