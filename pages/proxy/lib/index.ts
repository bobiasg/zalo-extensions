import sendRequestListener from '../zalo/zalo-send-request-listener';
import receivedMessageListener from '../zalo/zalo-received-message-listener';

function init() {
  // start listen event for send request
  sendRequestListener.start();

  // start listen event for receive message
  receivedMessageListener.start();

  console.log('proxy script loaded');
}

init();
