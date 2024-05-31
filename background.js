let isEnabled = false;

function toggleExtension() {
  isEnabled = !isEnabled;
  updateBadge();
}

function updateBadge() {
  browser.browserAction.setBadgeText({ text: isEnabled ? "ON" : "OFF" });
}

function getActiveStatus() {
  return isEnabled;
}
updateBadge()
browser.browserAction.onClicked.addListener(toggleExtension);

browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'toggle') {
    toggleExtension();
    sendResponse({ isActive: isEnabled });
  } else if (message.action === 'getStatus') {
    sendResponse({ isActive: isEnabled });
  } else if (message.action === 'search') {
    if (isEnabled) {
      browser.tabs.create({ url: message.url });
    }
  }
});
