let port: chrome.runtime.Port;

function setupConnection(): chrome.runtime.Port {
  // Connect to the background script
  port = chrome.runtime.connect({ name: 'content' });

  port.onDisconnect.addListener(() => {
    console.warn('content: port disconnected');
  });

  return port;
}

function postMessage(message: unknown) {
  if (!port) {
    port = setupConnection();
  }

  port.postMessage(message);
}

function addListener(callback: (message: unknown) => void) {
  if (!port) {
    port = setupConnection();
  }

  port.onMessage.addListener(callback);
}

function removeListener(callback: (message: unknown) => void) {
  if (port) {
    port.onMessage.removeListener(callback);
  }
}

function addListenerOnDisconnect(callback: () => void) {
  if (port) {
    port.onDisconnect.addListener(callback);
  }
}

function removeListenerOnDisconnect(callback: () => void) {
  if (port) {
    port.onDisconnect.removeListener(callback);
  }
}

export { postMessage, addListener, removeListener, addListenerOnDisconnect, removeListenerOnDisconnect };
