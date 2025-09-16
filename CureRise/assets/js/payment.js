// Payment Page JavaScript

class PaymentSystem {
  constructor() {
    this.currentMethod = 'upi';
    this.selectedBank = null;
    this.qrTimer = null;
    this.init();
  }

  init() {
    this.loadDonationDetails();
    this.setupEventListeners();
    this.initializePaymentMethods();
    this.setupFormValidation();
    this.startQRTimer();
  }

  loadDonationDetails() {
    const donationData = localStorage.getItem('pendingDonation');
    if (donationData) {
      try {
        const donation = JSON.parse(donationData);

        // Update donation details in the UI
        const recipientEl = document.getElementById('donationRecipient');
        const hospitalEl = document.getElementById('hospitalName');
        const amountEl = document.getElementById('donationAmount');
        const qrAmountEl = document.getElementById('qr-amount');

        if (recipientEl) recipientEl.textContent = donation.recipient;
        if (hospitalEl) hospitalEl.textContent = donation.hospital;
        if (amountEl) amountEl.textContent = `₹${donation.amount}`;
        if (qrAmountEl) qrAmountEl.textContent = donation.amount;

        // Update all amount displays
        document.querySelectorAll('.summary-value').forEach(el => {
          if (el.textContent.includes('₹')) {
            el.textContent = `₹${donation.amount}`;
          }
        });

        // Update pay button
        this.donationAmount = donation.amount;
        this.updatePayButton();

      } catch (e) {
        console.error('Error loading donation details:', e);
      }
    }
  }

