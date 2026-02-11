/**
 * ============================================================================
 * Hotel Booking Page Script
 * ============================================================================
 * Handles hotel room search, availability checking, and booking.
 * 
 * Maintained by: Frontend Team
 * Last Updated: 2026-02-09
 * ============================================================================ */

let selectedRoomData = null;

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('hotelSearchForm');
  const redeemForm = document.getElementById('redeemForm');

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await searchRooms();
  });
});

/**
 * Search for available rooms
 */
async function searchRooms() {
  const checkInDate = document.getElementById('checkInDate').value;
  const checkOutDate = document.getElementById('checkOutDate').value;
  const occupancy = parseInt(document.getElementById('occupancy').value);

  // Validate inputs
  if (!checkInDate || !checkOutDate) {
    showError('Please select both check-in and check-out dates');
    return;
  }

  if (new Date(checkOutDate) <= new Date(checkInDate)) {
    showError('Check-out date must be after check-in date');
    return;
  }

  if (occupancy < 1) {
    showError('Please enter number of guests');
    return;
  }

  try {
    const response = await AUTH.apiRequest('/hotel/search', {
      method: 'POST',
      body: JSON.stringify({
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        occupancy
      })
    });

    displayAvailableRooms(response.available_rooms, checkInDate, checkOutDate);
    showSuccess(`Found ${response.available_rooms.length} available room(s)`);
  } catch (error) {
    showError('Room search failed: ' + error.message);
  }
}

/**
 * Display available rooms
 */
function displayAvailableRooms(rooms, checkInDate, checkOutDate) {
  const roomsList = document.getElementById('roomsList');
  const availableRoomsDiv = document.getElementById('availableRooms');
  const bookingDetails = document.getElementById('bookingDetails');

  roomsList.innerHTML = '';

  if (rooms.length === 0) {
    roomsList.innerHTML = '<p>No rooms available for selected dates</p>';
    availableRoomsDiv.classList.remove('hidden');
    bookingDetails.classList.add('hidden');
    return;
  }

  rooms.forEach(room => {
    const roomCard = document.createElement('div');
    roomCard.className = 'room-card';
    roomCard.setAttribute('role', 'button');
    roomCard.setAttribute('tabindex', '0');

    const amenitiesList = (room.amenities || '').split(',').join(', ');
    const nights = Math.ceil(
      (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
    );

    roomCard.innerHTML = `
      <h4>${room.room_number} - ${room.room_type}</h4>
      <p><strong>Occupancy:</strong> Up to ${room.max_occupancy} guests</p>
      <p><strong>Price per night:</strong> DKK ${room.price_per_night.toFixed(2)}</p>
      <p><strong>Total (${nights} nights):</strong> DKK ${room.total_price.toFixed(2)}</p>
      <p><strong>Amenities:</strong> ${amenitiesList}</p>
    `;

    roomCard.addEventListener('click', () => selectRoom(room, checkInDate, checkOutDate));
    roomCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectRoom(room, checkInDate, checkOutDate);
      }
    });

    roomsList.appendChild(roomCard);
  });

  availableRoomsDiv.classList.remove('hidden');
  bookingDetails.classList.remove('hidden');
}

/**
 * Select a room and prepare for booking
 */
function selectRoom(room, checkInDate, checkOutDate) {
  selectedRoomData = {
    room_id: room.room_id,
    check_in_date: checkInDate,
    check_out_date: checkOutDate,
    room_info: room
  };

  // Highlight selected room
  document.querySelectorAll('.room-card').forEach(card => {
    card.style.borderColor = '#ddd';
    card.style.backgroundColor = 'white';
  });

  event.currentTarget.style.borderColor = '#2c5f2d';
  event.currentTarget.style.backgroundColor = '#f0f8f0';

  showSuccess(`Room ${room.room_number} selected`);
}

/**
 * Create hotel booking
 */
async function createHotelBooking() {
  // Check if user is authenticated
  if (!AUTH.isAuthenticated()) {
    showError('Please login to make a booking');
    setTimeout(() => {
      window.location.href = '/pages/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    }, 1000);
    return;
  }

  if (!selectedRoomData) {
    showError('Please select a room first');
    return;
  }

  const occupancy = parseInt(document.getElementById('occupancy').value);
  const specialRequests = document.getElementById('specialRequests').value;

  try {
    const response = await AUTH.apiRequest('/hotel/book', {
      method: 'POST',
      body: JSON.stringify({
        room_id: selectedRoomData.room_id,
        check_in_date: selectedRoomData.check_in_date,
        check_out_date: selectedRoomData.check_out_date,
        number_of_guests: occupancy,
        special_requests: specialRequests
      })
    });

    showSuccess(
      `Hotel booking created! Reference: ${response.booking.booking_reference}\n` +
      `Total: DKK ${response.booking.total_price.toFixed(2)}`
    );

    // Reset form
    document.getElementById('hotelSearchForm').reset();
    document.getElementById('availableRooms').classList.add('hidden');
    document.getElementById('bookingDetails').classList.add('hidden');
    selectedRoomData = null;

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
