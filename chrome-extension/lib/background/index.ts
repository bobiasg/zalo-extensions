import { zaloStorage, zaloMessageStorage } from '@chrome-extension-boilerplate/zalo';
import {
  ZaloEvent,
  ZaloReceivedMessageEvent,
  ZaloSendRequestEvent,
  ZaloSendResultEvent,
} from '@chrome-extension-boilerplate/zalo/models';

// events =========================================================================================
chrome.runtime.onInstalled.addListener(() => {
  // update status zalo connection
  zaloStorage.setStatus('disconnected');

  // clear all message in storage
  zaloMessageStorage.clear();
});

chrome.runtime.onConnect.addListener(handleConnect);

chrome.runtime.onMessage.addListener(handleMessage);

// end events ===================================================================================

// init =======================================================================================

// this is code to prevent background script into inactive state
setInterval(async () => {
  const status = await zaloStorage.getStatus();
  console.log('zalo status:', status);
}, 5000);

// end init ====================================================================================

let contentPort: chrome.runtime.Port | null = null;
let proxyPorts: chrome.runtime.Port[] = [];

type QueueMessageItem = {
  tabId?: number;
  data?: unknown;
  status: 'queue' | 'pending' | 'sent';
  port: chrome.runtime.Port;
};
const queueMessages = new Map<string, QueueMessageItem>();

function handleConnect(port: chrome.runtime.Port) {
  if (port.name === 'content') {
    //only once port#content
    setupContentPort(port);
  }

  if (port.name === 'proxy') {
    setupProxyPort(port);
  }
}

function setupContentPort(port: chrome.runtime.Port) {
  console.debug('connect from content page:', port);

  // clear listerner on disconnect
  port.onDisconnect.addListener(onContentPortDisconnect);

  onContentPortConnected(port);
}

function onContentPortDisconnect(port: chrome.runtime.Port) {
  console.log('disconnect from content page:', port);
  port.onMessage.removeListener(processContentMessage);

  zaloStorage.setStatus('disconnected');

  contentPort = null;
}

function onContentPortConnected(port: chrome.runtime.Port) {
  // eslint-disable-next-line no-debugger
  zaloStorage.setStatus('connected');

  // add listerner for message
  port.onMessage.addListener(processContentMessage);

  // get all queue messages in 'queue' state and send
  queueMessages.forEach(message => {
    if (message.status === 'queue') {
      port.postMessage(message);
      message.status = 'pending';
    }
  });

  contentPort = port;
}

function setupProxyPort(port: chrome.runtime.Port) {
  console.debug('connect from proxy page:', port);

  port.onDisconnect.addListener(onProxyPortDisconnect);

  onProxyPortConnected(port);
}

