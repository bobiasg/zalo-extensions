import {
  hookReactComponent,
  hookReactComponentBySelector,
  waitForElement,
  waitForElementBySelector,
} from '../utils/react-utils';
import {
  ADD_FRIEND_BTN_SELECTOR,
  ADD_NEW_FRIEND_MESSAGE_SELECTOR,
  ADD_NEW_FRIEND_BTN_SELECTOR,
  FIND_FRIEND_CONTAINER,
  PROFILE_CONTAINER_SELECTOR,
  SEND_REQUEST_ADD_NEW_FRIEND_BTN_SELECTOR,
} from './constant';
import { waitForUserLogined } from './zalo-utils';

enum ResultAddFriendFlow {
  NO_ADD_FRIEND_BUTTON = 'NO_ADD_FRIEND_BUTTON',
  NO_FIND_FRIEND_CONTAINER = 'NO_FIND_FRIEND_CONTAINER',
  SUCCESS = 'SUCCESS',
  NO_FIND_USER = 'NO_FIND_USER',
  EXISTS_FRIEND = 'EXISTS_FRIEND',
  FAILURE = 'FAILURE',
}

export async function zaloAddFriend(phoneNumber: string = '', message: string = ''): Promise<ResultAddFriendFlow> {
  const builder = new ZaloAddFriendFlowBuilder();

  if (!phoneNumber || !message) return ResultAddFriendFlow.FAILURE;

  if (phoneNumber) builder.withPhoneNumber(phoneNumber);
  if (message) builder.withMessage(message);

  return builder.build().run();
}

export function useZaloAddFriendFlow(phoneNumber: string = '', message: string = ''): ZaloAddFriendFlowBuilder {
  const builder = new ZaloAddFriendFlowBuilder();

  if (phoneNumber) builder.withPhoneNumber(phoneNumber);
  if (message) builder.withMessage(message);

  return builder;
}

class ZaloAddFriendFlowBuilder {
  flow: ZaloAddFriendFlow;

  constructor() {
    this.flow = new ZaloAddFriendFlow();
  }

  withPhoneNumber(phoneNumber: string) {
    this.flow.phoneNumber = phoneNumber;
    return this;
  }

  withMessage(message: string) {
    this.flow.message = message;
    return this;
  }

  build() {
    return this.flow;
  }
}

class ZaloAddFriendFlow {
  phoneNumber: string = '';
  message: string = '';

  async run(): Promise<ResultAddFriendFlow> {
    if (!this.phoneNumber) return ResultAddFriendFlow.NO_FIND_USER;

    try {
      // eslint-disable-next-line no-debugger
      await waitForUserLogined();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const addFriendBtn = await hookReactComponentBySelector(ADD_FRIEND_BTN_SELECTOR);

      if (addFriendBtn == null) return ResultAddFriendFlow.NO_ADD_FRIEND_BUTTON;

      addFriendBtn.props.onClick();

      await waitForElement(FIND_FRIEND_CONTAINER);

      const findFriendContainer = await hookReactComponent(FIND_FRIEND_CONTAINER);
      if (findFriendContainer == null) return ResultAddFriendFlow.NO_FIND_FRIEND_CONTAINER;

      findFriendContainer.state.phoneNumber = this.phoneNumber;
      findFriendContainer.submitFindFriend();

      //now, it has 3 status return
      // 1. no find user
      // 2. find user without friendly
      // 3. find user with friendly
      const profileContainer = await hookReactComponentBySelector(PROFILE_CONTAINER_SELECTOR, 1);
      if (profileContainer == null) {
        //no find user
        return ResultAddFriendFlow.NO_FIND_USER;
      }

      //TODO profileContainer has data in memoizedProps {info :{}}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      console.log(profileContainer, profileContainer?.memoizedProps);

      //check if has btn ""
      const addNewFriendBtn = await hookReactComponentBySelector(ADD_NEW_FRIEND_BTN_SELECTOR);
      if (addNewFriendBtn == null) {
        //find user friendly
        return ResultAddFriendFlow.EXISTS_FRIEND;
      } else {
        //find user without friendly
        addNewFriendBtn.props.onClick();
        const addFriendMessage = await waitForElementBySelector(ADD_NEW_FRIEND_MESSAGE_SELECTOR);

        //add message
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (this.message) addFriendMessage.value = this.message;

        const sendRequestNewFriendBtn = await hookReactComponentBySelector(SEND_REQUEST_ADD_NEW_FRIEND_BTN_SELECTOR);
        sendRequestNewFriendBtn.props.onClick();
      }

      return ResultAddFriendFlow.SUCCESS;
    } catch (error) {
      //TODO send event error
      console.error('Add friend error', error);
    }

    return ResultAddFriendFlow.FAILURE;
  }
}
