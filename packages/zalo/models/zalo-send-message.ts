type ZaloSendMessageData = {
  phone: string;
  message: string;
};

type ZaloSendMessageRequestType = 'request-friend' | 'send-message' | 'init-chat-mode';

export class ZaloSendMessageResult {
  error: boolean = false;
  message?: string | null = null;
  zaloMessage: ZaloSendMessageRequest;

  constructor(zaloMessage: ZaloSendMessageRequest) {
    this.zaloMessage = zaloMessage;
  }

  public setError(message: string) {
    this.error = true;
    this.message = message;
  }

  public static isValid(obj: unknown): obj is ZaloSendMessageResult {
    return (
      obj instanceof ZaloSendMessageResult ||
      (typeof obj === 'object' &&
        obj !== null &&
        'error' in obj &&
        'message' in obj &&
        'zaloMessage' in obj &&
        ZaloSendMessageRequest.isValid(obj.zaloMessage))
    );
  }
}

export class ZaloSendMessageRequest {
  trackingId: string | null = null;
  type: ZaloSendMessageRequestType;
  data: ZaloSendMessageData;
  status: 'pending' | 'success' | 'error';

  /**
   *
   */
  constructor(data: ZaloSendMessageData, type: ZaloSendMessageRequestType = 'send-message') {
    this.data = data;
    this.type = type;
    this.status = 'pending';
  }

  public setStatus(status: 'pending' | 'success' | 'error') {
    this.status = status;
  }

  public static isValid(obj: unknown): obj is ZaloSendMessageRequest {
    return (
      obj instanceof ZaloSendMessageRequest ||
      (typeof obj === 'object' &&
        obj !== null &&
        'type' in obj &&
        'data' in obj &&
        (obj.type === 'request-friend' || obj.type === 'send-message') &&
        typeof obj.data === 'object' &&
        obj.data !== null &&
        'phone' in obj.data &&
        'message' in obj.data &&
        typeof obj.data.phone === 'string' &&
        typeof obj.data.message === 'string')
    );
  }
}
