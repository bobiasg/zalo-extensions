import { Observable, Subject, from, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { zaloSendMessage, ResultSendMessageFlow } from './send-message-friend-flow';
import { zaloAddFriend, ResultAddFriendFlow } from './add-friend-flow';

export type ZaloEventType = 'request-friend' | 'send-message';
export type ZaloEventData = {
  phone: string;
  message: string;
};

export type ProcessedResult = {
  error: boolean;
  message?: string;
  zaloEvent: ZaloEvent;
};

export type ZaloEvent = {
  trackingId: string;
  type: ZaloEventType;
  data: ZaloEventData;
};

export function isZaloEvent(obj: unknown): obj is ZaloEvent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    'data' in obj &&
    (obj.type === 'request-friend' || obj.type === 'send-message') &&
    typeof obj.data === 'object' &&
    obj.data !== null &&
    'phone' in obj.data &&
    'message' in obj.data &&
    typeof obj.data.phone === 'string' &&
    typeof obj.data.message === 'string'
  );
}

export class ZaloEventProcessor {
  private eventSubject = new Subject<ZaloEvent>();

  processor: Observable<ProcessedResult>;

  constructor() {
    this.processor = this.eventSubject.pipe(
      concatMap(zaloEvent => {
        switch (zaloEvent.type) {
          case 'request-friend':
            return from(zaloAddFriend(zaloEvent.data.phone, zaloEvent.data.message)).pipe(
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
            return from(zaloSendMessage(zaloEvent.data.phone, zaloEvent.data.message)).pipe(
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
