// write react component
import React, { useEffect, useState } from 'react';
import { useZaloStorage } from '@chrome-extension-boilerplate/zalo/lib/ZaloStorage';

interface ZaloStatusProps {}

const ZaloStatus: React.FC<ZaloStatusProps> = () => {
  console.log('ZaloStatus rendered');

  const { zaloInfo, zaloStorage } = useZaloStorage();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    console.log('ZaloStatus effect run');

    const fetchConnectionStatus = async () => {
      const connectionStatus = await zaloStorage.isConnected;
      setIsConnected(connectionStatus);
    };

    fetchConnectionStatus();
  }, [zaloInfo, zaloStorage.isConnected]);

  const reconnectZalo = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.preventDefault();
    console.log('reconnect zalo');
    chrome.runtime.sendMessage({ type: 'reconnect-zalo' });
  };

  return (
    <div className="flex flex-wrap m-3">
      <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
        <h5 className="text-slate-500 uppercase font-bold text-md ">Zalo Status</h5>
      </div>
      <div className="relative w-auto pl-4 flex-initial">
        {isConnected ? (
          <div className="text-white p-3 text-center inline-flex items-center justify-center w-8 h-8 shadow-lg rounded-full bg-green-500 cursor-auto">
            <button onClick={reconnectZalo}>
              <i className="fas fa-link"></i>
            </button>
          </div>
        ) : (
          <div className="text-white p-3 text-center inline-flex items-center justify-center w-8 h-8 shadow-lg rounded-full bg-red-500 cursor-auto">
            <button onClick={reconnectZalo}>
              <i className="fas fa-plug"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZaloStatus;
