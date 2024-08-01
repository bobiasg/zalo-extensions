/**
 * interface for event message between regular context and extension context
 */

import { ZaloMessageData } from './zalo-message';
import { ZaloSendMessageRequest, ZaloSendMessageResult } from './zalo-send-message';

type ZaloEventMessageData = ZaloSendMessageRequest | ZaloSendMessageResult | ZaloMessageData;

export interface ZaloEventMessage {
  action: 'zaloSendRequest' | 'zaloSendResult' | 'zaloReceivedMessage';
  message: ZaloEventMessageData;
  tabId?: number;
  tabUrl?: string;
  source: string;
}

export class ZaloSendRequestEvent implements ZaloEventMessage {
  action: 'zaloSendRequest';
  message: ZaloSendMessageRequest;
  tabId?: number;
  tabUrl?: string;
  source: string = 'zalo_extension';

  /**
   *
   */
  constructor(message: ZaloSendMessageRequest) {
    this.action = 'zaloSendRequest';
    this.message = message;
  }
}

export class ZaloSendResultEvent implements ZaloEventMessage {
  action: 'zaloSendResult';
  message: ZaloSendMessageResult;
  tabId?: number;
  tabUrl?: string;
  source: string = 'zalo_extension';

  /**
   *
   */
  constructor(message: ZaloSendMessageResult) {
    this.action = 'zaloSendResult';
    this.message = message;
  }
}

export class ZaloReceivedMessageEvent implements ZaloEventMessage {
  action: 'zaloReceivedMessage';
  message: ZaloMessageData;
  tabId?: number;
  tabUrl?: string;
  source: string = 'zalo_extension';

  /**
   *
   */
  constructor(message: ZaloMessageData) {
    this.action = 'zaloReceivedMessage';
    this.message = message;
  }

  public static isValid(obj: unknown): obj is ZaloReceivedMessageEvent {
    if (obj instanceof ZaloReceivedMessageEvent) return true;

    if (typeof obj === 'object' && obj !== null && 'action' in obj && 'message' in obj && 'source' in obj) {
      const event = obj as ZaloReceivedMessageEvent;
      return (
        event.action === 'zaloReceivedMessage' &&
        typeof event.message === 'object' &&
        event.message !== null &&
        typeof event.source === 'string'
      );
    }
    return false;
  }
}
