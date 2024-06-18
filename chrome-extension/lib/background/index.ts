import 'webextension-polyfill';
import { zaloStorage, zaloMessageStorage } from '@chrome-extension-boilerplate/zalo';

// TODO when extension reload ???
type QueueMessageItem = {
  tabId?: number;
  data?: unknown;
  status: 'pending' | 'sent';
  callback: (response?: unknown) => void;
};

let zaloPort: chrome.runtime.Port | null = null;
const queueMessages = new Map<string, QueueMessageItem>();
// =========================================================================

//listen connect from content page
function handleConnect(port: chrome.runtime.Port) {
  console.log('connect from content page:', port);

  if (port.name === 'content') {
    zaloPort = port;

    // eslint-disable-next-line no-debugger
    zaloStorage.setStatus('connected');

    // //init chat mode
    // zaloPort.postMessage({
    //   type: 'init-chat-mode',
    // });

    // add listernet for processing message from content. it is result of zalo request
    zaloPort.onMessage.addListener(processContentMessage);

    const handleZaloRequest = processZaloRequest(zaloPort);
    // add listener for message
    chrome.runtime.onMessage.addListener(handleZaloRequest);

    // clear listerner on disconnect
    zaloPort.onDisconnect.addListener(() => {
      console.log('disconnect from content page:', zaloPort);

      zaloPort?.onMessage.removeListener(processContentMessage);
      chrome.runtime.onMessage.removeListener(handleZaloRequest);

      zaloStorage.setStatus('disconnected');
    });
  }
}

function processZaloRequest(
  port: chrome.runtime.Port,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (request, sender, sendResponse) => {
    //listen request form proxy
    if (request.action === 'zaloRequest') {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs && tabs.length > 0 ? tabs[0] : { id: 0, url: '' };

        const { id: tabId, url: tabUrl } = tab;
        //TODO check tabUrl is allowed

        console.log('Tab ID:', tabId);
        console.log('Tab URL:', tabUrl);

        const { data } = request;
        console.log(`background: Received zalo requet from ${tabId}-${tabUrl}:`, data);

        //gen tracking id
        const trackingId = `${tabId}-${Date.now()}`;
        //add tracking id to data
        data.trackingId = trackingId;

        //store response callback
        queueMessages.set(trackingId, {
          tabId,
          data,
          status: 'sent', //TODO when port not available, status will be pending, and will process after port reconnected
          callback: sendResponse,
        });

        zaloMessageStorage.addMessage({ ...data, status: 'pending' });

        //TODO handle loss connection between content and background
        //message should remain in queue, waiting for reconnect

        // Process the request from the content script
        port.postMessage(data);

        return true;
      });
    }
    // for async call sendResponse;
    return true;
  };
}

// function process message from content script, usually is zalo processing result
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processContentMessage(message: any): void {
  // eslint-disable-next-line no-debugger
  console.log('background: received message from content:', message);
  // Process the message...
  const trackingId = message.zaloEvent.trackingId;
  // get sendResponse from queue
  if (trackingId && queueMessages.has(trackingId)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tabId, callback } = queueMessages.get(trackingId) as QueueMessageItem;

    //send response to content page
    callback(message);
    queueMessages.delete(trackingId);

    zaloMessageStorage.updateMessage(trackingId, message.error ? 'error' : 'success');
  } else {
    chrome.runtime.sendMessage(message, response => {
      console.log('background: Done', message, response);
    });
  }
}
// events ==================================================================

chrome.runtime.onInstalled.addListener(() => {
  zaloStorage.setStatus('disconnected');
});

chrome.runtime.onConnect.addListener(handleConnect);

// listen message from sidepanel
chrome.runtime.onMessage.addListener(request => {
  //listen request form proxy
  if (request.type === 'reconnect-zalo') {
    chrome.tabs.query({ url: '*://chat.zalo.me/*' }, tabs => {
      const tab = tabs.length > 0 ? tabs[0] : null;
      if (tab && tab.id) {
        // Check if tab.id is defined
        chrome.tabs.reload(tab.id);
      } else {
        //open new tab with zalo url
        chrome.tabs.create({ url: 'https://chat.zalo.me/' });
      }
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('chat.zalo.me')) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: functionToInject,
      world: 'MAIN',
    });
  }
});

//TODO wip should on off requestAnimationFrame by send message between content script and web page with window.sendMessage
function functionToInject() {
  const customRequestAnimationFrame = function (callback: TimerHandler) {
    console.log('Custom requestAnimationFrame called');
    return window.setTimeout(callback, 1000 / 60); // Example: fallback to setTimeout with 60fps
  };

  console.log('This is a Zalo chat page.');
  window.requestAnimationFrame = customRequestAnimationFrame;

  console.log(window);
}

//===========================================================

//===========================================================

// this is code to prevent background script into inactive state
setInterval(async () => {
  const status = await zaloStorage.getStatus();
  console.log('zalo status:', status);
}, 5000);
