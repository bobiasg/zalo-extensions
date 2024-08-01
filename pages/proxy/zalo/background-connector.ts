let port: chrome.runtime.Port;

function setupConnection(): chrome.runtime.Port {
  port = chrome.runtime.connect({ name: 'proxy' });

  port.onDisconnect.addListener(() => {
    console.warn('proxy: port disconnected');
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

export { postMessage, addListener, removeListener };
