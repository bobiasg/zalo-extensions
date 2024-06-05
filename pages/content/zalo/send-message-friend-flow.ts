import {
  hookReactComponent,
  hookReactComponentBySelector,
  waitForElement,
  waitForElementBySelector,
} from '../utils/react-utils';
import {
  ADD_FRIEND_BTN_SELECTOR,
  FIND_FRIEND_CONTAINER,
  PROFILE_CONTAINER_SELECTOR,
  SEND_MESSAGE_BTN_SELECTOR,
  SEND_MESSAGE_TEXT_ID,
} from './constant';
import { waitForUserLogined } from './zalo-utils';

enum ResultSendMessageFlow {
  NO_ADD_FRIEND_BUTTON = 'NO_ADD_FRIEND_BUTTON',
  NO_FIND_FRIEND_CONTAINER = 'NO_FIND_FRIEND_CONTAINER',
  SUCCESS = 'SUCCESS',
  NO_FIND_USER = 'NO_FIND_USER',
  EXISTS_FRIEND = 'EXISTS_FRIEND',
  FAILURE = 'FAILURE',
  CAN_NOT_SEND_MESSAGE = 'CAN_NOT_SEND_MESSAGE',
}

export async function zaloSendMessage(phoneNumber: string = '', message: string = ''): Promise<ResultSendMessageFlow> {
  const builder = new ZaloSendMessageFlowBuilder();

  // eslint-disable-next-line no-debugger
  if (!phoneNumber || !message) return ResultSendMessageFlow.FAILURE;

  if (phoneNumber) builder.withPhoneNumber(phoneNumber);
  if (message) builder.withMessage(message);

  return builder.build().run();
}

export function useZaloSendMessageFlow(phoneNumber: string = '', message: string = ''): ZaloSendMessageFlowBuilder {
  const builder = new ZaloSendMessageFlowBuilder();

  if (phoneNumber) builder.withPhoneNumber(phoneNumber);
  if (message) builder.withMessage(message);

  return builder;
}

class ZaloSendMessageFlowBuilder {
  flow: ZaloSendMessageFlow;

  constructor() {
    this.flow = new ZaloSendMessageFlow();
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

class ZaloSendMessageFlow {
  phoneNumber: string = '';
  message: string = '';

  async run(): Promise<ResultSendMessageFlow> {
    if (!this.phoneNumber) return ResultSendMessageFlow.NO_FIND_USER;

    // eslint-disable-next-line no-debugger
    await waitForUserLogined();

    //TODO get friend from contact list

    //=========================================================================================================

    //when not in contact list, follow fallback
    return this.fallback();
  }

  private async fallback(): Promise<ResultSendMessageFlow> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const addFriendBtn = await hookReactComponentBySelector(ADD_FRIEND_BTN_SELECTOR);

      if (addFriendBtn == null) return ResultSendMessageFlow.NO_ADD_FRIEND_BUTTON;

      addFriendBtn.props.onClick();

      await waitForElement(FIND_FRIEND_CONTAINER);

      const findFriendContainer = await hookReactComponent(FIND_FRIEND_CONTAINER);
      if (findFriendContainer == null) return ResultSendMessageFlow.NO_FIND_FRIEND_CONTAINER;

      findFriendContainer.state.phoneNumber = this.phoneNumber;
      findFriendContainer.submitFindFriend();

      //now, it has 3 status return
      // 1. no find user
      // 2. find user without friendly
      // 3. find user with friendly
      const profileContainer = await hookReactComponentBySelector(PROFILE_CONTAINER_SELECTOR, 1);
      if (profileContainer == null) {
        //no find user
        return ResultSendMessageFlow.NO_FIND_USER;
      }

      //TODO profileContainer has data in memoizedProps {info :{}}

      // eslint-disable-next-line no-debugger

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      console.log(profileContainer, profileContainer?.memoizedProps);

      //TODO issue: can not use onClick method, use dispatchEvent instead
      //check if has btn ""
      // const sendMessageBtn = await hookReactComponentBySelector(SEND_MESSAGE_BTN_SELECTOR);
      const sendMessageBtn = await waitForElementBySelector(SEND_MESSAGE_BTN_SELECTOR);
      if (sendMessageBtn == null) {
        //find user friendly
        return ResultSendMessageFlow.CAN_NOT_SEND_MESSAGE;
      } else {
        //TODO issue when use onClick, modal close with nothing
        // sendMessageBtn.props.onClick(new Event('click', { bubbles: true }));
        sendMessageBtn.dispatchEvent(new Event('click', { bubbles: true }));

        //find user without friendly

        const messageText = await waitForElement(SEND_MESSAGE_TEXT_ID);
        //add message
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        messageText.innerText = this.message + '\n';
        // Trigger input event
        messageText?.dispatchEvent(new Event('input', { bubbles: true }));

        // Trigger keydown event for Enter key
        messageText?.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, which: 13, keyCode: 13 }),
        );
      }

      return ResultSendMessageFlow.SUCCESS;
    } catch (error) {
      //TODO send error to server
      console.error(error);
    }

    return ResultSendMessageFlow.FAILURE;
  }
}
