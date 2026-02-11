/**
 * ============================================================================
 * Account Page Script
 * ============================================================================
 * Handles user account management, profile editing, bookings, and rewards.
 * 
 * Maintained by: Frontend Team
 * Last Updated: 2026-02-09
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!AUTH.isAuthenticated()) {
    window.location.href = '/pages/login.html';
    return;
  }

  setupTabs();
  await loadProfileData();
  await loadBookings();
  await loadRewards();
  setupFormListeners();
});

/**
 * Setup tab switching functionality
 */
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and panels
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      // Add active class to clicked tab and corresponding panel
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panelId = tab.getAttribute('aria-controls');
      document.getElementById(panelId).classList.add('active');
    });

    // Keyboard navigation
    tab.addEventListener('keydown', (e) => {
      let nextTab;
      if (e.key === 'ArrowRight') {
        nextTab = tab.nextElementSibling || tabs[0];
        nextTab.focus();
        nextTab.click();
      } else if (e.key === 'ArrowLeft') {
        nextTab = tab.previousElementSibling || tabs[tabs.length - 1];
        nextTab.focus();
        nextTab.click();
      }
    });
  });
}

/**
 * Load user profile data
 */
async function loadProfileData() {
  try {
    const user = await AUTH.apiRequest('/users/profile');

    const profileInfo = document.getElementById('profileInfo');
    const updateForm = document.getElementById('updateProfileForm');

    profileInfo.innerHTML = `
      <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Phone:</strong> ${user.phone_number || 'Not provided'}</p>
      <p><strong>Role:</strong> ${user.role}</p>
      <p><strong>Account Status:</strong> ${user.is_active ? 'Active' : 'Inactive'}</p>
    `;

    // Populate update form
    if (updateForm) {
      document.getElementById('firstName').value = user.first_name;
      document.getElementById('lastName').value = user.last_name;
      document.getElementById('phone').value = user.phone_number || '';
      document.getElementById('dateOfBirth').value = user.date_of_birth || '';
    }
  } catch (error) {
    showError('Failed to load profile: ' + error.message);
  }
}

/**
 * Load user bookings
 */
