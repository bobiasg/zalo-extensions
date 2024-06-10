import React from 'react';
import { useZaloMessageStorage } from '@chrome-extension-boilerplate/zalo';
import { useVirtualizer } from '@tanstack/react-virtual';
import PerfectScrollbar from 'react-perfect-scrollbar';

const QueueMessages: React.FC = () => {
  const parentRef = React.useRef<HTMLElement | null>(null);
  const {
    zaloMessages: { messages },
  } = useZaloMessageStorage();

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 75,
  });

  return (
    //
    <PerfectScrollbar options={{ suppressScrollX: true }} containerRef={ref => (parentRef.current = ref)}>
      {/* <div className="h-full overflow-auto" ref={parentRef}> */}
      <div
        className="flex flex-wrap -mx-3"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}>
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const message = messages[virtualRow.index];

          console.log(virtualRow.index);

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
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-soft-xl rounded-md bg-clip">
                <div className="flex-auto p-4">
                  <div className="flex flex-col -mx-3  px-3">
                    <div className="flex flex-row -mx-3 px-3">
                      <div className="w-2/3">
                        <p className="mb-0 font-sans font-semibold leading-normal text-size-sm">
                          {message.data?.phone}
                        </p>
                      </div>
                      <div className="w-1/3 pl-1 text-right">
                        <div className="inline-block text-center">
                          {message.status === 'success' && <i className="fas fa-circle text-cyan-500"></i>}
                          {message.status === 'error' && <i className="fas fa-circle text-red-500"></i>}
                          {message.status === 'pending' && <i className="fas fa-circle text-orange-500 mr-2"></i>}
                          <span className="ml-2">{message.status}</span>
                        </div>
                        <a className="text-blueGray-500 py-1 px-3" href="#pablo">
                          <i className="fas fa-ellipsis-v"></i>
                        </a>
                      </div>
                    </div>
                    <div>
                      <span className="mb-0 text-size-sm font-weight-bolder ">{message.data?.message}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* </div> */}
    </PerfectScrollbar>
  );
};

export default QueueMessages;
