/**
 * ============================================================================
 * Main Page Script
 * ============================================================================
 * Handles home page interactions and navigation.
 * 
 * Maintained by: Frontend Team
 * Last Updated: 2026-02-09
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Home page loaded');

  // Setup page-specific functionality
  setupAccessibilityFeatures();
});

/**
 * Setup accessibility features visibility
 */
function setupAccessibilityFeatures() {
  const details = document.querySelector('details');
  if (details) {
    // Make details accessible
    const summary = details.querySelector('summary');
    if (summary) {
      summary.setAttribute('role', 'button');
      summary.setAttribute('tabindex', '0');

      // Handle keyboard interaction
      summary.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          details.open = !details.open;
        }
      });
    }
  }
}
