import { useStorageSuspense } from '@chrome-extension-boilerplate/shared';
import { BaseStorage, StorageType, createStorage } from '@chrome-extension-boilerplate/storage';

export type ZaloEventType = 'request-friend' | 'send-message';
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
  messages: {
    [id: string]: ZaloMessage;
  };
};

type ZaloMessageStorage = BaseStorage<ZaloMessages> & {
  addMessage: (message: ZaloMessage) => Promise<void>;
  updateMessage: (trackingId: string, status: 'success' | 'error') => Promise<void>;
  getMessages: () => Promise<ZaloMessage[]>;
  getMessage: (trackingId: string) => Promise<ZaloMessage | undefined>;
  getIds: () => Promise<string[]>;
};

const storage = createStorage<ZaloMessages>(
  'zalo-messages',
  { messages: {} },
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
      messages: {
        [message.trackingId]: message,
        ...info.messages,
      },
    }));
  },
  updateMessage: async (trackingId: string, status: 'success' | 'error') => {
    await storage.set(info => {
      const updatedMessages = {
        ...info.messages,
        [trackingId]: { ...info.messages[trackingId], status },
      };

      return { ...info, messages: updatedMessages };
    });
  },

  getMessages(): Promise<ZaloMessage[]> {
    return storage.get().then(info => Object.values(info.messages));
  },
  getMessage(trackingId: string): Promise<ZaloMessage | undefined> {
    return storage.get().then(info => info.messages[trackingId]);
  },
  getIds(): Promise<string[]> {
    return storage.get().then(info => Object.keys(info.messages));
  },
};

export function useZaloMessageStorage() {
  const zaloMessages = useStorageSuspense(zaloMessageStorage);
  return { zaloMessages, zaloMessageStorage };
}