  setupEventListeners() {
    // Payment method tabs
    document.querySelectorAll('.payment-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const method = e.currentTarget.dataset.method;
        this.switchPaymentMethod(method);
      });
    });

    // UPI method selection
    document.querySelectorAll('input[name="upi-method"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.handleUPIMethodChange(e.target.value);
      });
    });

    // Bank selection
    document.querySelectorAll('.bank-option').forEach(bank => {
      bank.addEventListener('click', (e) => {
        const bankCode = e.currentTarget.dataset.bank;
        this.selectBank(bankCode, e.currentTarget);
      });
    });

    // Other banks dropdown
    const otherBanksSelect = document.getElementById('other-banks');
    if (otherBanksSelect) {
      otherBanksSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          this.selectBank(e.target.value);
        }
      });
    }

    // Pay now button
    const payNowBtn = document.getElementById('payNowBtn');
    if (payNowBtn) {
      payNowBtn.addEventListener('click', () => {
        this.processPayment();
      });
    }

    // Card number formatting
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
      cardNumberInput.addEventListener('input', (e) => {
        this.formatCardNumber(e.target);
      });
    }

    // Expiry date formatting
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
      expiryInput.addEventListener('input', (e) => {
        this.formatExpiryDate(e.target);
      });
    }
  }

  switchPaymentMethod(method) {
    // Update active tab
    document.querySelectorAll('.payment-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-method="${method}"]`).classList.add('active');

    // Show/hide content areas
    document.querySelectorAll('.payment-content-area').forEach(area => {
      area.classList.add('hidden');
    });
    document.getElementById(`${method}-content`).classList.remove('hidden');

    this.currentMethod = method;

    // Update pay button text
    this.updatePayButton();
  }

  handleUPIMethodChange(method) {
    const upiIdInput = document.getElementById('upi-id-input');
    
    if (method === 'upi-id') {
      upiIdInput.style.display = 'block';
    } else {
      upiIdInput.style.display = 'none';
    }
  }

  selectBank(bankCode, element = null) {
    // Remove previous selection
    document.querySelectorAll('.bank-option').forEach(bank => {
      bank.classList.remove('selected');
    });

    // Add selection to clicked bank
    if (element) {
      element.classList.add('selected');
    }

    this.selectedBank = bankCode;
    console.log('Selected bank:', bankCode);
  }

  initializePaymentMethods() {
    // Initialize UPI ID input visibility
    this.handleUPIMethodChange('upi-id');
    
    // Set default payment method
    this.switchPaymentMethod('upi');
  }

  setupFormValidation() {
    // Card number validation
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
      cardNumberInput.addEventListener('blur', () => {
        this.validateCardNumber(cardNumberInput.value);
      });
    }

    // UPI ID validation
    const upiIdInput = document.getElementById('upi-id-field');
    if (upiIdInput) {
      upiIdInput.addEventListener('blur', () => {
        this.validateUPIId(upiIdInput.value);
      });
    }
  }

  formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    
    input.value = formattedValue;
    
    // Detect card type
    this.detectCardType(value);
  }

  formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
  }

  detectCardType(cardNumber) {
    const cardTypeIcon = document.getElementById('card-type');
    if (!cardTypeIcon) return;

    const firstDigit = cardNumber.charAt(0);
    const firstTwoDigits = cardNumber.substring(0, 2);

    if (firstDigit === '4') {
      cardTypeIcon.textContent = '💳'; // Visa
    } else if (firstTwoDigits >= '51' && firstTwoDigits <= '55') {
      cardTypeIcon.textContent = '💳'; // Mastercard
    } else if (firstTwoDigits === '60' || firstTwoDigits === '65') {
      cardTypeIcon.textContent = '💳'; // RuPay
    } else if (firstTwoDigits === '34' || firstTwoDigits === '37') {
      cardTypeIcon.textContent = '💳'; // Amex
    } else {
      cardTypeIcon.textContent = '';
    }
  }

  validateCardNumber(cardNumber) {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return cleanNumber.length >= 13 && cleanNumber.length <= 19;
  }

  validateUPIId(upiId) {
    const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    return upiPattern.test(upiId);
  }

  startQRTimer() {
    let timeLeft = 600; // 10 minutes in seconds
    const timerElement = document.getElementById('qr-timer');
    
    if (!timerElement) return;

    this.qrTimer = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      
      timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      if (timeLeft <= 0) {
        clearInterval(this.qrTimer);
        this.regenerateQR();
      }
      
      timeLeft--;
    }, 1000);
  }

  regenerateQR() {
    const qrElement = document.getElementById('qr-code-image');
    if (qrElement) {
      qrElement.innerHTML = `
        <div class="qr-expired">
          <p>QR Code Expired</p>
          <button class="btn btn-outline btn-sm" onclick="location.reload()">Generate New QR</button>
        </div>
      `;
    }
  }

  updatePayButton() {
    const payBtn = document.getElementById('payNowBtn');
    if (!payBtn) return;

    const amount = this.donationAmount ? `₹${this.donationAmount}` : '₹5,000';
    let buttonText = '';

    switch (this.currentMethod) {
      case 'upi':
        buttonText = `Pay ${amount} via UPI`;
        break;
      case 'cards':
        buttonText = `Pay ${amount} via Card`;
        break;
      case 'netbanking':
        buttonText = `Pay ${amount} via Net Banking`;
        break;
      case 'qr':
        buttonText = `Scan QR to Pay ${amount}`;
        break;
      default:
        buttonText = `Pay ${amount} Securely`;
    }

    payBtn.innerHTML = `
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
      </svg>
      ${buttonText}
    `;
  }

  processPayment() {
    const payBtn = document.getElementById('payNowBtn');
    
    // Validate based on current method
    if (!this.validateCurrentMethod()) {
      return;
    }

    // Show loading state
    payBtn.classList.add('loading');
    payBtn.innerHTML = `
      <div class="spinner"></div>
      Processing Payment...
    `;

    // Simulate payment processing
    setTimeout(() => {
      this.handlePaymentSuccess();
    }, 3000);
  }

  validateCurrentMethod() {
    switch (this.currentMethod) {
      case 'upi':
        return this.validateUPIPayment();
      case 'cards':
        return this.validateCardPayment();
      case 'netbanking':
        return this.validateNetBankingPayment();
      case 'qr':
        return true; // QR doesn't need validation
      default:
        return false;
    }
  }

  validateUPIPayment() {
    const selectedMethod = document.querySelector('input[name="upi-method"]:checked').value;
    
    if (selectedMethod === 'upi-id') {
      const upiId = document.getElementById('upi-id-field').value;
      if (!upiId || !this.validateUPIId(upiId)) {
        CureRise.toast.show('Please enter a valid UPI ID', 'error');
        return false;
      }
    }
    
    return true;
  }

  validateCardPayment() {
    const cardNumber = document.getElementById('card-number').value;
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;
    const cardholderName = document.getElementById('cardholder-name').value;

    if (!cardNumber || !this.validateCardNumber(cardNumber)) {
      CureRise.toast.show('Please enter a valid card number', 'error');
      return false;
    }

    if (!expiry || expiry.length !== 5) {
      CureRise.toast.show('Please enter a valid expiry date', 'error');
      return false;
    }

    if (!cvv || cvv.length < 3) {
      CureRise.toast.show('Please enter a valid CVV', 'error');
      return false;
    }

    if (!cardholderName.trim()) {
      CureRise.toast.show('Please enter cardholder name', 'error');
      return false;
    }

    return true;
  }

  validateNetBankingPayment() {
    if (!this.selectedBank) {
      const otherBank = document.getElementById('other-banks').value;
      if (!otherBank) {
        CureRise.toast.show('Please select your bank', 'error');
        return false;
      }
    }
    return true;
  }

  handlePaymentSuccess() {
    // Show success message
    CureRise.toast.show('Payment successful! Thank you for your donation.', 'success');
    
    // Redirect to success page after a delay
    setTimeout(() => {
      window.location.href = 'payment-success.html';
    }, 2000);
  }
}

// Initialize payment system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PaymentSystem();
});

// Add payment-specific styles
const style = document.createElement('style');
style.textContent = `
  .qr-expired {
    text-align: center;
    padding: var(--spacing-lg);
    color: var(--gray-600);
  }
  
  .qr-expired p {
    margin-bottom: var(--spacing-md);
    font-weight: 500;
  }
`;
document.head.appendChild(style);
