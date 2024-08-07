import { ZaloEvent } from '../models/zalo-event-message';

/**
 * dispatch message between regular context and extension context
 * @param message
 */
const dispatch = (message: ZaloEvent) => {
  if (window && 'postMessage' in window) {
    window.postMessage(message);
  }
};

export { dispatch };
