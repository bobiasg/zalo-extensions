import { addListener, removeListener } from './background-connector';
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
  console.debug('proxy: received message from background:', event);
  const message = event as ZaloReceivedMessageEvent;

  if (ZaloReceivedMessageEvent.isValid(message)) {
    dispatch(message);
  }
}

export default { start, stop };
