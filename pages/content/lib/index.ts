import sendRequestListener from '../listeners/zalo-send-request-listener';
import receivedMessageListener from '../listeners/zalo-received-message-listener';
import * as windowMessageListener from '../listeners/window-message-listener';

function init() {
  windowMessageListener.start();
  sendRequestListener.start();
  receivedMessageListener.start();

  console.log('content script loaded');
}

init();
