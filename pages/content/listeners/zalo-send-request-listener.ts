// listen event message from background
// and enqueue to processing on zalo app

import {
  addListener,
  removeListener,
  postMessage,
  addListenerOnDisconnect,
  removeListenerOnDisconnect,
} from '../connections/background-connector';
import { ZaloSendRequestEvent, ZaloSendResultEvent } from '@chrome-extension-boilerplate/zalo/models';
import { useZaloEventProcessor } from '@zalo/zalo-event-processor';

type Subscription = {
  unsubscribe: () => void;
};

// eslint-disable-next-line react-hooks/rules-of-hooks
const { processor, enqueue } = useZaloEventProcessor();
let messageSubscription: Subscription;

const start = () => {
  //listen event from background
  addListener(processMessageFromBackground);

  addListenerOnDisconnect(onDisconnect);

  messageSubscription = subscribeResult();
};

const stop = () => {
  // off listen from background
  removeListener(processMessageFromBackground);

  removeListenerOnDisconnect(onDisconnect);

  unsubscribeResult(messageSubscription);
};

function processMessageFromBackground(event: unknown) {
  // handle message from background
  console.debug('content: received message from background:', event);
  const messageEvent = event as ZaloSendRequestEvent;

  if (ZaloSendRequestEvent.isValid(messageEvent)) {
    enqueue(messageEvent.message);
  }
}

function subscribeResult(): Subscription {
  //listerner event result and send back to background
  const subscription = processor.subscribe(result => {
    console.debug('content: processed result:', result);
    postMessage(new ZaloSendResultEvent(result));
  });

  return subscription;
}

function unsubscribeResult(subscription: Subscription) {
  subscription?.unsubscribe();
}

function onDisconnect() {
  console.log('content: port disconnected');

  // unsubscribeResult(subscription);
  //   //TODO handle reconnect
  // // Retry connection up to 3 times
  // if (retryCount < 3) {
  //   console.log(`content: retrying connection (${retryCount + 1})`);
  //   setTimeout(() => connectToBackgroundScript(retryCount + 1), 1000);
  // } else {
  //   console.log('content: failed to reconnect after 3 attempts');
  // }
}

export default { start, stop };
