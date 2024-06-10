import { useStorageSuspense } from '@chrome-extension-boilerplate/shared';
import { BaseStorage, StorageType, createStorage } from '@chrome-extension-boilerplate/storage';

type ZaloConnectionStatus = 'connected' | 'disconnected';

type ZaloInfo = {
  status: ZaloConnectionStatus;
};

type ZaloStorage = BaseStorage<ZaloInfo> & {
  setStatus: (status: ZaloConnectionStatus) => Promise<void>;
  getStatus: () => Promise<ZaloConnectionStatus>;
  isConnected: Promise<boolean>;
};

const storage = createStorage<ZaloInfo>(
  'zalo-info',
  { status: 'disconnected' },
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

export const zaloStorage: ZaloStorage = {
  ...storage,
  // TODO: extends your own methods
  setStatus: async (status: ZaloConnectionStatus) => {
    await storage.set(info => ({
      ...info,
      status,
    }));
  },
  getStatus: () => storage.get().then(info => info.status),
  get isConnected(): Promise<boolean> {
    return storage.get().then(info => info.status === 'connected');
  },
};

export function useZaloStorage() {
  const zaloInfo = useStorageSuspense(zaloStorage);
  return { zaloInfo, zaloStorage };
}
