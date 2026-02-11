/**
 * ============================================================================
 * Registration Page Script
 * ============================================================================
 * Handles user registration form submission and validation.
 * Supports complex password requirements.
 * 
 * Maintained by: Frontend Team
 * Last Updated: 2026-02-09
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  // Guard against missing form
  if (!registerForm) {
    console.error('Register form not found');
    return;
  }

  // Real-time password validation
  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      validatePassword(passwordInput.value);
    });
  }

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous messages
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');

    // Get form data with validation
    const emailEl = document.getElementById('email');
    const firstNameEl = document.getElementById('firstName');
    const lastNameEl = document.getElementById('lastName');
    const passwordEl = document.getElementById('password');

    if (!emailEl || !firstNameEl || !lastNameEl || !passwordEl) {
      console.error('Missing form elements', {
        email: emailEl,
        firstName: firstNameEl,
        lastName: lastNameEl,
        password: passwordEl
      });
      showError('Form elements missing. Please refresh the page.');
      return;
    }

    const formData = {
      email: emailEl.value.trim(),
      first_name: firstNameEl.value.trim(),
      last_name: lastNameEl.value.trim(),
      password: passwordEl.value
    };

    // Validate all inputs
    const validation = validateFormData(formData);
    if (!validation.valid) {
      showError(validation.message);
      return;
    }

    // Check terms checkbox
    if (!document.getElementById('terms').checked) {
      showError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    // Disable submit button
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      // Call registration API
      const result = await AUTH.register(formData);

      // Show success message
      successMessage.textContent = 'Registration successful! Redirecting to login...';
      successMessage.classList.remove('hidden');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/pages/login.html';
      }, 2000);
    } catch (error) {
      showError(error.message || 'Registration failed. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });

  function validateFormData(data) {
    // Email validation
    if (!isValidEmail(data.email)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }

    // Name validation
    if (!data.first_name || data.first_name.length < 1) {
      return { valid: false, message: 'First name is required' };
    }

    if (!data.last_name || data.last_name.length < 1) {
      return { valid: false, message: 'Last name is required' };
    }

    // Password validation
    const passwordValidation = validatePassword(data.password, true);
    if (!passwordValidation.valid) {
      return { valid: false, message: passwordValidation.message };
    }

    return { valid: true };
  }

  function validatePassword(password, returnObject = false) {
    const errors = [];

    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('One number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('One special character (!@#$%^&*)');
    }

    const passwordError = document.getElementById('passwordError');
    if (passwordError) {
      if (errors.length > 0) {
        passwordError.textContent = `Password needs: ${errors.join(', ')}`;
      } else {
        passwordError.textContent = '';
      }
    }

    if (returnObject) {
      return {
        valid: errors.length === 0,
        message: errors.length > 0 ? `Password needs: ${errors.join(', ')}` : ''
      };
    }

    return errors.length === 0;
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

});
