import { ZaloEventMessage } from '../models/zalo-event-message';

/**
 * dispatch message between regular context and extension context
 * @param message
 */
const dispatch = (message: ZaloEventMessage) => {
  if (window && 'postMessage' in window) {
    window.postMessage(message);
  }
};

export { dispatch };
