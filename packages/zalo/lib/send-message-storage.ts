import { useStorageSuspense } from '@chrome-extension-boilerplate/shared';
import { BaseStorage, StorageType, createStorage } from '@chrome-extension-boilerplate/storage';
import { ZaloSendMessageRequest } from '../models/zalo-send-message';

type ZaloSendMessages = {
  messages: ZaloSendMessageRequest[];
};

export type ZaloMessageStorage = BaseStorage<ZaloSendMessages> & {
  addMessage: (message: ZaloSendMessageRequest) => Promise<void>;
  updateMessage: (trackingId: string, status: 'success' | 'error') => Promise<void>;
  getMessages: () => Promise<ZaloSendMessageRequest[]>;
  getMessage: (trackingId: string) => Promise<ZaloSendMessageRequest | undefined>;
  getIds: () => Promise<string[]>;
  clear: () => Promise<void>;
};

const storage = createStorage<ZaloSendMessages>(
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
  addMessage: async (message: ZaloSendMessageRequest) => {
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

  getMessages(): Promise<ZaloSendMessageRequest[]> {
    return storage.get().then(info => info.messages);
  },
  getMessage(trackingId: string): Promise<ZaloSendMessageRequest | undefined> {
    return storage.get().then(info => info.messages.find(message => message.trackingId === trackingId));
  },
  getIds(): Promise<string[]> {
    return storage.get().then(info => info.messages.map(message => message.trackingId));
  },
  clear(): Promise<void> {
    return storage.set(() => ({ messages: [] }));
  },
};

export function useZaloSendMessageStorage() {
  const zaloMessages = useStorageSuspense(zaloMessageStorage);
  return { zaloMessages, zaloMessageStorage };
}
