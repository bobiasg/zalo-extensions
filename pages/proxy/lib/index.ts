interface ProxyRequest {
  action: string;
  data: unknown;
  tabId?: number;
  tabUrl?: string;
}

function isZaloEvent(obj: unknown) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    'data' in obj &&
    (obj.type === 'request-friend' || obj.type === 'send-message') &&
    typeof obj.data === 'object' &&
    obj.data !== null &&
    'phone' in obj.data &&
    'message' in obj.data &&
    typeof obj.data.phone === 'string' &&
    typeof obj.data.message === 'string'
  );
}

/// message is ZaloEvent
function zaloSendMessage(message: unknown) {
  const request: ProxyRequest = {
    action: 'zaloRequest',
    data: message,
  };

  console.log('proxy: send request:', request);
  // Relay the message to the background script
  chrome.runtime.sendMessage(request, response => {
    // eslint-disable-next-line no-debugger
    console.log('proxy: receive response:', response);

    // Send the response back to the web page
    window.postMessage(
      {
        source: 'zalo_extension',
        action: 'zaloResponse',
        message: response,
      },
      '*',
    );
  });
}

// proxy receive message from regular page and send to background script
// Listen for messages from the web page
window.addEventListener('message', event => {
  // Check the event origin to ensure it comes from a trusted source
  if (event.source !== window) {
    return;
  }

  const message = event.data.message;
  console.log(message);

  if (isZaloEvent(message)) {
    zaloSendMessage(message);
  }
});

//TODO fallback to receive message from background script
//request:
// {
//   "error": false,
//   "zaloEvent": {
//       "type": "send-message",
//       "data": {
//           "phone": "0948832001",
//           "message": "Hello from background script"
//       },
//       "requestId": "123",
//       "trackingId": "311023625-1717913930760"
//   }
// }
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('proxy: receive request:', request);

  // Process the message...
  // Send a response
  sendResponse({ message: 'Goodbye from the proxy script!' });
});

// //test
// setTimeout(() => {
//   zaloSendMessage({
//     type: 'send-message',
//     data: {
//       phone: '0948832001',
//       message: 'Hello from background script',
//     },
//     requestId: '123',
//   });
// }, 5000);

// example data
/*
message = {
    type: 'send-message',
    data: {
      phone: '0948832001',
      message: 'Hello from background script',
    },
    requestId: '123',
  };

response = {
  error: boolean,
  message?: string, //error message
  zaloEvent: message
}

ex: {
    "error": false,
    "zaloEvent": {
        "type": "send-message",
        "data": {
            "phone": "0948832001",
            "message": "Hello from background script"
        },
        "requestId": "123",
        "trackingId": "311023625-1717913930760"
    }
}

*/

// script on web page
/* 
// Function to send a message to the content script
    function sendMessageToExtension(message) {
      window.postMessage({ message: message }, "*");
    }

    // Listen for messages from the content script
    window.addEventListener("message", (event) => {
      // Check the event origin to ensure it comes from the content script
      if (event.source !== window || event.data.source !== "zalo_extension") {
        return;
      }

      // Handle the response message
      console.log("Response from content script:", event.data.message);
    });

    // Example of sending a message to the content script
    document.addEventListener("DOMContentLoaded", () => {
      sendMessageToExtension({
        type: 'request-friend' | 'send-message',
        data: {
          phone: string;
          message: string;
        },
        "requestId": string,
      });
    });
*/