function onProxyPortDisconnect(port: chrome.runtime.Port) {
  console.log('disconnect from proxy page:', port);
  port.onMessage.removeListener(processProxyMessage);

  // clear out messages of this port in queueMessages
  queueMessages.forEach((message, key) => {
    if (message.port === port) {
      queueMessages.delete(key);
    }
  });

  // remove port from proxyPorts
  proxyPorts = proxyPorts.filter(item => item != port);
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function onProxyPortConnected(port: chrome.runtime.Port) {
  port.onMessage.addListener(processProxyMessage);

  proxyPorts.push(port);
}

/**
 * process message from content page
 * @param message
 */
function processContentMessage(message: ZaloEvent, port: chrome.runtime.Port) {
  console.debug('received message from content:', message);

  switch (message.action) {
    case 'zaloReceivedMessage':
      processZaloReceivedMessage(message as ZaloReceivedMessageEvent, port);
      break;
    case 'zaloSendResult':
      processZaloSendResult(message as ZaloSendResultEvent, port);
      break;
  }
}

/**
 * send out message to all proxy
 * @param message
 * @param port
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function processZaloReceivedMessage(message: ZaloReceivedMessageEvent, port: chrome.runtime.Port) {
  // send to proxy
  proxyPorts.forEach(proxyPort => {
    proxyPort.postMessage(message);
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function processZaloSendResult(event: ZaloSendResultEvent, port: chrome.runtime.Port) {
  // send to proxy

  // find port that send request from queueMessages
  //const requestPort = findPortForMessage(message);

  const queueMessage = queueMessages.get(event.message.zaloMessage.trackingId);
  if (queueMessage) {
    queueMessages.delete(event.message.zaloMessage.trackingId);
    if (queueMessage.port != null) {
      queueMessage.port.postMessage(event);
    }
  }
}

// function findPortForMessage(event: ZaloSendResultEvent): chrome.runtime.Port | null | undefined {
//   if (queueMessages.has(event.message.zaloMessage.trackingId)) {
//     return queueMessages.get(event.message.zaloMessage.trackingId)?.port;
//   }

//   return null;
// }

/**
 * process message from proxy page
 * @param message
 */
function processProxyMessage(message: ZaloEvent, port: chrome.runtime.Port) {
  console.debug('received message from proxy:', message);

  switch (message.action) {
    case 'zaloSendRequest':
      processZaloSendRequest(message as ZaloSendRequestEvent, port);
      break;
  }
}

function processZaloSendRequest(event: ZaloSendRequestEvent, port: chrome.runtime.Port) {
  const queueMessage: QueueMessageItem = {
    tabId: event.tabId,
    data: event.message,
    status: 'queue',
    port: port,
  } as QueueMessageItem;

  // add to queue
  queueMessages.set(event.message.trackingId, queueMessage);

  // send to content
  if (contentPort != null) {
    contentPort.postMessage(event);
    queueMessage.status = 'sent';
  }
}

/**
 * handle message for send message from another page with chrome.runtime.sendMessage
 * @param request
 * @param sender
 * @param sendResponse
 */
function handleMessage(
  request: unknown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sender: chrome.runtime.MessageSender,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sendResponse: (response?: unknown) => void,
) {
  console.debug('received message from another page:', request);
  // const zaloEvent = request as ZaloEvent;

  // switch (zaloEvent.action) {
  //   // case 'zaloSendRequest':
  //   //   break;
  //   // case 'zaloReceivedMessage':
  //   // case 'zaloSendResult':
  // }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (request?.type == 'reconnect-zalo') {
    reloadZaloTab(sendResponse);
    return;
  }

  // no process, send response to source
  sendResponse({});
}

function reloadZaloTab(callback: (response?: unknown) => void) {
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

  callback({ message: 'reconnecting zalo' });
}

// TODO when extension reload ???

// =========================================================================

// //listen connect from content page
// function handleConnect(port: chrome.runtime.Port) {
//   if (port.name === 'content') {
//     console.log('connect from content page:', port);
//     zaloPort = port;

//     // eslint-disable-next-line no-debugger
//     zaloStorage.setStatus('connected');

//     // //init chat mode
//     // zaloPort.postMessage({
//     //   type: 'init-chat-mode',
//     // });

//     // add listernet for processing message from content. it is result of zalo request
//     zaloPort.onMessage.addListener(processContentMessage);

//     const handleZaloRequest = processZaloRequest(zaloPort);
//     // add listener for message
//     chrome.runtime.onMessage.addListener(handleZaloRequest);

//     // clear listerner on disconnect
//     zaloPort.onDisconnect.addListener(() => {
//       console.log('disconnect from content page:', zaloPort);

//       zaloPort?.onMessage.removeListener(processContentMessage);
//       chrome.runtime.onMessage.removeListener(handleZaloRequest);

//       zaloStorage.setStatus('disconnected');

//       // send out all pending message
//       queueMessages.forEach(({ data, callback }) => {
//         callback({ error: 'disconnected', zaloEvent: data });
//       });
//     });
//   }

//   if (port.name == 'proxy') {
//     console.log('connect from proxy page:', port);
//     proxyPort = port;
//   }
// }

// // process zalo request from proxy
// function processZaloRequest(
//   port: chrome.runtime.Port,
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
// ): (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   return (request, sender, sendResponse) => {
//     //listen request form proxy
//     if (request.action === 'zaloRequest') {
//       chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//         const tab = tabs && tabs.length > 0 ? tabs[0] : { id: 0, url: '' };

//         const { id: tabId, url: tabUrl } = tab;
//         //TODO check tabUrl is allowed

//         console.log('Tab ID:', tabId);
//         console.log('Tab URL:', tabUrl);

//         const { data } = request;
//         console.log(`background: Received zalo requet from ${tabId}-${tabUrl}:`, data);

