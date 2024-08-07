import { ZaloSendResultEvent } from '@chrome-extension-boilerplate/zalo/models';

type MessageHandler = (message: unknown) => void;
const callbacks: Map<string, MessageHandler[]> = new Map<string, MessageHandler[]>();

function zaloAddReceiveMessageListener(callback: (message: unknown) => void) {
  if (callbacks.has('zaloReceivedMessage')) {
    callbacks.get('zaloReceivedMessage')?.push(callback);
    return;
  } else {
    callbacks.set('zaloReceivedMessage', [callback]);
  }
}

function zaloAddListener(callback: (message: unknown) => void) {
  if (callbacks.has('All')) {
    callbacks.get('All')?.push(callback);
    return;
  } else {
    callbacks.set('All', [callback]);
  }
}

function zaloSendMessage(payload: { requestId: string; data: { message: string; phone: string } }): Promise<unknown> {
  return zaloSendRequest('send-message', payload);
}

function zaloAddFriend(payload: { requestId: string; data: { message: string; phone: string } }): Promise<unknown> {
  return zaloSendRequest('request-friend', payload);
}

function zaloSendRequest(
  requestType: 'send-message' | 'request-friend',
  payload: { requestId: string; data: { message: string; phone: string } },
): Promise<unknown> {
  const { requestId, data } = payload;
  const trackingId = data.phone + '-' + Math.random().toString(36).substring(2, 15) + '-' + requestId;

  window.postMessage(
    {
      source: 'zalo_extension',
      action: 'zaloSendRequest',
      message: {
        type: requestType,
        data: data,
        trackingId: trackingId,
        requestId: requestId,
      },
    },
    '*',
  );

  // add handler for action: zaloSendResult if not exists
  if (!callbacks.has('zaloSendResult')) {
    callbacks.set('zaloSendResult', [handleZaloSendResult]);
  }

  const promise = new Promise((resolve, reject) => {
    addTrackingCallback(trackingId, { resolve, reject });
  });

  return promise;
}

function handleZaloSendResult(event: unknown) {
  const message = event as ZaloSendResultEvent;
  const trackingId = message?.message?.zaloMessage?.trackingId;
  if (trackingId) {
    const handlers = callbacks.get(trackingId) || [];
    console.debug('Window: handler send result with tracking', trackingId, handlers);

    handlers.forEach(handler => handler(message));
  }
}

function addTrackingCallback(
  trackingId: string,
  { resolve, reject }: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void },
) {
  const handler: MessageHandler = (event: unknown) => {
    console.debug('Window: handler send result with tracking', event);
    const messageEvent = event as ZaloSendResultEvent;

    if (messageEvent?.message?.error) {
      reject(messageEvent);
    } else {
      resolve(messageEvent);
    }

    //remove handler when done
    callbacks.delete(trackingId);
  };

  callbacks.set(trackingId, [handler]);
}

if (window) {
  window.addEventListener('message', event => {
    const eventData = event.data;

    // Check the event origin to ensure it comes from the content script
    if (eventData?.source !== 'zalo_extension') {
      return;
    }

    console.debug('Window: receive message:', eventData);

    const hanlders = (callbacks.get(eventData.action) || []).concat(callbacks.get('All') || []);

    if (hanlders?.length) {
      hanlders.forEach(callback => callback(eventData));
    }
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.zaloAddReceiveMessageListener = zaloAddReceiveMessageListener;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.zaloSendMessage = zaloSendMessage;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.zaloAddListener = zaloAddListener;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.zaloAddFriend = zaloAddFriend;
}
