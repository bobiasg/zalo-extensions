import { hookReactComponentBySelector } from '@utils/react-utils';
import { Subject } from 'rxjs';
import { ZaloUser, ZaloGroup, ZaloMessage } from '../models';

export interface ZaloMessageEvent {
  formUser: ZaloUser;
  toUser: ZaloUser | ZaloGroup;
  zaloMessage: ZaloMessage;
}

async function intercepterMessages() {
  // find "Bs" component
  const bsComponent = await hookReactComponentBySelector('#conversationListId');
  if (bsComponent == null) console.log('bsComponent not found');

  console.debug('bsComponent:', bsComponent);

  // const contexts = await getAllReactContext('[data-id="div_TabMsg_ThrdChItem"]');
  // for (const context of contexts) {
  //   console.log('context:', context);
  //   const store = context.memoizedProps.value?.store;
  //   if (store != null) {
  //     console.log('context.store:', store?.getState());

  //     store.subscribe(() => {
  //       console.log('context.store:', store.getState());
  //     });
  //   }
  // }

  const users: Map<string, ZaloUser> = new Map<string, ZaloUser>(
    Object.entries(bsComponent.memoizedProps.state.contacts),
  );
  const groups: Map<string, ZaloGroup> = new Map<string, ZaloGroup>(
    Object.entries(bsComponent.memoizedProps.state.groups),
  );

  const messageSubject = new Subject<ZaloMessageEvent>();

  const previewManager = bsComponent.memoizedProps.uiController.convDataManager._pm;
  const onReceiveNewMessage = previewManager.onReceiveNewMessage.bind(previewManager);

  /*
  
  */
  previewManager.onReceiveNewMessage = function (...args: unknown[]) {
    console.debug('onReceiveNewMessage:', args);
    const [, message] = args;
    const zaloMessage = message as ZaloMessage;

    if (zaloMessage.fromUid !== '') {
      const eventMessage = {
        formUser: users?.get(zaloMessage.fromUid),
        toUser: groups?.get(zaloMessage.toUid) || users?.get(zaloMessage.toUid),
        zaloMessage: zaloMessage,
      } as ZaloMessageEvent;

      messageSubject.next(eventMessage);
    }

    return onReceiveNewMessage(...args);
  };

  /***
   * return subscription
   * should be call unsubscribe when not use
   */
  const subscribe = (callback: (message: ZaloMessageEvent) => void) => {
    return messageSubject.subscribe(callback);
  };

  return {
    subscribe: subscribe,
  };
}

export default {
  intercepterMessages: intercepterMessages,
};
