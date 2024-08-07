import { Observable, Subject, from, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { zaloSendMessage, ResultSendMessageFlow } from './send-message-friend-flow';
import { zaloAddFriend, ResultAddFriendFlow } from './add-friend-flow';
import { ZaloSendMessageRequest, ZaloSendMessageResult } from '@chrome-extension-boilerplate/zalo/models';
import { ResultInitChatModeFlow, initChatMode } from './init-chat-mode-flow';

// export function isZaloEvent(obj: unknown): obj is ZaloEvent {
//   return (
//     typeof obj === 'object' &&
//     obj !== null &&
//     'type' in obj &&
//     (obj.type === 'request-friend' || obj.type === 'send-message' || obj.type === 'init-chat-mode') &&
//     ('data' in obj === false ||
//       (typeof obj.data === 'object' &&
//         obj.data !== null &&
//         'phone' in obj.data &&
//         'message' in obj.data &&
//         typeof obj.data.phone === 'string' &&
//         typeof obj.data.message === 'string')) &&
//     ('trackingId' in obj === false || typeof obj.trackingId === 'string')
//   );
// }

// export function isZaloEvent(obj: unknown): obj is ZaloEvent {
//   if (typeof obj === 'object' && obj !== null) {
//     const possibleZaloEvent = obj as Partial<ZaloEvent> & Record<string, unknown>;
//     return (
//       'type' in possibleZaloEvent &&
//       (possibleZaloEvent.type === 'request-friend' ||
//         possibleZaloEvent.type === 'send-message' ||
//         possibleZaloEvent.type === 'init-chat-mode') &&
//       ('data' in possibleZaloEvent === false ||
//         (typeof possibleZaloEvent.data === 'object' &&
//           possibleZaloEvent.data !== null &&
//           'phone' in possibleZaloEvent.data &&
//           'message' in possibleZaloEvent.data &&
//           typeof possibleZaloEvent.data.phone === 'string' &&
//           typeof possibleZaloEvent.data.message === 'string')) &&
//       ('trackingId' in possibleZaloEvent === false || typeof possibleZaloEvent.trackingId === 'string')
//     );
//   }
//   return false;
// }

export class ZaloEventProcessor {
  private eventSubject = new Subject<ZaloSendMessageRequest>();

  processor: Observable<ZaloSendMessageResult>;

  constructor() {
    this.processor = this.eventSubject.pipe(
      concatMap(zaloMessage => {
        switch (zaloMessage.type) {
          case 'request-friend':
            return from(zaloAddFriend(zaloMessage.data?.phone, zaloMessage.data?.message)).pipe(
              map(result => {
                const messageResult = new ZaloSendMessageResult(zaloMessage);
                if (result !== ResultAddFriendFlow.SUCCESS) {
                  messageResult.setError(result as string);
                }
                return messageResult;
              }),
              catchError(error => {
                //TODO log service
                const errorResult = new ZaloSendMessageResult(zaloMessage);
                errorResult.setError(error.message);
                return of(errorResult);
              }),
            );
          case 'send-message':
            return from(zaloSendMessage(zaloMessage.data?.phone, zaloMessage.data?.message)).pipe(
              map(result => {
                const messageResult = new ZaloSendMessageResult(zaloMessage);
                messageResult.user = result.user;
                if (result.status !== ResultSendMessageFlow.SUCCESS) {
                  messageResult.setError(result.status as string);
                }
                return messageResult;
              }),
              catchError(error => {
                //TODO log service
                const errorResult = new ZaloSendMessageResult(zaloMessage);
                errorResult.setError(error.message);
                return of(errorResult);
              }),
            );
          case 'init-chat-mode':
            return from(initChatMode()).pipe(
              map(result => {
                const messageResult = new ZaloSendMessageResult(zaloMessage);
                if (result !== ResultInitChatModeFlow.SUCCESS) {
                  messageResult.setError(result as string);
                }
                return messageResult;
              }),
              catchError(error => {
                //TODO log service
                const errorResult = new ZaloSendMessageResult(zaloMessage);
                errorResult.setError(error.message);
                return of(errorResult);
              }),
            );
          default: {
            const errorResult = new ZaloSendMessageResult(zaloMessage);
            errorResult.setError('NO_HANDLER');
            return of(errorResult);
          }
        }
      }),
    );
  }

  enqueue(event: ZaloSendMessageRequest) {
    this.eventSubject.next(event);
  }
}

//make it singleton
const zaloProcessor = new ZaloEventProcessor();
const { processor, enqueue } = zaloProcessor;

export function useZaloEventProcessor() {
  return { processor, enqueue: enqueue.bind(zaloProcessor) }; // Add closing parenthesis ')' after zaloProcessor
}
