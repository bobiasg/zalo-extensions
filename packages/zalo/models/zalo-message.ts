import { ZaloGroup } from './zalo-group';
import { ZaloUser } from './zalo-user';

/* raw zalo message obj
{
      "msgId": "5677550496195",
      "zglobalMsgId": "5677550496195",
      "cliMsgId": "1722215074638",
      "msgType": 2,
      "status": 1,
      "notify": "1",
      "message": {
          "title": "",
          "description": "",
          "childnumber": 0,
          "action": "",
          "params": "{\"width\":1276,\"hd\":\"https://b-f46-zpg-r.zdn.vn/4170812137352034295/869d20a1b771122f4b60.jpg\",\"height\":1068}",
          "type": "",
          "thumbUrl": "https://t-f46-zpg-r.zdn.vn/480/4170812137352034295/869d20a1b771122f4b60.jpg",
          "oriUrl": "https://b-f46-zpg-r.zdn.vn/4170812137352034295/869d20a1b771122f4b60.jpg",
          "hdUrl": "https://b-f46-zpg-r.zdn.vn/4170812137352034295/869d20a1b771122f4b60.jpg",
          "normalUrl": "https://f46-zpg-r.zdn.vn/4170812137352034295/869d20a1b771122f4b60.jpg"
      },
      "sendDttm": "1722215075380",
      "serverTime": "1722215075380",
      "fromUid": "6103545572385997018",
      "toUid": "g3080967976292043695",
      "dName": "Nguyễn Huy",
      "localDttm": 1722223860226,
      "properties": {
          "color": -1,
          "size": -1,
          "type": 1,
          "subType": 0,
          "ext": "{\"shouldParseLinkOrContact\":0}"
      },
      "ttl": 0,
      "st": 3,
      "at": 5,
      "cmd": 511,
      "originMsgType": "chat.photo",
      "subState": -1,
      "e2eeStatus": -1,
      "platformType": 1,
      "src": 10,
      "syncFromMobile": false,
      "topOut": "0",
      "topOutTimeOut": "0",
      "topOutImprTimeOut": "0",
      "previewThumb": "AgAaAB7/2gAMAwEAAhEDEQA/APRTjrz+FLvkPC4/EGlZQDniolOSaskmVXbknH51IwUgZH50sCM7bVwSfSrE0TR4Dd6AP//Q9IZgegzUK9T3qUdKYtUSTxSMjbkBU1YeZ5TuaqoqVaAP/9k=",
      "z_parsedTokens": []
  }
*/
export interface ZaloMessage {
  // Message identifiers
  msgId?: string;
  zglobalMsgId?: string;
  cliMsgId?: string;

  // Message metadata
  msgType?: number;
  status?: number;
  notify?: string;
  sendDttm?: string;
  serverTime?: string;
  fromUid: string;
  toUid: string;
  dName?: string;
  localDttm?: number;

  // Message content
  message?: {
    title?: string;
    description?: string;
    childnumber?: number;
    action?: string;
    params?: string;
    type?: string;
    thumbUrl?: string;
    oriUrl?: string;
    hdUrl?: string;
    normalUrl?: string;
  };

  // Message properties
  properties?: {
    color?: number;
    size?: number;
    type?: number;
    subType?: number;
    ext?: string;
  };

  // Timing and state
  ttl?: number;
  st?: number;
  at?: number;
  cmd?: number;
  originMsgType?: string;
  subState?: number;
  e2eeStatus?: number;
  platformType?: number;
  src?: number;
  syncFromMobile?: boolean;

  // Timeout and preview
  topOut?: string;
  topOutTimeOut?: string;
  topOutImprTimeOut?: string;
  previewThumb?: string;

  // Parsed tokens
  z_parsedTokens?: unknown[];
}

export class ZaloMessageData {
  fromUser?: ZaloUser;
  toUser: ZaloUser | ZaloGroup;
  zaloMessage: ZaloMessage;

  /**
   *
   */
  constructor(message: ZaloMessage, toUser: ZaloUser | ZaloGroup, fromUser?: ZaloUser) {
    this.zaloMessage = message;
    this.toUser = toUser;
    this.fromUser = fromUser;
  }

  public static isValid(obj: unknown): obj is ZaloMessageData {
    return (
      obj instanceof ZaloMessageData ||
      (typeof obj === 'object' && obj !== null && 'zaloMessage' in obj && 'toUser' in obj)
    );
  }
}
