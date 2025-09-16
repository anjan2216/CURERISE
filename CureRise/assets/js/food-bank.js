// Food Bank Page JavaScript

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

  static async createFoodBankDonation(donationData) {
    return await this.request('/food-bank/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  static async getFoodBankStats() {
    return await this.request('/food-bank/stats');
  }
}

class FoodBankPage {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.animateStats();
  }

  setupEventListeners() {
    // Donation card buttons
    document.querySelectorAll('.card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const amount = e.target.dataset.amount;
        const type = e.target.dataset.type;
        this.handleDonation(amount, type);
      });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  handleDonation(amount, type) {
    if (type === 'monthly') {
      this.openMonthlyDonationModal(amount);
    } else {
      this.openOnetimeDonationModal();
    }
  }

  openMonthlyDonationModal(amount) {
    const modalContent = `
      <div class="donation-modal">
        <div class="modal-header">
          <h2>Monthly Food Bank Support</h2>
          <p class="modal-subtitle">₹${amount}/month</p>
        </div>
        
        <div class="modal-content">
          <div class="donation-impact">
            <h3>Your Monthly Impact:</h3>
            <ul class="impact-list">
              <li>${amount === '500' ? '10 nutritious meals' : '30 nutritious meals'} provided monthly</li>
              <li>${amount === '500' ? '2-3 patients' : 'Entire patient family'} supported</li>
              <li>Regular impact reports and updates</li>
              <li>Tax deduction certificates</li>
            </ul>
          </div>
          
          <div class="payment-options">
            <h3>Payment Method:</h3>
            <div class="payment-methods">
              <label class="payment-method">
                <input type="radio" name="payment" value="card" checked>
                <span class="method-icon">💳</span>
                <span>Credit/Debit Card</span>
              </label>
              <label class="payment-method">
                <input type="radio" name="payment" value="upi">
                <span class="method-icon">📱</span>
                <span>UPI</span>
              </label>
              <label class="payment-method">
                <input type="radio" name="payment" value="netbanking">
                <span class="method-icon">🏦</span>
                <span>Net Banking</span>
              </label>
            </div>
          </div>
          
          <div class="donor-info">
            <h3>Your Information:</h3>
            <div class="form-row">
              <input type="text" placeholder="Full Name" class="form-input" required>
              <input type="email" placeholder="Email Address" class="form-input" required>
            </div>
            <div class="form-row">
              <input type="tel" placeholder="Phone Number" class="form-input" required>
              <input type="text" placeholder="PAN Number (for tax receipt)" class="form-input">
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-primary" id="proceedMonthly">Start Monthly Support</button>
          <button class="btn btn-outline" id="closeModal">Cancel</button>
        </div>
      </div>
    `;

    const modal = CureRise.modal.create(modalContent, { maxWidth: '500px' });
    
    modal.querySelector('#proceedMonthly').addEventListener('click', () => {
      this.processMonthlyDonation(amount);
      CureRise.modal.close(modal);
    });

    modal.querySelector('#closeModal').addEventListener('click', () => {
      CureRise.modal.close(modal);
    });
  }

  openOnetimeDonationModal() {
    const modalContent = `
      <div class="donation-modal">
        <div class="modal-header">
          <h2>Support Food Bank</h2>
          <p class="modal-subtitle">One-time contribution</p>
        </div>
        
        <div class="modal-content">
          <div class="amount-selection">
            <h3>Choose Amount:</h3>
            <div class="amount-buttons">
              <button class="amount-btn" data-amount="500">₹500</button>
              <button class="amount-btn" data-amount="1000">₹1,000</button>
              <button class="amount-btn" data-amount="2500">₹2,500</button>
              <button class="amount-btn" data-amount="5000">₹5,000</button>
            </div>
            <div class="custom-amount">
              <input type="number" id="customAmount" placeholder="Enter custom amount" min="100" class="form-input">
            </div>
          </div>
          
          <div class="impact-calculator">
            <h3>Your Impact:</h3>
            <div class="impact-display" id="impactDisplay">
              <p>Select an amount to see your impact</p>
            </div>
          </div>
          
          <div class="donor-info">
            <h3>Your Information:</h3>
            <div class="form-row">
              <input type="text" placeholder="Full Name" class="form-input" required>
              <input type="email" placeholder="Email Address" class="form-input" required>
            </div>
            <input type="tel" placeholder="Phone Number" class="form-input" required>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-primary" id="proceedOnetime">Donate Now</button>
          <button class="btn btn-outline" id="closeModal">Cancel</button>
        </div>
      </div>
    `;

    const modal = CureRise.modal.create(modalContent, { maxWidth: '500px' });
    
    // Setup amount selection
    modal.querySelectorAll('.amount-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        modal.querySelector('#customAmount').value = btn.dataset.amount;
        this.updateImpactDisplay(modal, btn.dataset.amount);
      });
    });

    modal.querySelector('#customAmount').addEventListener('input', (e) => {
      modal.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
      this.updateImpactDisplay(modal, e.target.value);
    });

    modal.querySelector('#proceedOnetime').addEventListener('click', () => {
      const amount = modal.querySelector('#customAmount').value;
      if (amount && amount >= 100) {
        this.processOnetimeDonation(amount);
        CureRise.modal.close(modal);
      } else {
        CureRise.toast.show('Please enter a valid amount (minimum ₹100)', 'error');
      }
    });

    modal.querySelector('#closeModal').addEventListener('click', () => {
      CureRise.modal.close(modal);
    });
  }

  updateImpactDisplay(modal, amount) {
    const impactDisplay = modal.querySelector('#impactDisplay');
    if (!amount || amount < 100) {
      impactDisplay.innerHTML = '<p>Select an amount to see your impact</p>';
      return;
    }

    const meals = Math.floor(amount / 50); // Assuming ₹50 per meal
    const families = Math.floor(amount / 1500); // Families that can be supported for a day

    impactDisplay.innerHTML = `
      <div class="impact-items">
        <div class="impact-item">
          <span class="impact-number">${meals}</span>
          <span class="impact-label">Nutritious meals</span>
        </div>
        ${families > 0 ? `
          <div class="impact-item">
            <span class="impact-number">${families}</span>
            <span class="impact-label">Families fed for a day</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  async processMonthlyDonation(amount) {
    CureRise.toast.show('Setting up your monthly food bank support...', 'success');
    
    try {
      const donationData = {
        amount: parseFloat(amount),
        donation_type: 'monthly',
        donor_name: 'Anonymous Donor',
        donor_email: 'donor@example.com',
        donor_phone: '+91-0000000000',
        payment_method: 'card'
      };

      const response = await CureRiseAPI.createFoodBankDonation(donationData);
      
      CureRise.toast.show(`Thank you! Your monthly support of ₹${amount} has been set up successfully.`, 'success');
      
      setTimeout(() => {
        CureRise.toast.show('You will receive a confirmation email with your monthly donation details.', 'success');
      }, 2000);
    } catch (error) {
      console.error('Failed to create monthly donation:', error);
      CureRise.toast.show('Failed to set up monthly donation. Please try again.', 'error');
    }
  }

  async processOnetimeDonation(amount) {
    CureRise.toast.show('Processing your food bank donation...', 'success');
    
    try {
      const donationData = {
        amount: parseFloat(amount),
        donation_type: 'onetime',
        donor_name: 'Anonymous Donor',
        donor_email: 'donor@example.com',
        donor_phone: '+91-0000000000',
        payment_method: 'card'
      };

      const response = await CureRiseAPI.createFoodBankDonation(donationData);
      
      CureRise.toast.show(`Thank you for your donation of ₹${amount} to support patient nutrition!`, 'success');
      
      // Update stats from API
      await this.updateStatsFromAPI();
      
      setTimeout(() => {
        CureRise.toast.show('You will receive a tax receipt and impact report via email.', 'success');
      }, 2000);
    } catch (error) {
      console.error('Failed to create donation:', error);
      CureRise.toast.show('Failed to process donation. Please try again.', 'error');
    }
  }

  async updateStatsFromAPI() {
    try {
      const stats = await CureRiseAPI.getFoodBankStats();
      
      // Update the stats display on the page
      const mealsProvided = document.querySelector('.impact-stats .stat-number');
      if (mealsProvided) {
        mealsProvided.textContent = stats.meals_provided.toLocaleString() + '+';
      }
      
      const familiesSupported = document.querySelectorAll('.impact-stats .stat-number')[1];
      if (familiesSupported) {
        familiesSupported.textContent = stats.families_supported.toLocaleString() + '+';
      }
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }


  animateStats() {
    // Animate stats when they come into view
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const statNumber = entry.target.querySelector('.stat-number');
          if (statNumber && !statNumber.classList.contains('animated')) {
            this.animateNumber(statNumber);
            statNumber.classList.add('animated');
          }
        }
      });
    }, observerOptions);

    document.querySelectorAll('.stat-item').forEach(item => {
      observer.observe(item);
    });
  }

  animateNumber(element) {
    const text = element.textContent;
    const number = parseInt(text.replace(/[^\d]/g, ''));
    const suffix = text.replace(/[\d,]/g, '');
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(number * progress);
      
      element.textContent = current.toLocaleString() + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }
}

