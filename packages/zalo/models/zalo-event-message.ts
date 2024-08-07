/**
 * interface for event message between regular context and extension context
 */

import { ZaloMessageData } from './zalo-message';
import { ZaloSendMessageRequest, ZaloSendMessageResult } from './zalo-send-message';

type ZaloEventData = ZaloSendMessageRequest | ZaloSendMessageResult | ZaloMessageData;

export const ZALO_SEND_REQUEST = 'zaloSendRequest' as const;
export const ZALO_SEND_RESULT = 'zaloSendResult' as const;
export const ZALO_RECEIVED_MESSAGE = 'zaloReceivedMessage' as const;
export const ZALO_EXTENSION = 'zalo_extension' as const;

export interface ZaloEvent {
  action: typeof ZALO_SEND_REQUEST | typeof ZALO_SEND_RESULT | typeof ZALO_RECEIVED_MESSAGE;
  message: ZaloEventData;
  tabId?: number;
  tabUrl?: string;
  source: string;
}

export class ZaloSendRequestEvent implements ZaloEvent {
  action: typeof ZALO_SEND_REQUEST;
  message: ZaloSendMessageRequest;
  tabId?: number;
  tabUrl?: string;
  source: string = ZALO_EXTENSION;

  /**
   *
   */
  constructor(message: ZaloSendMessageRequest) {
    this.action = ZALO_SEND_REQUEST;
    this.message = message;
  }

  public static isValid(obj: unknown): obj is ZaloSendRequestEvent {
    if (obj instanceof ZaloSendRequestEvent) return true;

    if (typeof obj === 'object' && obj !== null && 'action' in obj && 'message' in obj && 'source' in obj) {
      const event = obj as ZaloSendRequestEvent;
      return (
        event.action === ZALO_SEND_REQUEST &&
        typeof event.message === 'object' &&
        event.message !== null &&
        typeof event.source === 'string'
      );
    }
    return false;
  }
}

export class ZaloSendResultEvent implements ZaloEvent {
  action: typeof ZALO_SEND_RESULT;
  message: ZaloSendMessageResult;
  tabId?: number;
  tabUrl?: string;
  source: string = ZALO_EXTENSION;

  /**
   *
   */
  constructor(message: ZaloSendMessageResult) {
    this.action = ZALO_SEND_RESULT;
    this.message = message;
  }

  public static isValid(obj: unknown): obj is ZaloSendResultEvent {
    if (obj instanceof ZaloSendResultEvent) return true;

    if (typeof obj === 'object' && obj !== null && 'action' in obj && 'message' in obj && 'source' in obj) {
      const event = obj as ZaloSendResultEvent;
      return (
        event.action === ZALO_SEND_RESULT &&
        typeof event.message === 'object' &&
        event.message !== null &&
        typeof event.source === 'string'
      );
    }
    return false;
  }
}

export class ZaloReceivedMessageEvent implements ZaloEvent {
  action: typeof ZALO_RECEIVED_MESSAGE;
  message: ZaloMessageData;
  tabId?: number;
  tabUrl?: string;
  source: string = ZALO_EXTENSION;

  /**
   *
   */
  constructor(message: ZaloMessageData) {
    this.action = ZALO_RECEIVED_MESSAGE;
    this.message = message;
  }

  public static isValid(obj: unknown): obj is ZaloReceivedMessageEvent {
    if (obj instanceof ZaloReceivedMessageEvent) return true;

    if (typeof obj === 'object' && obj !== null && 'action' in obj && 'message' in obj && 'source' in obj) {
      const event = obj as ZaloReceivedMessageEvent;
      return (
        event.action === ZALO_RECEIVED_MESSAGE &&
        typeof event.message === 'object' &&
        event.message !== null &&
        typeof event.source === 'string'
      );
    }
    return false;
  }
}
