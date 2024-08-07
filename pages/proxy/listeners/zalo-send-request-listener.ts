// listen event message from regular site base on window message
// and send message to background

import { subscribe, unsubscribe } from './window-message-listener';
import {
  ZaloEvent,
  ZaloSendRequestEvent,
  ZaloSendMessageResult,
  ZaloSendMessageRequest,
  ZaloSendResultEvent,
  ZALO_SEND_REQUEST,
} from '@chrome-extension-boilerplate/zalo/models';

import { dispatch } from '@chrome-extension-boilerplate/zalo/dispatchers/window-dispatcher';
import { postMessage, addListener, removeListener } from '../connections/background-connector';

const start = () => {
  // listen event from regular context
  subscribe(ZALO_SEND_REQUEST, zaloSendMessage);
  //listen event from background
  addListener(processMessageFromBackground);
};

const stop = () => {
  // off listen
  unsubscribe(ZALO_SEND_REQUEST, zaloSendMessage);
  // off listen from background
  removeListener(processMessageFromBackground);
};

function zaloSendMessage(event: ZaloEvent) {
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

  console.debug('Proxy: send message request to background:', sendMessageEvent);
  // Relay the message to the background script
  postMessage(sendMessageEvent);
}

function processMessageFromBackground(response: unknown) {
  const event = response as ZaloSendResultEvent;
  const message = event.message as ZaloSendMessageResult;
  if (ZaloSendMessageResult.isValid(message)) {
    // eslint-disable-next-line no-debugger
    console.debug('proxy: receive send result from background:', message);

    // Send the response back to the web page
    dispatch(event);
  }
}

export default { start, stop };
