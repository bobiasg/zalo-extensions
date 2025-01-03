// listen event message from background
// and send to regular site base on window messaging

import { addListener, removeListener } from '../connections/background-connector';
import { dispatch } from '@chrome-extension-boilerplate/zalo/dispatchers/window-dispatcher';
import { ZaloReceivedMessageEvent } from '@chrome-extension-boilerplate/zalo/models';

const start = () => {
  //listen event from background
  addListener(processMessageFromBackground);
};

const stop = () => {
  // off listen from background
  removeListener(processMessageFromBackground);
};

function processMessageFromBackground(event: unknown) {
  // handle message from background

  const message = event as ZaloReceivedMessageEvent;

  if (ZaloReceivedMessageEvent.isValid(message)) {
    console.debug('proxy: received message from background:', message);
    dispatch(message);
  }
}

export default { start, stop };
