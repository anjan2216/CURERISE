// Dashboard JavaScript

class Dashboard {
  constructor() {
    this.user = this.loadUserData();
    this.init();
  }

  init() {
    // Check if user is logged in
    if (!this.user.isLoggedIn) {
      // Redirect to login if not logged in
      window.location.href = 'auth/login.html';
      return;
    }

    this.setupEventListeners();
    this.loadUserName();
    this.setupActionCards();
    this.loadNotifications();
    this.showWelcomeMessage();
  }

  loadUserData() {
    // Get user data from localStorage (set during login/registration)
    const storedUser = localStorage.getItem('currentUser');

    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Fallback data if no user is logged in
    return {
      name: 'Guest User',
      email: 'guest@example.com',
      isLoggedIn: false
    };
  }

  loadUserName() {
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
      userNameEl.textContent = this.user.name;
    }
  }

  showWelcomeMessage() {
    // Show welcome message for new users
    if (this.user.isNewUser) {
      setTimeout(() => {
        CureRise.toast.show(`Welcome to CureRise, ${this.user.name}! Start by exploring the options below.`, 'success');
        // Remove the new user flag
        this.user.isNewUser = false;
        localStorage.setItem('currentUser', JSON.stringify(this.user));
      }, 1000);
    }
  }

  setupEventListeners() {
    // User menu toggle
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
        console.log('User menu toggled:', userDropdown.classList.contains('active'));
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.classList.remove('active');
        }
      });
    } else {
      console.error('User menu elements not found:', { userMenuBtn, userDropdown });
    }

    // Account info button
    const accountInfoBtn = document.getElementById('accountInfoBtn');
    if (accountInfoBtn) {
      accountInfoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openAccountInfo();
      });
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openSettings();
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }

    // Notification button
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
      notificationBtn.addEventListener('click', () => {
        this.showNotifications();
      });
    }


  }

  setupActionCards() {
    // Account Info Card
    const accountInfoCard = document.getElementById('accountInfoCard');
    if (accountInfoCard) {
      accountInfoCard.addEventListener('click', () => this.openAccountInfo());
    }

    // Start Campaign Card
    const startCampaignCard = document.getElementById('startCampaignCard');
    if (startCampaignCard) {
      startCampaignCard.addEventListener('click', () => this.startCampaign());
    }

    // Donate Card
    const donateCard = document.getElementById('donateCard');
    if (donateCard) {
      donateCard.addEventListener('click', () => this.browseDonations());
    }

    // Food Bank Card
    const foodBankCard = document.getElementById('foodBankCard');
    if (foodBankCard) {
      foodBankCard.addEventListener('click', () => this.openFoodBank());
    }

    // Education Card
    const educationCard = document.getElementById('educationCard');
    if (educationCard) {
      educationCard.addEventListener('click', () => this.openEducationCharity());
    }

    // Emergency Card
    const emergencyCard = document.getElementById('emergencyCard');
    if (emergencyCard) {
      emergencyCard.addEventListener('click', () => this.openEmergencyFund());
    }
  }

  openAccountInfo() {
    const loginTime = this.user.loginTime ? new Date(this.user.loginTime).toLocaleString() : 'Not available';
    const accountType = this.user.isNewUser ? 'New Account' : 'Existing Account';

    const modalContent = `
      <div class="account-modal">
        <h2>Account Information</h2>

        <div class="account-section">
          <h3>Login Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Full Name:</span>
              <span class="info-value">${this.user.name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email Address:</span>
              <span class="info-value">${this.user.email}</span>
            </div>
            ${this.user.phone ? `
              <div class="info-item">
                <span class="info-label">Phone Number:</span>
                <span class="info-value">${this.user.phone}</span>
              </div>
            ` : ''}
            <div class="info-item">
              <span class="info-label">Last Login:</span>
              <span class="info-value">${loginTime}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Account Type:</span>
              <span class="info-value">${accountType}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Remember Me:</span>
              <span class="info-value">${this.user.rememberMe ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>

        <div class="account-section">
          <h3>Edit Personal Information</h3>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" value="${this.user.name}" id="editName">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" value="${this.user.email}" id="editEmail">
            </div>
          </div>
          ${!this.user.phone ? `
            <div class="form-group">
              <label class="form-label">Phone Number (Optional)</label>
              <input type="tel" class="form-input" placeholder="Enter phone number" id="editPhone">
            </div>
          ` : `
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="tel" class="form-input" value="${this.user.phone}" id="editPhone">
            </div>
          `}
        </div>
        

        
        <div class="modal-actions">
          <button class="btn btn-primary" id="saveAccount">Save Changes</button>
          <button class="btn btn-outline" id="closeAccount">Close</button>
        </div>
      </div>
    `;

    const modal = CureRise.modal.create(modalContent, { maxWidth: '600px' });
    
    modal.querySelector('#saveAccount').addEventListener('click', () => {
      const newName = modal.querySelector('#editName').value;
      const newEmail = modal.querySelector('#editEmail').value;
      const newPhone = modal.querySelector('#editPhone').value;

      if (newName && newEmail) {
        this.user.name = newName;
        this.user.email = newEmail;
        if (newPhone) {
          this.user.phone = newPhone;
        }

        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.user));

        this.loadUserName();
        CureRise.toast.show('Account information updated successfully!', 'success');
        CureRise.modal.close(modal);
      } else {
        CureRise.toast.show('Please fill in all required fields', 'error');
      }
    });

    modal.querySelector('#closeAccount').addEventListener('click', () => {
      CureRise.modal.close(modal);
    });
  }

  startCampaign() {
    const modalContent = `
      <div class="campaign-modal">
        <h2>Start a Donation Campaign</h2>

        <form class="campaign-form" id="campaignForm">
          <div class="form-group">
            <label class="form-label">Campaign Title *</label>
            <input type="text" class="form-input" id="campaignTitle" placeholder="e.g., Help Priya Fight Cancer" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Target Amount *</label>
              <input type="number" class="form-input" id="targetAmount" placeholder="₹50,000" min="1000" required>
            </div>
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select class="form-input" id="campaignCategory" required>
                <option value="">Select category</option>
                <option value="cardiac">Cardiac Surgery</option>
                <option value="cancer">Cancer Treatment</option>
                <option value="emergency">Emergency Care</option>
                <option value="pediatric">Pediatric Care</option>
                <option value="orthopedic">Orthopedic Surgery</option>
                <option value="neurological">Neurological Treatment</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Campaign Description *</label>
            <textarea class="form-input" id="campaignDescription" rows="4" placeholder="Describe the cause and why funding is needed..." required></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Hospital/Institution *</label>
              <input type="text" class="form-input" id="campaignHospital" placeholder="e.g., Apollo Hospital, Mumbai" required>
            </div>
            <div class="form-group">
              <label class="form-label">Urgency Level *</label>
              <select class="form-input" id="campaignUrgency" required>
                <option value="">Select urgency</option>
                <option value="critical">Critical</option>
                <option value="urgent">Urgent</option>
                <option value="moderate">Moderate</option>
              </select>
            </div>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Submit for Review</button>
            <button type="button" class="btn btn-outline" id="closeCampaign">Cancel</button>
          </div>
        </form>
      </div>
    `;

    const modal = CureRise.modal.create(modalContent, { maxWidth: '600px' });

    modal.querySelector('#campaignForm').addEventListener('submit', (e) => {
      e.preventDefault();

      const title = modal.querySelector('#campaignTitle').value;
      const description = modal.querySelector('#campaignDescription').value;
      const targetAmount = modal.querySelector('#targetAmount').value;
      const category = modal.querySelector('#campaignCategory').value;
      const hospital = modal.querySelector('#campaignHospital').value;
      const urgency = modal.querySelector('#campaignUrgency').value;

      if (title && description && targetAmount && category && hospital && urgency) {
        // Store campaign request for admin approval
        const campaignRequest = {
          id: Date.now(),
          title: title,
          description: description,
          requesterName: this.user.name,
          requesterEmail: this.user.email,
          targetAmount: parseInt(targetAmount),
          hospital: hospital,
          category: category,
          urgency: urgency,
          submittedDate: new Date().toISOString(),
          status: 'pending'
        };

        // Get existing pending campaigns
        const pendingCampaigns = JSON.parse(localStorage.getItem('pendingCampaigns') || '[]');
        pendingCampaigns.push(campaignRequest);
        localStorage.setItem('pendingCampaigns', JSON.stringify(pendingCampaigns));

        CureRise.toast.show('Campaign submitted successfully! It will be reviewed by our admin team within 24 hours.', 'success');
        CureRise.modal.close(modal);
      } else {
        CureRise.toast.show('Please fill in all required fields', 'error');
      }
    });

    modal.querySelector('#closeCampaign').addEventListener('click', () => {
      CureRise.modal.close(modal);
    });
  }

  browseDonations() {
    // Show quick donation modal or redirect to patients page
    const modalContent = `
      <div class="donation-modal">
        <h2>Help a Patient Today</h2>
        <p>Choose how you'd like to help patients in need of medical assistance.</p>

        <div class="donation-options">
          <div class="donation-option-card" id="quickDonation">
            <div class="option-icon">
              <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h3>Quick Donation</h3>
            <p>Make an immediate donation to help urgent cases</p>
            <div class="quick-amounts">
              <button class="amount-btn" data-amount="1000">₹1,000</button>
              <button class="amount-btn" data-amount="2500">₹2,500</button>
              <button class="amount-btn" data-amount="5000">₹5,000</button>
            </div>
          </div>

          <div class="donation-option-card" id="browsePatients">
            <div class="option-icon">
              <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3>Browse Patient Cases</h3>
            <p>View detailed patient stories and choose who to help</p>
            <button class="btn btn-outline">View All Cases</button>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline" id="closeDonation">Close</button>
        </div>
      </div>
    `;

    const modal = CureRise.modal.create(modalContent, { maxWidth: '600px' });

    // Quick donation amounts
    modal.querySelectorAll('.amount-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = btn.dataset.amount;
        const donationData = {
          type: 'quick-donation',
          recipient: 'Urgent Medical Cases',
          hospital: 'Multiple Partner Hospitals',
          amount: amount,
          timestamp: new Date().toISOString()
        };

        localStorage.setItem('pendingDonation', JSON.stringify(donationData));
        CureRise.modal.close(modal);
        window.location.href = 'payment.html';
      });
    });

    // Browse patients option
    modal.querySelector('#browsePatients').addEventListener('click', () => {
      CureRise.modal.close(modal);
      window.location.href = 'patients.html';
    });

    modal.querySelector('#closeDonation').addEventListener('click', () => {
      CureRise.modal.close(modal);
    });
  }

  openFoodBank() {
    window.location.href = 'food-bank.html';
  }

  openEducationCharity() {
    const modalContent = `
      <div class="education-modal">
        <h2>Education Charity Support</h2>
        <p>Support educational initiatives for underprivileged children and families affected by medical emergencies.</p>
        
        <div class="education-options">
          <div class="option-card">
            <h3>School Fee Support</h3>
            <p>Help children continue their education while families deal with medical expenses</p>
            <button class="btn btn-primary" data-type="school-fees">Support School Fees</button>
          </div>
          
          <div class="option-card">
            <h3>Educational Supplies</h3>
            <p>Provide books, uniforms, and supplies to children in need</p>
            <button class="btn btn-primary" data-type="supplies">Donate Supplies</button>
          </div>
          
          <div class="option-card">
            <h3>Scholarship Fund</h3>
            <p>Create scholarships for exceptional students from low-income families</p>
            <button class="btn btn-primary" data-type="scholarship">Create Scholarship</button>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-outline" id="closeEducation">Close</button>
        </div>
      </div>
    `;

    const modal = CureRise.modal.create(modalContent, { maxWidth: '500px' });
    
    modal.querySelectorAll('[data-type]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.target.dataset.type;
        CureRise.toast.show(`Redirecting to ${type} donation page...`, 'success');
        CureRise.modal.close(modal);
      });
    });

    modal.querySelector('#closeEducation').addEventListener('click', () => {
      CureRise.modal.close(modal);
    });
  }

  openEmergencyFund() {
    const modalContent = `
      <div class="emergency-modal">
        <h2>Emergency Fund Contribution</h2>
        <p>Contribute to our emergency fund for critical medical situations that require immediate attention.</p>

        <div class="emergency-info">
          <div class="info-item">
            <strong>Current Emergency Fund:</strong> ₹2,45,000
          </div>
          <div class="info-item">
            <strong>Cases Supported This Month:</strong> 12
          </div>
          <div class="info-item">
            <strong>Average Response Time:</strong> 2 hours
          </div>
        </div>

        <div class="donation-amounts">
          <h3>Quick Donation Amounts:</h3>
          <div class="amount-grid">
            <button class="amount-btn" data-amount="1000">₹1,000</button>
            <button class="amount-btn" data-amount="5000">₹5,000</button>
            <button class="amount-btn" data-amount="10000">₹10,000</button>
            <button class="amount-btn" data-amount="25000">₹25,000</button>
          </div>
          <input type="number" class="form-input" placeholder="Custom amount" min="500" id="customEmergencyAmount">
        </div>

        <div class="modal-actions">
          <button class="btn btn-primary" id="donateEmergency">Proceed to Payment</button>
          <button class="btn btn-outline" id="closeEmergency">Close</button>
        </div>
      </div>
    `;

    const modal = CureRise.modal.create(modalContent, { maxWidth: '500px' });

    modal.querySelectorAll('.amount-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        modal.querySelector('#customEmergencyAmount').value = btn.dataset.amount;
      });
    });

    modal.querySelector('#donateEmergency').addEventListener('click', () => {
      const amount = modal.querySelector('#customEmergencyAmount').value;
      if (amount && amount >= 500) {
        // Store donation details and redirect to payment page
        const donationData = {
          type: 'emergency-fund',
          recipient: 'Emergency Fund',
          hospital: 'CureRise Emergency Fund',
          amount: amount,
          timestamp: new Date().toISOString()
        };

        localStorage.setItem('pendingDonation', JSON.stringify(donationData));
        window.location.href = 'payment.html';
      } else {
        CureRise.toast.show('Please enter a valid amount (minimum ₹500)', 'error');
      }
    });

    modal.querySelector('#closeEmergency').addEventListener('click', () => {
      CureRise.modal.close(modal);
    });
  }

  openSettings() {
    const modalContent = `
      <div class="settings-modal">
        <h2>Settings</h2>
        
        <div class="settings-section">
          <h3>Notification Preferences</h3>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" class="setting-checkbox" checked>
              <span>Email notifications for donation updates</span>
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" class="setting-checkbox" checked>
              <span>SMS alerts for urgent cases</span>
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" class="setting-checkbox">
              <span>Monthly impact reports</span>
            </label>
          </div>
        </div>
        
        <div class="settings-section">
          <h3>Privacy Settings</h3>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" class="setting-checkbox">
              <span>Show my name on donation leaderboard</span>
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" class="setting-checkbox" checked>
              <span>Allow hospitals to send thank you messages</span>
            </label>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-primary" id="saveSettings">Save Settings</button>
          <button class="btn btn-outline" id="closeSettings">Close</button>
        </div>
      </div>
    `;

    const modal = CureRise.modal.create(modalContent, { maxWidth: '500px' });
    
    modal.querySelector('#saveSettings').addEventListener('click', () => {
      CureRise.toast.show('Settings saved successfully!', 'success');
      CureRise.modal.close(modal);
    });

    modal.querySelector('#closeSettings').addEventListener('click', () => {
      CureRise.modal.close(modal);
    });
  }

  showNotifications() {
    const notifications = [
      {
        title: 'Donation Receipt Available',
        message: 'Your donation to Rajesh Kumar has been processed. Receipt is ready for download.',
        time: '2 hours ago',
        type: 'success'
      },
      {
        title: 'New Urgent Case',
        message: 'A critical cardiac surgery case has been added. Your help is needed.',
        time: '5 hours ago',
        type: 'urgent'
      },
      {
        title: 'Monthly Food Bank Update',
        message: 'Your monthly contribution helped provide 30 meals this month.',
        time: '1 day ago',
        type: 'info'
      }
    ];

    const modalContent = `
      <div class="notifications-modal">
        <h2>Notifications</h2>
        
        <div class="notifications-list">
          ${notifications.map(notif => `
            <div class="notification-item ${notif.type}">
              <div class="notification-content">
                <h4 class="notification-title">${notif.title}</h4>
                <p class="notification-message">${notif.message}</p>
                <span class="notification-time">${notif.time}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-outline" id="markAllRead">Mark All as Read</button>
          <button class="btn btn-primary" id="closeNotifications">Close</button>
        </div>
      </div>
    `;

    const modal = CureRise.modal.create(modalContent, { maxWidth: '500px' });
    
    modal.querySelector('#markAllRead').addEventListener('click', () => {
      document.querySelector('.notification-badge').style.display = 'none';
      CureRise.toast.show('All notifications marked as read', 'success');
    });

    modal.querySelector('#closeNotifications').addEventListener('click', () => {
      CureRise.modal.close(modal);
    });
  }



  handleLogout() {
    const confirmLogout = confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      // Clear user data from localStorage
      localStorage.removeItem('currentUser');

      CureRise.toast.show('Logged out successfully', 'success');
      setTimeout(() => {
        window.location.href = 'auth/login.html';
      }, 1000);
    }
  }

  loadNotifications() {
    // Simulate loading notifications
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
      // This would come from an API in a real application
      const unreadCount = 3;
      notificationBadge.textContent = unreadCount;
      notificationBadge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Dashboard();
});

// Add modal styles
const style = document.createElement('style');
style.textContent = `
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
  }

  .account-section,
  .settings-section {
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--gray-200);
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--gray-50);
    border-radius: var(--radius-md);
    border: 1px solid var(--gray-200);
  }

  .info-label {
    font-weight: 600;
    color: var(--gray-700);
  }

  .info-value {
    color: var(--gray-900);
    font-weight: 500;
  }

  .donation-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
    margin: var(--spacing-xl) 0;
  }

  .donation-option-card {
    padding: var(--spacing-xl);
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-lg);
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .donation-option-card:hover {
    border-color: var(--primary-300);
    background: var(--primary-50);
  }

  .donation-option-card .option-icon {
    color: var(--primary-600);
    margin-bottom: var(--spacing-md);
  }

  .donation-option-card h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--gray-900);
    margin-bottom: var(--spacing-sm);
  }

  .donation-option-card p {
    color: var(--gray-600);
    margin-bottom: var(--spacing-md);
  }

  .quick-amounts {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: center;
    flex-wrap: wrap;
  }

  .quick-amounts .amount-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--primary-300);
    background: white;
    color: var(--primary-600);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
  }

  .quick-amounts .amount-btn:hover {
    background: var(--primary-600);
    color: white;
  }
  
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    padding: var(--spacing-sm);
    background: var(--gray-50);
    border-radius: var(--radius-md);
  }
  
  .amount-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
    margin: var(--spacing-md) 0;
  }
  
  .amount-btn.selected {
    background: var(--primary-600);
    color: white;
  }
  
  .option-card {
    background: var(--gray-50);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-md);
    text-align: center;
  }
  
  .emergency-info {
    background: var(--gray-50);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    margin: var(--spacing-lg) 0;
  }
  
  .info-item {
    margin-bottom: var(--spacing-sm);
  }
  
  .setting-item {
    margin-bottom: var(--spacing-md);
  }
  
  .setting-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    cursor: pointer;
  }
`;
document.head.appendChild(style);
