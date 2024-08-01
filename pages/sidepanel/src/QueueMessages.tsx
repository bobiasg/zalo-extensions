import React from 'react';
import { ZaloSendMessageRequest, useZaloSendMessageStorage } from '@chrome-extension-boilerplate/zalo';
import { useVirtualizer } from '@tanstack/react-virtual';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Message from './Message';

const QueueMessages: React.FC = () => {
  const parentRef = React.useRef<HTMLElement | null>(null);
  const { zaloMessages, zaloMessageStorage } = useZaloSendMessageStorage();

  const messages = Object.values(zaloMessages.messages);

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 75,
  });

  const clearMessages = () => {
    zaloMessageStorage.clear();
  };

  return (
    //
    <PerfectScrollbar options={{ suppressScrollX: true }} containerRef={ref => (parentRef.current = ref)}>
      {/* <div className="h-full overflow-auto" ref={parentRef}> */}
      <div
        className="flex flex-wrap -mx-3 group"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}>
        <div className="transition delay-2s px-3 py-1 group-hover:visible invisible z-10 absolute top-1 right-2 ">
          <button
            className="px-2   text-size-base font-normal bg-gray-50 text-slate-500   rounded-1 "
            onClick={clearMessages}>
            Clear
            <i className="fas fa-trash ml-2"></i>
          </button>
        </div>

        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const message = messages[virtualRow.index] as ZaloSendMessageRequest | null;

          return message == null ? null : (
            <div
              key={message.trackingId}
              className="w-full max-w-full px-3 mb-1 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}>
              <Message message={message} />
            </div>
          );
        })}
      </div>
      {/* </div> */}
    </PerfectScrollbar>
  );
};

export default QueueMessages;
