/// window listener for messsage from zalo extension

/***
 * message handler
 */
type MessageHandler = (message: MessageEvent) => void;

const subscribers: MessageHandler[] = [];

/***
 * return subscription
 * should be call unsubscribe when not use
 */
const subscribe = (callback: (message: MessageEvent) => void) => {
  return subscribers.push(callback);
};

const unsubscribe = (callback: (message: MessageEvent) => void) => {
  return subscribers.splice(subscribers.indexOf(callback));
};

const start = () => {
  if (window) window.addEventListener('message', onMessage);
};

const stop = () => {
  if (window) window.removeEventListener('message', onMessage);
};

const onMessage = (event: MessageEvent) => {
  if (event.data?.source == 'zalo_extension') {
    subscribers.forEach(callback => callback(event));
  }
};

export { subscribe, unsubscribe, start, stop };