//         // //gen tracking id
//         // const trackingId = `${tabId}-${Date.now()}`;
//         // //add tracking id to data
//         // data.trackingId = trackingId;

//         //store response callback
//         queueMessages.set(data.trackingId, {
//           tabId,
//           data,
//           status: 'sent', //TODO when port not available, status will be pending, and will process after port reconnected
//           callback: sendResponse,
//         });

//         zaloMessageStorage.addMessage({ ...data, status: 'pending' });

//         //TODO handle loss connection between content and background
//         //message should remain in queue, waiting for reconnect

//         // forward message to content script for processing
//         port.postMessage(data);

//         return true;
//       });
//     }
//     // for async call sendResponse;
//     return true;
//   };
// }

// // function process message from content script, usually is zalo processing result
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// function processContentMessage(message: ZaloEvent): void {
//   // eslint-disable-next-line no-debugger
//   console.log('background: received message from content:', message);

//   if (message.action === 'zaloReceivedMessage') {
//     console.log('background: forward received message', message);

//     if (proxyPort) {
//       proxyPort.postMessage(message);
//     } else {
//       console.warn(`proxy port disconnected`);
//     }

//     // chrome.tabs.query({}, function (tabs) {
//     //   for (let i = 0; i < tabs.length; i++) {
//     //     chrome.tabs.sendMessage(tabs[i].id || 0, request, function (response) {
//     //       if (chrome.runtime.lastError) {
//     //         console.error('Error sending message to tab ' + tabs[i].id + ': ' + chrome.runtime.lastError.message);
//     //       } else {
//     //         console.log('Response from tab ' + tabs[i].id + ': ' + response);
//     //       }
//     //     });
//     //   }
//     // });
//   } else {
//     // Process the message...
//     const trackingId = (message.message as ZaloSendMessageRequest).trackingId;
//     // get sendResponse from queue
//     if (trackingId && queueMessages.has(trackingId)) {
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       const { tabId, callback } = queueMessages.get(trackingId) as QueueMessageItem;

//       //send response to content page
//       callback(message);
//       queueMessages.delete(trackingId);

//       // zaloMessageStorage.updateMessage(trackingId, (message.message as ZaloSendMessageRequest).status);
//     } else {
//       chrome.runtime.sendMessage(message, response => {
//         console.log('background: Done', message, response);
//       });
//     }
//   }
// }
// events ==================================================================

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log('background received message:', request);
//   // listen message from sidepanel
//   if (request.type === 'reconnect-zalo') {
//     chrome.tabs.query({ url: '*://chat.zalo.me/*' }, tabs => {
//       const tab = tabs.length > 0 ? tabs[0] : null;
//       if (tab && tab.id) {
//         // Check if tab.id is defined
//         chrome.tabs.reload(tab.id);
//       } else {
//         //open new tab with zalo url
//         chrome.tabs.create({ url: 'https://chat.zalo.me/' });
//       }
//     });

//     sendResponse({ message: 'reconnecting zalo' });
//   }

//   //listen request form proxy
//   if (request.action === 'zaloRequest') {
//     zaloStorage.getStatus().then(zaloStatus => {
//       if (zaloStatus !== 'connected') {
//         console.log('background: zalo not connected, send error response');
//         sendResponse({ error: 'disconnected', zaloEvent: request.data });
//       }
//     });
//   }

//   // if (request.action === 'zaloReceivedMessage') {
//   //   console.log('background: forward zaloReveiced', request);

//   //   if (proxyPort) {
//   //     proxyPort.postMessage(request);
//   //   } else {
//   //     console.warn(`proxy port disconnected`);
//   //   }

//   //   // chrome.tabs.query({}, function (tabs) {
//   //   //   for (let i = 0; i < tabs.length; i++) {
//   //   //     chrome.tabs.sendMessage(tabs[i].id || 0, request, function (response) {
//   //   //       if (chrome.runtime.lastError) {
//   //   //         console.error('Error sending message to tab ' + tabs[i].id + ': ' + chrome.runtime.lastError.message);
//   //   //       } else {
//   //   //         console.log('Response from tab ' + tabs[i].id + ': ' + response);
//   //   //       }
//   //   //     });
//   //   //   }
//   //   // });

//   //   sendResponse({});
//   // }

//   return true;
// });

//===========================================================

//===========================================================
