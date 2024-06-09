console.log('background loaded');
// chrome.scripting
//   .registerContentScripts([
//     {
//       id: 'content',
//       matches: ['https://*.zalo.me/*'],
//       js: ['content/index.iife.js'],
//       runAt: 'document_idle',
//       // eslint-disable-next-line
//       // @ts-ignore
//       world: chrome.scripting.ExecutionWorld.MAIN,
//     },
//   ])
//   .then(() => console.log('zalo registered'))
//   .catch(error => console.error(error));

// chrome.action.onClicked.addListener(tab => {
//   chrome.scripting
//     .executeScript({
//       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//       // @ts-ignore
//       target: { tabId: tab.id },
//       files: ['zalo/index.iife.js'],
//     })
//     .then(() => console.log('zalo registered'))
//     .catch(error => console.error(error));
// });

// chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
//   if (req.type === 'github-account') {
//     chrome.storage.sync.get(GITHUB_ACCOUNT_KEY).then(result => {
//       sendResponse(result);
//     })
//   }
//   return true;
// })

// // Get the extension ID
// const extensionId = chrome.runtime.id;
// console.log('Extension ID:', extensionId);

// //listen tab created and send extensionId
// chrome.tabs.onCreated.addListener(tab => {
//   console.log(tab);

//   const message = {
//     message: 'Connect from Zalo extentions',
//     extensionId: extensionId,
//   };
//   chrome.tabs.sendMessage(tab.id ?? 0, message, response => {});
// });

// //listen message from tab
// chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
//   console.log(request);

//   // Send a response
//   sendResponse({ farewell: 'Goodbye from the background script!' });
// });

type QueueMessageItem = {
  tabId?: number;
  callback: (response?: unknown) => void;
};

const queueMessages = new Map<string, QueueMessageItem>();

//listen connect from content page
chrome.runtime.onConnect.addListener(port => {
  console.log('connect from content page:', port);

  // if (port.name === 'content') {
  port.onMessage.addListener(message => {
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
    } else {
      chrome.runtime.sendMessage(message, response => {
        console.log('background: Done', message, response);
      });
    }
  });
  // }

  port.onDisconnect.addListener(() => {
    console.log('disconnect from content page:', port);
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
          tabId: tabId,
          callback: sendResponse,
        });
        // Process the request from the content script
        port.postMessage(data);

        return true;
      });
    }

    // for async call sendResponse;
    return true;
  });
});
