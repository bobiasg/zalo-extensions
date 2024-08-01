import { ZaloSendMessageRequest } from '@chrome-extension-boilerplate/zalo/models';
import React from 'react';

type MessageProps = {
  message: ZaloSendMessageRequest;
};

const Message: React.FC<MessageProps> = React.memo(({ message }: MessageProps) => {
  return message == null ? null : (
    <div className="relative flex flex-col min-w-0 break-words bg-white shadow-soft-xl rounded-md bg-clip">
      <div className="flex-auto p-4">
        <div className="flex flex-col -mx-3  px-3">
          <div className="flex flex-row -mx-3 px-3">
            <div className="w-2/3">
              <p className="mb-0 font-sans font-semibold leading-normal text-size-sm">{message.data?.phone}</p>
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
            <span className="mb-0 text-size-sm font-weight-bolder truncate">{message.data?.message}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

Message.displayName = 'Message';

export default Message;
