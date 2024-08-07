import { hookReactComponentBySelector, ReactFiber } from '@utils/react-utils';
import { ZaloUser, ZaloGroup, ZaloMessage, ZaloMessageData } from '@chrome-extension-boilerplate/zalo/models';

const BS_COMPONENT_SELECTOR = '#conversationListId';

type MessageHandler = (event: ZaloMessageData) => void;

let bsComponent: ReactFiber | null = null;
let originalOnReceiveNewMessage: ((...args: unknown[]) => void) | null = null;
const subscribers: MessageHandler[] = [];

/**
 * check if react componet has captured. if not, capture it.
 */
const ensureCapturedComponent = async () => {
  if (bsComponent == null) {
    bsComponent = await hookReactComponentBySelector(BS_COMPONENT_SELECTOR);
    if (bsComponent == null) {
      console.warn(`${BS_COMPONENT_SELECTOR} not found`);
      return null;
    }
  }

  console.debug('bsComponent:', bsComponent);

  return bsComponent;
};

/**
 * dispatch message event to subscribers
 * @param message ZaloMessage
 */
const dispatchMessageEvent = (message: ZaloMessage) => {
  const eventMessage = {
    fromUser: getUser(message.fromUid),
    toUser: getGroup(message.toUid) || getUser(message.toUid),
    zaloMessage: message,
  } as ZaloMessageData;

  subscribers.forEach(callback => callback(eventMessage));
};

const getUsers = (): Map<string, ZaloUser> =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  bsComponent?.memoizedProps.state.contacts as Map<string, ZaloUser>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const getUser = (id: string): ZaloUser | undefined => getUsers()[id];

const getGroups = (): Map<string, ZaloGroup> =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  bsComponent?.memoizedProps.state.groups as Map<string, ZaloGroup>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const getGroup = (id: string): ZaloGroup | undefined => getGroups()[id];

/***
 * return subscription
 * should be call unsubscribe when not use
 */
const subscribe = (callback: (message: ZaloMessageData) => void) => {
  return subscribers.push(callback);
};

const unsubscribe = (callback: (message: ZaloMessageData) => void) => {
  return subscribers.splice(subscribers.indexOf(callback));
};

const start = async () => {
  await ensureCapturedComponent();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const previewManager = bsComponent.memoizedProps?.uiController?.convDataManager?._pm;

  if (previewManager == null) {
    console.warn(`previewManager not found`);
    return;
  }

  //capture current function
  originalOnReceiveNewMessage = previewManager.onReceiveNewMessage.bind(previewManager);
  //replace with new function
  previewManager.onReceiveNewMessage = function (...args: unknown[]) {
    console.debug('onReceiveNewMessage:', args);
    const [, message] = args;
    const zaloMessage = message as ZaloMessage;

    if (zaloMessage.fromUid !== '' && zaloMessage.fromUid !== '0' && zaloMessage.cmd !== -1) {
      dispatchMessageEvent(zaloMessage);
    }

    // let call original function
    return originalOnReceiveNewMessage && originalOnReceiveNewMessage(...args);
  };
};

const stop = (): void => {
  if (originalOnReceiveNewMessage == null) return;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const previewManager = bsComponent.memoizedProps?.uiController?.convDataManager?._pm;

  if (previewManager == null) {
    console.warn(`previewManager not found`);
    return;
  }

  previewManager.onReceiveNewMessage = originalOnReceiveNewMessage;
};

export default { subscribe, unsubscribe, start, stop };
