/// listen event message from regular context
import { ZaloEvent } from '@chrome-extension-boilerplate/zalo/models';

type MessageHandler = (event: ZaloEvent) => void;
const handlers: Map<string, MessageHandler[]> = new Map();

const start = () => {
  if (window) window.addEventListener('message', onMessage, false);
};

const stop = () => {
  if (window) window.removeEventListener('message', onMessage, false);
};

const onMessage = (event: MessageEvent) => {
  // Check the event origin to ensure it comes from a trusted source
  if (event.source !== window) {
    return;
  }

  const message = event.data as ZaloEvent;
  if (message.source === 'zalo_extension') {
    console.debug('Proxy: receive message:', message);

    const callbacks = handlers.get(message.action);
    if (callbacks) callbacks.forEach(callback => callback(message));
  }
};

const subscribe = (action: string, callback: (message: ZaloEvent) => void) => {
  if (handlers.has(action)) {
    handlers.get(action)?.push(callback);
  } else {
    handlers.set(action, [callback]);
  }
};

const unsubscribe = (action: string, callback: (message: ZaloEvent) => void) => {
  if (handlers.has(action)) {
    const actionHandlers = handlers.get(action) || [];
    actionHandlers.splice(actionHandlers.indexOf(callback));
  }
};

export { subscribe, unsubscribe, start, stop };
