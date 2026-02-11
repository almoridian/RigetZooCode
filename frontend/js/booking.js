/**
 * ============================================================================
 * Zoo Booking Page Script
 * ============================================================================
 * Handles ticket booking form, availability checking, and price calculation.
 * 
 * Maintained by: Frontend Team
 * Last Updated: 2026-02-09
 * ============================================================================
 */

let selectedTicketPrice = 0;

document.addEventListener('DOMContentLoaded', async () => {
  await loadTicketTypes();
  setupFormListeners();
});

/**
 * Load available ticket types from API
 */
async function loadTicketTypes() {
  try {
    const response = await AUTH.apiRequest('/bookings/ticket-types');
    const ticketTypeSelect = document.getElementById('ticketType');

    response.forEach(ticket => {
      const option = document.createElement('option');
      option.value = ticket.ticket_type_id;
      option.textContent = `${ticket.name} - DKK ${ticket.price.toFixed(2)}`;
      option.dataset.price = ticket.price;
      option.dataset.name = ticket.name;
      ticketTypeSelect.appendChild(option);
    });

    // Handle ticket type change
    ticketTypeSelect.addEventListener('change', (e) => {
      const selected = e.target.options[e.target.selectedIndex];
      selectedTicketPrice = parseFloat(selected.dataset.price) || 0;
      updatePriceSummary();
    });
  } catch (error) {
    showError('Failed to load ticket types: ' + error.message);
  }
}

/**
 * Setup form event listeners
 */
function setupFormListeners() {
  const checkAvailBtn = document.getElementById('checkAvailBtn');
  const bookingForm = document.getElementById('bookingForm');
  const bookBtn = document.getElementById('bookBtn');
  const quantityInput = document.getElementById('quantity');

  // Check availability button
  checkAvailBtn.addEventListener('click', checkAvailability);

  // Update price on quantity change
  quantityInput.addEventListener('change', updatePriceSummary);

  // Book button
  if (bookBtn) {
    bookBtn.addEventListener('click', createBooking);
  }
}

/**
 * Check ticket availability
 */
async function checkAvailability() {
  const bookingDate = document.getElementById('bookingDate').value;
  const ticketTypeId = document.getElementById('ticketType').value;
  const quantity = parseInt(document.getElementById('quantity').value);

  // Validate inputs
  if (!ticketTypeId) {
    showError('Please select a ticket type');
    return;
  }

  if (!bookingDate) {
    showError('Please select a booking date');
    return;
  }

  if (quantity < 1 || quantity > 10) {
    showError('Quantity must be between 1 and 10');
    return;
  }

  try {
    const response = await AUTH.apiRequest('/bookings/check-availability', {
      method: 'POST',
      body: JSON.stringify({
        booking_date: bookingDate,
        ticket_type_id: parseInt(ticketTypeId),
        quantity
      })
    });

    const resultDiv = document.getElementById('availabilityResult');
    const message = document.getElementById('availabilityMessage');

    if (response.available) {
      message.textContent = '✓ Tickets are available!';
      resultDiv.style.backgroundColor = '#e8f5e9';
      resultDiv.style.color = '#2e7d32';
      resultDiv.classList.remove('hidden');

      // Show price summary
      updatePriceSummary();
    } else {
      message.textContent = '✗ Sorry, tickets are not available for this date/quantity';
      resultDiv.style.backgroundColor = '#ffebee';
      resultDiv.style.color = '#c62828';
      resultDiv.classList.remove('hidden');
      
      // Hide price summary
      document.getElementById('priceSummary').classList.add('hidden');
    }
  } catch (error) {
    showError('Availability check failed: ' + error.message);
  }
}

/**
 * Update price summary display
 */
function updatePriceSummary() {
  const quantity = parseInt(document.getElementById('quantity').value);
  const ticketTypeSelect = document.getElementById('ticketType');
  const selected = ticketTypeSelect.options[ticketTypeSelect.selectedIndex];

  if (!selectedTicketPrice || !selected.dataset.name) {
    return;
  }

  const totalPrice = selectedTicketPrice * quantity;

  document.getElementById('summaryTicketType').textContent = selected.dataset.name;
  document.getElementById('summaryDate').textContent = document.getElementById('bookingDate').value;
  document.getElementById('summaryPrice').textContent = `DKK ${selectedTicketPrice.toFixed(2)}`;
  document.getElementById('summaryQuantity').textContent = quantity;
  document.getElementById('summaryTotal').textContent = `DKK ${totalPrice.toFixed(2)}`;

  document.getElementById('priceSummary').classList.remove('hidden');
}

/**
 * Create booking
 */
async function createBooking() {
  // Check if user is authenticated
  if (!AUTH.isAuthenticated()) {
    showError('Please login to make a booking');
    setTimeout(() => {
      window.location.href = '/pages/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    }, 1000);
    return;
  }

  const ticketTypeId = document.getElementById('ticketType').value;
  const bookingDate = document.getElementById('bookingDate').value;
  const quantity = parseInt(document.getElementById('quantity').value);

  try {
    const response = await AUTH.apiRequest('/bookings/create', {
      method: 'POST',
      body: JSON.stringify({
        ticket_type_id: parseInt(ticketTypeId),
        booking_date: bookingDate,
        quantity
      })
    });

    showSuccess(
      `Booking created! Reference: ${response.booking.booking_reference}\n` +
      `Total: DKK ${response.booking.total_price.toFixed(2)}`
    );

    // Reset form
    document.getElementById('bookingForm').reset();
    document.getElementById('priceSummary').classList.add('hidden');

    // Redirect to account after 2 seconds
    setTimeout(() => {
      window.location.href = '/pages/account.html';
    }, 2000);
  } catch (error) {
    showError('Booking failed: ' + error.message);
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
  setTimeout(() => {
    errorDiv.classList.add('hidden');
  }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
  const successDiv = document.getElementById('successMessage');
  successDiv.textContent = message;
  successDiv.classList.remove('hidden');
}
