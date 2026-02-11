/**
 * ============================================================================
 * Login Page Script
 * ============================================================================
 * Handles user login form submission and validation.
 * 
 * Maintained by: Frontend Team
 * Last Updated: 2026-02-09
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous messages
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');

    // Get form data
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validate inputs
    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }

    // Disable submit button
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      // Call login API
      const result = await AUTH.login(email, password);

      // Show success message
      successMessage.textContent = 'Login successful! Redirecting...';
      successMessage.classList.remove('hidden');

      // Redirect to account page or home
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      setTimeout(() => {
        window.location.href = redirect || '/pages/account.html';
      }, 1000);
    } catch (error) {
      showError(error.message || 'Login failed. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});
