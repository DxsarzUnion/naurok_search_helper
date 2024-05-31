function handleClick(event) {
  const selectedText = event.target.closest('.test-content-text-inner')?.textContent;
  browser.runtime.sendMessage({ action: 'getStatus' }, function(response) {
    const isEnabled = response.isActive;
    if (selectedText && isEnabled) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(selectedText)}`;
      browser.runtime.sendMessage({ action: 'search', url: searchUrl });
    }
  });
}

document.addEventListener('click', handleClick);