// Initialize the food bank page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FoodBankPage();
});

// Add styles for modal components
const style = document.createElement('style');
style.textContent = `
  .donation-modal {
    max-width: 500px;
    width: 100%;
  }
  
  .modal-header {
    text-align: center;
    margin-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--gray-200);
    padding-bottom: var(--spacing-md);
  }
  
  .modal-subtitle {
    color: var(--primary-600);
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: var(--spacing-sm);
  }
  
  .impact-list {
    list-style: none;
    margin: var(--spacing-md) 0;
  }
  
  .impact-list li {
    padding: var(--spacing-xs) 0;
    position: relative;
    padding-left: var(--spacing-lg);
  }
  
  .impact-list li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--success-600);
    font-weight: 600;
  }
  
  .payment-methods {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin: var(--spacing-md) 0;
  }
  
  .payment-method {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: border-color 0.2s ease;
  }
  
  .payment-method:hover {
    border-color: var(--primary-500);
  }
  
  .amount-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
    margin: var(--spacing-md) 0;
  }
  
  .amount-btn {
    padding: var(--spacing-md);
    border: 2px solid var(--gray-300);
    border-radius: var(--radius-md);
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .amount-btn:hover,
  .amount-btn.selected {
    border-color: var(--primary-500);
    background: var(--primary-50);
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }
  
  .impact-items {
    display: flex;
    gap: var(--spacing-lg);
    justify-content: center;
  }
  
  .impact-item {
    text-align: center;
  }
  
  .impact-number {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--success-600);
  }
  
  .impact-label {
    font-size: 0.875rem;
    color: var(--gray-600);
  }
`;
document.head.appendChild(style);
