// Admin Dashboard JavaScript

class AdminDashboard {
  constructor() {
    this.currentTab = 'overview';
    this.pendingCampaigns = [];
    this.patients = [];
    this.init();
  }

  init() {
    // Check admin authentication
    if (!this.checkAdminAuth()) {
      window.location.href = 'login.html';
      return;
    }

    this.setupEventListeners();
    this.loadData();
    this.renderCurrentTab();
  }

  checkAdminAuth() {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) return false;

    try {
      const session = JSON.parse(adminSession);
      return session.isAdmin && session.sessionId;
    } catch (e) {
      return false;
    }
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.currentTarget.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Header actions
    document.getElementById('viewSiteBtn').addEventListener('click', () => {
      window.open('../index.html', '_blank');
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
      this.handleLogout();
    });

    // Add patient button
    document.getElementById('addPatientBtn').addEventListener('click', () => {
      this.showAddPatientModal();
    });
  }

  switchTab(tabName) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    this.currentTab = tabName;
    this.renderCurrentTab();
  }

  loadData() {
    // Load pending campaigns
    this.pendingCampaigns = this.getPendingCampaigns();
    
    // Load patients data
    this.patients = this.getPatients();
    
    // Update stats
    this.updateStats();
  }

  getPendingCampaigns() {
    const stored = localStorage.getItem('pendingCampaigns');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing pending campaigns:', e);
      }
    }
    
    // Default pending campaigns for demo
    return [
      {
        id: 1,
        title: "Help Anita Fight Breast Cancer",
        description: "Anita, a 42-year-old mother of two, has been diagnosed with stage 2 breast cancer. She needs immediate chemotherapy treatment but cannot afford the medical expenses.",
        requesterName: "Rajesh Sharma",
        requesterEmail: "rajesh.sharma@email.com",
        targetAmount: 250000,
        hospital: "Tata Memorial Hospital, Mumbai",
        category: "cancer",
        urgency: "critical",
        submittedDate: "2024-01-15T10:30:00Z",
        status: "pending"
      },
      {
        id: 2,
        title: "Emergency Surgery for Baby Arjun",
        description: "6-month-old Arjun needs urgent heart surgery for a congenital defect. The family is seeking financial assistance for the life-saving operation.",
        requesterName: "Priya Patel",
        requesterEmail: "priya.patel@email.com",
        targetAmount: 400000,
        hospital: "Fortis Hospital, Delhi",
        category: "pediatric",
        urgency: "critical",
        submittedDate: "2024-01-14T15:45:00Z",
        status: "pending"
      },
      {
        id: 3,
        title: "Kidney Transplant for Ramesh",
        description: "Ramesh, a 35-year-old auto driver, needs a kidney transplant. His family has found a donor but needs help with the medical expenses.",
        requesterName: "Sunita Devi",
        requesterEmail: "sunita.devi@email.com",
        targetAmount: 600000,
        hospital: "AIIMS, Delhi",
        category: "emergency",
        urgency: "urgent",
        submittedDate: "2024-01-13T09:20:00Z",
        status: "pending"
      }
    ];
  }

  getPatients() {
    // Get patients from the main patients.js data
    const stored = localStorage.getItem('adminPatients');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing admin patients:', e);
      }
    }
    
    // Default patients data
    return [
      {
        id: 1,
        name: "Rajesh Kumar",
        age: 45,
        condition: "Requires urgent cardiac surgery for blocked arteries. Family unable to afford the ₹3.5L treatment cost.",
        hospital: "Apollo Hospital, Mumbai",
        location: "mumbai",
        category: "cardiac",
        urgency: "critical",
        targetAmount: 350000,
        raisedAmount: 125000,
        image: "../assets/images/placeholder-patient.svg",
        dateAdded: "2024-01-15",
        status: "active"
      },
      {
        id: 2,
        name: "Priya Sharma",
        age: 8,
        condition: "Diagnosed with acute lymphoblastic leukemia. Needs immediate chemotherapy treatment.",
        hospital: "Tata Memorial Hospital, Mumbai",
        location: "mumbai",
        category: "cancer",
        urgency: "critical",
        targetAmount: 500000,
        raisedAmount: 280000,
        image: "../assets/images/placeholder-patient.svg",
        dateAdded: "2024-01-12",
        status: "active"
      }
    ];
  }

  updateStats() {
    document.getElementById('pendingCampaigns').textContent = this.pendingCampaigns.length;
    document.getElementById('totalPatients').textContent = this.patients.filter(p => p.status === 'active').length;
    document.getElementById('campaignBadge').textContent = this.pendingCampaigns.length;
  }

  renderCurrentTab() {
    switch (this.currentTab) {
      case 'overview':
        this.renderOverview();
        break;
      case 'campaigns':
        this.renderCampaigns();
        break;
      case 'patients':
        this.renderPatients();
        break;
      case 'settings':
        this.renderSettings();
        break;
    }
  }

  renderOverview() {
    const recentActivity = document.getElementById('recentActivity');
    const activities = [
      {
        type: 'campaign',
        title: 'New campaign request submitted',
        description: 'Help Anita Fight Breast Cancer',
        time: '2 hours ago',
        icon: 'pending'
      },
      {
        type: 'approval',
        title: 'Campaign approved',
        description: 'Emergency Surgery for Ravi',
        time: '5 hours ago',
        icon: 'approved'
      },
      {
        type: 'patient',
        title: 'New patient added',
        description: 'Mohammed Ali - Spinal Surgery',
        time: '1 day ago',
        icon: 'patients'
      }
    ];

    recentActivity.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon stat-icon ${activity.icon}">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-description">${activity.description}</div>
          <div class="activity-time">${activity.time}</div>
        </div>
      </div>
    `).join('');
  }

  renderCampaigns() {
    const campaignsList = document.getElementById('campaignsList');
    
    if (this.pendingCampaigns.length === 0) {
      campaignsList.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--gray-500);">
          <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24" style="margin-bottom: 1rem;">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <h3>No Pending Campaigns</h3>
          <p>All campaign requests have been reviewed.</p>
        </div>
      `;
      return;
    }

    campaignsList.innerHTML = this.pendingCampaigns.map(campaign => `
      <div class="campaign-card">
        <div class="campaign-header">
          <div>
            <h3 class="campaign-title">${campaign.title}</h3>
            <div class="campaign-meta">
              Submitted by ${campaign.requesterName} • ${this.formatDate(campaign.submittedDate)}
            </div>
          </div>
          <span class="campaign-status status-pending">Pending</span>
        </div>
        
        <p class="campaign-description">${campaign.description}</p>
        
        <div class="campaign-details">
          <div class="detail-item">
            <span class="detail-label">Target Amount</span>
            <span class="detail-value">${this.formatCurrency(campaign.targetAmount)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Hospital</span>
            <span class="detail-value">${campaign.hospital}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Category</span>
            <span class="detail-value">${campaign.category}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Urgency</span>
            <span class="detail-value">${campaign.urgency}</span>
          </div>
        </div>
        
        <div class="campaign-actions">
          <button class="btn btn-outline btn-sm" onclick="adminDashboard.rejectCampaign(${campaign.id})">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            Reject
          </button>
          <button class="btn btn-primary btn-sm" onclick="adminDashboard.approveCampaign(${campaign.id})">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Approve
          </button>
        </div>
      </div>
    `).join('');
  }

  renderPatients() {
    const patientsGrid = document.getElementById('patientsGrid');
    
    patientsGrid.innerHTML = this.patients.filter(p => p.status === 'active').map(patient => {
      const progressPercentage = Math.round((patient.raisedAmount / patient.targetAmount) * 100);
      
      return `
        <div class="patient-admin-card">
          <div class="patient-admin-header">
            <h3 class="patient-admin-name">${patient.name}</h3>
            <div class="patient-admin-meta">
              <span>${patient.age} years</span>
              <span>•</span>
              <span class="urgency-${patient.urgency}">${patient.urgency}</span>
            </div>
          </div>
          <div class="patient-admin-content">
            <p class="patient-admin-condition">${patient.condition}</p>
            <div class="patient-admin-progress">
              <div class="progress-header">
                <span class="progress-raised">${this.formatCurrency(patient.raisedAmount)}</span>
                <span class="progress-target">of ${this.formatCurrency(patient.targetAmount)}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
              </div>
            </div>
            <div class="patient-admin-actions">
              <button class="btn btn-outline btn-sm" onclick="adminDashboard.editPatient(${patient.id})">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Edit
              </button>
              <button class="btn btn-error btn-sm" onclick="adminDashboard.removePatient(${patient.id})">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Remove
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderSettings() {
    // Settings are already rendered in HTML
    console.log('Settings tab rendered');
  }

  // Campaign Actions
  approveCampaign(campaignId) {
    const campaign = this.pendingCampaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    if (confirm(`Approve campaign "${campaign.title}"?`)) {
      // Remove from pending
      this.pendingCampaigns = this.pendingCampaigns.filter(c => c.id !== campaignId);
      
      // Add to approved campaigns (you can store this separately)
      const approvedCampaigns = JSON.parse(localStorage.getItem('approvedCampaigns') || '[]');
      approvedCampaigns.push({
        ...campaign,
        status: 'approved',
        approvedDate: new Date().toISOString()
      });
      
      localStorage.setItem('pendingCampaigns', JSON.stringify(this.pendingCampaigns));
      localStorage.setItem('approvedCampaigns', JSON.stringify(approvedCampaigns));
      
      CureRise.toast.show(`Campaign "${campaign.title}" approved successfully!`, 'success');
      this.updateStats();
      this.renderCampaigns();
    }
  }

  rejectCampaign(campaignId) {
    const campaign = this.pendingCampaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const reason = prompt(`Reject campaign "${campaign.title}"?\n\nPlease provide a reason for rejection:`);
    if (reason) {
      // Remove from pending
      this.pendingCampaigns = this.pendingCampaigns.filter(c => c.id !== campaignId);
      
      // Add to rejected campaigns
      const rejectedCampaigns = JSON.parse(localStorage.getItem('rejectedCampaigns') || '[]');
      rejectedCampaigns.push({
        ...campaign,
        status: 'rejected',
        rejectedDate: new Date().toISOString(),
        rejectionReason: reason
      });
      
      localStorage.setItem('pendingCampaigns', JSON.stringify(this.pendingCampaigns));
      localStorage.setItem('rejectedCampaigns', JSON.stringify(rejectedCampaigns));
      
      CureRise.toast.show(`Campaign "${campaign.title}" rejected.`, 'info');
      this.updateStats();
      this.renderCampaigns();
    }
  }

  // Patient Actions
  showAddPatientModal() {
    const modalHTML = `
      <div class="modal-overlay" id="addPatientModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Add New Patient</h2>
            <button class="modal-close" onclick="adminDashboard.closeModal('addPatientModal')">&times;</button>
          </div>
          
          <form id="addPatientForm">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Patient Name *</label>
                <input type="text" class="form-input" name="name" required>
              </div>
              <div class="form-group">
                <label class="form-label">Age *</label>
                <input type="number" class="form-input" name="age" min="1" max="120" required>
              </div>
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select class="form-select" name="category" required>
                  <option value="">Select Category</option>
                  <option value="cardiac">Cardiac Surgery</option>
                  <option value="cancer">Cancer Treatment</option>
                  <option value="emergency">Emergency Care</option>
                  <option value="pediatric">Pediatric Care</option>
                  <option value="orthopedic">Orthopedic Surgery</option>
                  <option value="neurological">Neurological Treatment</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Urgency *</label>
                <select class="form-select" name="urgency" required>
                  <option value="">Select Urgency</option>
                  <option value="critical">Critical</option>
                  <option value="urgent">Urgent</option>
                  <option value="moderate">Moderate</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label class="form-label">Medical Condition *</label>
                <textarea class="form-textarea" name="condition" required placeholder="Describe the patient's medical condition and treatment needs"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Hospital *</label>
                <input type="text" class="form-input" name="hospital" required placeholder="e.g., Apollo Hospital, Mumbai">
              </div>
              <div class="form-group">
                <label class="form-label">Location *</label>
                <select class="form-select" name="location" required>
                  <option value="">Select Location</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="delhi">Delhi</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="chennai">Chennai</option>
                  <option value="kolkata">Kolkata</option>
                  <option value="hyderabad">Hyderabad</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Target Amount (₹) *</label>
                <input type="number" class="form-input" name="targetAmount" min="1000" required>
              </div>
              <div class="form-group">
                <label class="form-label">Initial Raised Amount (₹)</label>
                <input type="number" class="form-input" name="raisedAmount" min="0" value="0">
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" onclick="adminDashboard.closeModal('addPatientModal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Add Patient</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('addPatientForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddPatient(e.target);
    });
  }

  handleAddPatient(form) {
    const formData = new FormData(form);
    const newPatient = {
      id: Date.now(),
      name: formData.get('name'),
      age: parseInt(formData.get('age')),
      condition: formData.get('condition'),
      hospital: formData.get('hospital'),
      location: formData.get('location'),
      category: formData.get('category'),
      urgency: formData.get('urgency'),
      targetAmount: parseInt(formData.get('targetAmount')),
      raisedAmount: parseInt(formData.get('raisedAmount')) || 0,
      image: "../assets/images/placeholder-patient.svg",
      dateAdded: new Date().toISOString().split('T')[0],
      status: "active"
    };

    this.patients.push(newPatient);
    localStorage.setItem('adminPatients', JSON.stringify(this.patients));
    
    CureRise.toast.show(`Patient "${newPatient.name}" added successfully!`, 'success');
    this.closeModal('addPatientModal');
    this.updateStats();
    this.renderPatients();
  }

  editPatient(patientId) {
    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) return;

    // For now, just show an alert. You can implement a full edit modal later
    CureRise.toast.show('Edit patient functionality coming soon!', 'info');
  }

  removePatient(patientId) {
    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) return;

    if (confirm(`Remove patient "${patient.name}" from the platform?`)) {
      this.patients = this.patients.filter(p => p.id !== patientId);
      localStorage.setItem('adminPatients', JSON.stringify(this.patients));
      
      CureRise.toast.show(`Patient "${patient.name}" removed.`, 'info');
      this.updateStats();
      this.renderPatients();
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  }

  handleLogout() {
    if (confirm('Are you sure you want to logout from admin dashboard?')) {
      localStorage.removeItem('adminSession');
      CureRise.toast.show('Logged out successfully', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
    }
  }

  // Utility functions
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }
}

// Initialize admin dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
  adminDashboard = new AdminDashboard();
});
