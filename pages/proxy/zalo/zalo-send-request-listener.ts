import { subscribe, unsubscribe } from './zalo-request-listener';
import {
  ZaloEventMessage,
  ZaloSendRequestEvent,
  ZaloSendMessageResult,
  ZaloSendMessageRequest,
  ZaloSendResultEvent,
} from '@chrome-extension-boilerplate/zalo/models';

import { dispatch } from '@chrome-extension-boilerplate/zalo/dispatchers/window-dispatcher';
import { postMessage, addListener, removeListener } from './background-connector';

const start = () => {
  // listen event from regular context
  subscribe('zaloSendRequest', zaloSendMessage);
  //listen event from background
  addListener(processMessageFromBackground);
};

const stop = () => {
  // off listen
  unsubscribe('zaloSendRequest', zaloSendMessage);
  // off listen from background
  removeListener(processMessageFromBackground);
};

function zaloSendMessage(event: ZaloEventMessage) {
  const sendMessageEvent = event as ZaloSendRequestEvent;

  if (sendMessageEvent == null) {
    console.warn(`${event} is not an ZaloSendRequestEvent`);
    return;
  }

  const message = sendMessageEvent.message;

  if (!ZaloSendMessageRequest.isValid(message)) {
    console.warn(`${message} is not an valid ZaloSendMessage`);
    return;
  }

  console.debug('proxy: send message request:', sendMessageEvent);
  // Relay the message to the background script
  postMessage(sendMessageEvent);
}

function processMessageFromBackground(response: unknown) {
  const message = response as ZaloSendMessageResult;
  if (ZaloSendMessageResult.isValid(message)) {
    // eslint-disable-next-line no-debugger
    console.debug('proxy: receive response:', message);

    // Send the response back to the web page
    dispatch(new ZaloSendResultEvent(message));
  }
}

export default { start, stop };
