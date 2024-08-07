import sendRequestListener from '../listeners/zalo-send-request-listener';
import receivedMessageListener from '../listeners/zalo-received-message-listener';
import * as windowMessageListener from '../listeners/window-message-listener';

function init() {
  // start listen for window messaging. should call first for sendRequestListener
  windowMessageListener.start();

  // start listen event for send request
  sendRequestListener.start();

  // start listen event for receive message
  receivedMessageListener.start();

  console.log('proxy script loaded');
}

init();
