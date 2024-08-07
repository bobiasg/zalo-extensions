// listen event message from regular site
// and forward to background
// window message listener must be started
import { subscribe, unsubscribe } from './window-message-listener';
import { ZaloEvent, ZaloReceivedMessageEvent, ZALO_RECEIVED_MESSAGE } from '@chrome-extension-boilerplate/zalo/models';

import { postMessage } from '../connections/background-connector';

const start = () => {
  // listen event from regular context
  subscribe(ZALO_RECEIVED_MESSAGE, zaloReceivedMessage);
};

const stop = () => {
  // off listen
  unsubscribe(ZALO_RECEIVED_MESSAGE, zaloReceivedMessage);
};

function zaloReceivedMessage(event: ZaloEvent) {
  const message = event as ZaloReceivedMessageEvent;

  if (!ZaloReceivedMessageEvent.isValid(message)) {
    console.warn(`${message} is not an valid ZaloMessageData`);
    return;
  }

  console.debug('content: recevied message:', message);
  // Relay the message to the background script
  postMessage(message);
}

export default { start, stop };
