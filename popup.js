document.addEventListener('DOMContentLoaded', function() {
  const statusElement = document.getElementById('status');
  const toggleButton = document.getElementById('toggleButton');

  function updateStatus() {
    browser.runtime.sendMessage({ action: 'getStatus' }, function(response) {
      statusElement.textContent = response.isActive ? "Assistant is ON" : "Assistant is OFF";
    });
  }

  toggleButton.addEventListener('click', function() {
    browser.runtime.sendMessage({ action: 'toggle' });
    updateStatus();
  });

  updateStatus();
});