async function loadBookings() {
  try {
    const bookings = await AUTH.apiRequest('/users/bookings');

    // Load zoo bookings
    const zooList = document.getElementById('zooBookingsList');
    if (bookings.zoo_bookings && bookings.zoo_bookings.length > 0) {
      zooList.innerHTML = bookings.zoo_bookings.map(b => `
        <div class="booking-card">
          <p><strong>Reference:</strong> ${b.booking_reference}</p>
          <p><strong>Type:</strong> ${b.ticket_type}</p>
          <p><strong>Date:</strong> ${b.booking_date}</p>
          <p><strong>Quantity:</strong> ${b.quantity}</p>
          <p><strong>Total:</strong> DKK ${b.total_price.toFixed(2)}</p>
          <p><strong>Status:</strong> ${b.booking_status}</p>
        </div>
      `).join('');
    }

    // Load hotel bookings
    const hotelList = document.getElementById('hotelBookingsList');
    if (bookings.hotel_bookings && bookings.hotel_bookings.length > 0) {
      hotelList.innerHTML = bookings.hotel_bookings.map(b => `
        <div class="booking-card">
          <p><strong>Reference:</strong> ${b.booking_reference}</p>
          <p><strong>Room:</strong> ${b.room_number} (${b.room_type})</p>
          <p><strong>Check-in:</strong> ${b.check_in_date}</p>
          <p><strong>Check-out:</strong> ${b.check_out_date}</p>
          <p><strong>Guests:</strong> ${b.number_of_guests}</p>
          <p><strong>Total:</strong> DKK ${b.total_price.toFixed(2)}</p>
          <p><strong>Status:</strong> ${b.booking_status}</p>
        </div>
      `).join('');
    }

    // Load educational bookings
    const eduList = document.getElementById('eduBookingsList');
    if (bookings.educational_bookings && bookings.educational_bookings.length > 0) {
      eduList.innerHTML = bookings.educational_bookings.map(b => `
        <div class="booking-card">
          <p><strong>Reference:</strong> ${b.booking_reference}</p>
          <p><strong>Date:</strong> ${b.booking_date}</p>
          <p><strong>Participants:</strong> ${b.number_of_participants}</p>
          <p><strong>Total:</strong> DKK ${b.total_price.toFixed(2)}</p>
          <p><strong>Status:</strong> ${b.booking_status}</p>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Failed to load bookings:', error);
  }
}

/**
 * Load rewards data
 */
async function loadRewards() {
  try {
    const rewards = await AUTH.apiRequest('/rewards');

    const rewardsInfo = document.getElementById('rewardsInfo');
    rewardsInfo.innerHTML = `
      <h4>Your Rewards</h4>
      <p><strong>Tier:</strong> <span style="font-size: 1.2em;">⭐ ${rewards.tier.toUpperCase()}</span></p>
      <p><strong>Current Points:</strong> ${rewards.points_balance}</p>
      <p><strong>Total Points Earned:</strong> ${rewards.total_points_earned}</p>
      <p style="margin-top: 15px; font-size: 0.9em;">
        <strong>Tier Benefits:</strong><br>
        Bronze: Basic discounts | Silver (500+ pts): 5% off | 
        Gold (2000+ pts): 10% off | Platinum (5000+ pts): 15% off + VIP lounge
      </p>
    `;

    // Load transactions
    const transactions = await AUTH.apiRequest('/rewards/transactions');
    const transactionsList = document.getElementById('transactionsList');

    if (transactions.transactions && transactions.transactions.length > 0) {
      transactionsList.innerHTML = transactions.transactions.map(t => `
        <div style="padding: 10px; border-bottom: 1px solid #ddd;">
          <p><strong>${t.transaction_type.toUpperCase()}:</strong> ${t.points_amount} points</p>
          <p>${t.description}</p>
          <small>${new Date(t.created_at).toLocaleDateString()}</small>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Failed to load rewards:', error);
  }
}

/**
 * Setup form listeners
 */
function setupFormListeners() {
  const editBtn = document.getElementById('editProfileBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const updateForm = document.getElementById('updateProfileForm');
  const profileInfo = document.getElementById('profileInfo');
  const updateProfileBtn = updateForm ? updateForm.querySelector('button[type="submit"]') : null;
  const accessibilityForm = document.getElementById('accessibilityForm');
  const redeemForm = document.getElementById('redeemForm');

  // Edit profile
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      profileInfo.classList.add('hidden');
      updateForm.classList.remove('hidden');
      editBtn.classList.add('hidden');
    });
  }

  // Cancel edit
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      profileInfo.classList.remove('hidden');
      updateForm.classList.add('hidden');
      editBtn.classList.remove('hidden');
    });
  }

  // Update profile submit
  if (updateProfileBtn) {
    updateForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const updates = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        phone_number: document.getElementById('phone').value || null,
        date_of_birth: document.getElementById('dateOfBirth').value || null
      };

      try {
        await AUTH.apiRequest('/users/profile', {
          method: 'PUT',
          body: JSON.stringify(updates)
        });

        showSuccess('Profile updated successfully');
        await loadProfileData();

        profileInfo.classList.remove('hidden');
        updateForm.classList.add('hidden');
        editBtn.classList.remove('hidden');
      } catch (error) {
        showError('Failed to update profile: ' + error.message);
      }
    });
  }

  // Accessibility needs
  if (accessibilityForm) {
    accessibilityForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const needs = [];
      document.querySelectorAll('.checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
        needs.push({ type: checkbox.value });
      });

      try {
        await AUTH.apiRequest('/users/accessibility', {
          method: 'POST',
          body: JSON.stringify({ needs })
        });

        showSuccess('Accessibility needs updated');
      } catch (error) {
        showError('Failed to update accessibility needs: ' + error.message);
      }
    });
  }

  // Redeem points
  if (redeemForm) {
    redeemForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const points = parseInt(document.getElementById('redeemPoints').value);
      const description = document.getElementById('redeemDescription').value;

      try {
        await AUTH.apiRequest('/rewards/redeem', {
          method: 'POST',
          body: JSON.stringify({ points, description })
        });

        showSuccess(`${points} points redeemed successfully!`);
        redeemForm.reset();
        await loadRewards();
      } catch (error) {
        showError('Redemption failed: ' + error.message);
      }
    });
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

/**
 * Show success message
 */
function showSuccess(message) {
  const successDiv = document.getElementById('successMessage');
  successDiv.textContent = message;
  successDiv.classList.remove('hidden');
  setTimeout(() => {
    successDiv.classList.add('hidden');
  }, 3000);
}
