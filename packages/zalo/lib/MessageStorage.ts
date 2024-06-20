import { useStorageSuspense } from '@chrome-extension-boilerplate/shared';
import { BaseStorage, StorageType, createStorage } from '@chrome-extension-boilerplate/storage';

export type ZaloEventType = 'request-friend' | 'send-message' | 'init-chat-mode';
export type ZaloEventData = {
  phone: string;
  message: string;
};

export type ProcessedResult = {
  error: boolean;
  message?: string;
  zaloEvent: ZaloEvent;
};

export type ZaloEvent = {
  trackingId: string;
  type: ZaloEventType;
  data: ZaloEventData;
};

export type ZaloMessage = ZaloEvent & {
  status: 'pending' | 'success' | 'error';
};

type ZaloMessages = {
  messages: ZaloMessage[];
};

export type ZaloMessageStorage = BaseStorage<ZaloMessages> & {
  addMessage: (message: ZaloMessage) => Promise<void>;
  updateMessage: (trackingId: string, status: 'success' | 'error') => Promise<void>;
  getMessages: () => Promise<ZaloMessage[]>;
  getMessage: (trackingId: string) => Promise<ZaloMessage | undefined>;
  getIds: () => Promise<string[]>;
  clear: () => Promise<void>;
};

const storage = createStorage<ZaloMessages>(
  'zalo-messages',
  { messages: [] },
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

export const zaloMessageStorage: ZaloMessageStorage = {
  ...storage,
  // TODO: extends your own methods
  addMessage: async (message: ZaloMessage) => {
    await storage.set(info => ({
      ...info,
      messages: [message, ...info.messages],
    }));
  },
  updateMessage: async (trackingId: string, status: 'success' | 'error') => {
    await storage.set(info => {
      const updatedMessages = info.messages.map(message => {
        if (message.trackingId === trackingId) {
          return { ...message, status };
        }
        return message;
      });

      return { ...info, messages: updatedMessages };
    });
  },

  getMessages(): Promise<ZaloMessage[]> {
    return storage.get().then(info => info.messages);
  },
  getMessage(trackingId: string): Promise<ZaloMessage | undefined> {
    return storage.get().then(info => info.messages.find(message => message.trackingId === trackingId));
  },
  getIds(): Promise<string[]> {
    return storage.get().then(info => info.messages.map(message => message.trackingId));
  },
  clear(): Promise<void> {
    return storage.set(info => ({ messages: [] }));
  },
};

export function useZaloMessageStorage() {
  const zaloMessages = useStorageSuspense(zaloMessageStorage);
  return { zaloMessages, zaloMessageStorage };
}
