import { Observable, Subject, from, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { zaloSendMessage, ResultSendMessageFlow } from './send-message-friend-flow';
import { zaloAddFriend, ResultAddFriendFlow } from './add-friend-flow';
import { ZaloEvent, ProcessedResult } from '@chrome-extension-boilerplate/zalo';
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

export function isZaloEvent(obj: unknown): obj is ZaloEvent {
  if (typeof obj === 'object' && obj !== null) {
    const possibleZaloEvent = obj as Partial<ZaloEvent> & Record<string, unknown>;
    return (
      'type' in possibleZaloEvent &&
      (possibleZaloEvent.type === 'request-friend' ||
        possibleZaloEvent.type === 'send-message' ||
        possibleZaloEvent.type === 'init-chat-mode') &&
      ('data' in possibleZaloEvent === false ||
        (typeof possibleZaloEvent.data === 'object' &&
          possibleZaloEvent.data !== null &&
          'phone' in possibleZaloEvent.data &&
          'message' in possibleZaloEvent.data &&
          typeof possibleZaloEvent.data.phone === 'string' &&
          typeof possibleZaloEvent.data.message === 'string')) &&
      ('trackingId' in possibleZaloEvent === false || typeof possibleZaloEvent.trackingId === 'string')
    );
  }
  return false;
}

export class ZaloEventProcessor {
  private eventSubject = new Subject<ZaloEvent>();

  processor: Observable<ProcessedResult>;

  constructor() {
    this.processor = this.eventSubject.pipe(
      concatMap(zaloEvent => {
        switch (zaloEvent.type) {
          case 'request-friend':
            return from(zaloAddFriend(zaloEvent.data?.phone, zaloEvent.data?.message)).pipe(
              map(result => ({
                error: result !== ResultAddFriendFlow.SUCCESS,
                message: result == ResultAddFriendFlow.SUCCESS ? undefined : (result as string),
                zaloEvent,
              })),
              catchError(error => {
                //TODO log service
                return of({ error: true, message: error.message, zaloEvent });
              }),
            );
          case 'send-message':
            return from(zaloSendMessage(zaloEvent.data?.phone, zaloEvent.data?.message)).pipe(
              map(result => ({
                error: result !== ResultSendMessageFlow.SUCCESS,
                message: result == ResultSendMessageFlow.SUCCESS ? undefined : (result as string),
                zaloEvent,
              })),
              catchError(error => {
                //TODO log service
                return of({ error: true, message: error.message, zaloEvent });
              }),
            );
          case 'init-chat-mode':
            return from(initChatMode()).pipe(
              map(result => ({
                error: result !== ResultInitChatModeFlow.SUCCESS,
                message: result == ResultInitChatModeFlow.SUCCESS ? undefined : (result as string),
                zaloEvent,
              })),
              catchError(error => {
                //TODO log service
                return of({ error: true, message: error.message, zaloEvent });
              }),
            );
          default:
            return of({ error: true, message: 'NO_HANDLER', zaloEvent });
        }
      }),
    );
  }

  enqueue(event: ZaloEvent) {
    this.eventSubject.next(event);
  }
}

//make it singleton
const zaloProcessor = new ZaloEventProcessor();
const { processor, enqueue } = zaloProcessor;

export function useZaloEventProcessor() {
  return { processor, enqueue: enqueue.bind(zaloProcessor) }; // Add closing parenthesis ')' after zaloProcessor
}
