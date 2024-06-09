import { waitForElement, waitForElementBySelector } from '../utils/react-utils';
import {
  ADD_FRIEND_BTN_SELECTOR,
  ADD_NEW_FRIEND_MESSAGE_SELECTOR,
  ADD_NEW_FRIEND_BTN_SELECTOR,
  FIND_FRIEND_CONTAINER,
  PROFILE_CONTAINER_SELECTOR,
  SEND_REQUEST_ADD_NEW_FRIEND_BTN_SELECTOR,
  FIND_FRIEND_PHONE_NUMBER_INPUT,
} from './constant';
import { waitForUserLogined } from './zalo-utils';

export enum ResultAddFriendFlow {
  NO_ADD_FRIEND_BUTTON = 'NO_ADD_FRIEND_BUTTON',
  NO_FIND_FRIEND_CONTAINER = 'NO_FIND_FRIEND_CONTAINER',
  SUCCESS = 'SUCCESS',
  NO_FIND_USER = 'NO_FIND_USER',
  EXISTS_FRIEND = 'EXISTS_FRIEND',
  FAILURE = 'FAILURE',
}

/**
 * Adds a friend on Zalo.
 * @param phoneNumber The phone number of the friend to add.
 * @param message The message to send along with the friend request.
 * @returns A promise that resolves to a ResultAddFriendFlow enum value indicating the result of the friend addition.
 */
export async function zaloAddFriend(phoneNumber: string = '', message: string = ''): Promise<ResultAddFriendFlow> {
  const builder = new ZaloAddFriendFlowBuilder();

  if (!phoneNumber || !message) return ResultAddFriendFlow.FAILURE;

  if (phoneNumber) builder.withPhoneNumber(phoneNumber);
  if (message) builder.withMessage(message);

  return builder.build().run();
}

/**
 * Builder class for configuring the ZaloAddFriendFlow.
 */
export class ZaloAddFriendFlowBuilder {
  flow: ZaloAddFriendFlow;

  constructor() {
    this.flow = new ZaloAddFriendFlow();
  }

  /**
   * Sets the phone number of the friend to add.
   * @param phoneNumber The phone number of the friend.
   * @returns The current instance of the builder.
   */
  withPhoneNumber(phoneNumber: string) {
    this.flow.phoneNumber = phoneNumber;
    return this;
  }

  /**
   * Sets the message to send along with the friend request.
   * @param message The message to send.
   * @returns The current instance of the builder.
   */
  withMessage(message: string) {
    this.flow.message = message;
    return this;
  }

  /**
   * Builds the ZaloAddFriendFlow instance.
   * @returns The built ZaloAddFriendFlow instance.
   */
  build() {
    return this.flow;
  }
}

/**
 * TODO exhancement with rxjs
 * Represents the flow for adding a friend on Zalo.
 */
class ZaloAddFriendFlow {
  phoneNumber: string = '';
  message: string = '';

  /**
   * Runs the ZaloAddFriendFlow.
   * @returns A promise that resolves to a ResultAddFriendFlow enum value indicating the result of the friend addition.
   */
  async run(): Promise<ResultAddFriendFlow> {
    if (!this.phoneNumber) return ResultAddFriendFlow.NO_FIND_USER;

    try {
      // eslint-disable-next-line no-debugger
      await waitForUserLogined();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // use html element below
      // const addFriendBtn = await hookReactComponentBySelector(ADD_FRIEND_BTN_SELECTOR);
      // if (addFriendBtn == null) return ResultAddFriendFlow.NO_ADD_FRIEND_BUTTON;
      // addFriendBtn.props.onClick();

      const addFriendBtn = await waitForElementBySelector(ADD_FRIEND_BTN_SELECTOR);
      if (addFriendBtn == null) return ResultAddFriendFlow.NO_ADD_FRIEND_BUTTON;
      addFriendBtn.dispatchEvent(new Event('click', { bubbles: true }));

      // use html element below
      // await waitForElement(FIND_FRIEND_CONTAINER);
      // const findFriendContainer = await hookReactComponent(FIND_FRIEND_CONTAINER);
      // if (findFriendContainer == null) return ResultAddFriendFlow.NO_FIND_FRIEND_CONTAINER;
      // findFriendContainer.state.phoneNumber = this.phoneNumber;
      // findFriendContainer.submitFindFriend();

      const findFriendContainer = await waitForElement(FIND_FRIEND_CONTAINER);
      if (findFriendContainer == null) return ResultAddFriendFlow.NO_FIND_FRIEND_CONTAINER;
      // eslint-disable-next-line no-debugger
      const phoneNumberInput = findFriendContainer.querySelector(FIND_FRIEND_PHONE_NUMBER_INPUT);
      if (phoneNumberInput == null) return ResultAddFriendFlow.NO_FIND_FRIEND_CONTAINER;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      phoneNumberInput.value = this.phoneNumber;
      phoneNumberInput.dispatchEvent(new Event('input', { bubbles: true }));
      phoneNumberInput.dispatchEvent(
        new KeyboardEvent('keypress', { key: 'Enter', bubbles: true, which: 13, keyCode: 13 }),
      );

      //now, it has 3 status return
      // 1. no find user
      // 2. find user without friendly
      // 3. find user with friendly
      // TODO profileContainer?.memoizedProps;
      // use html element below
      // const profileContainer = await hookReactComponentBySelector(PROFILE_CONTAINER_SELECTOR, 1);
      // if (profileContainer == null) {
      //   //no find user
      //   return ResultAddFriendFlow.NO_FIND_USER;
      // }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore

      // use html element
      const profileContainer = await waitForElementBySelector(PROFILE_CONTAINER_SELECTOR);
      if (profileContainer == null) {
        //no find user
        return ResultAddFriendFlow.NO_FIND_USER;
      }

      //check if has btn ""
      // const addNewFriendBtn = await hookReactComponentBySelector(ADD_NEW_FRIEND_BTN_SELECTOR);
      const addNewFriendBtn = await waitForElementBySelector(ADD_NEW_FRIEND_BTN_SELECTOR);
      if (addNewFriendBtn == null) {
        //find user friendly
        return ResultAddFriendFlow.EXISTS_FRIEND;
      } else {
        //find user without friendly
        // addNewFriendBtn.props.onClick();
        // dispatch click event
        addNewFriendBtn.dispatchEvent(new Event('click', { bubbles: true }));

        const addFriendMessage = await waitForElementBySelector(ADD_NEW_FRIEND_MESSAGE_SELECTOR);

        //add message
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (this.message) addFriendMessage.value = this.message;

        // const sendRequestNewFriendBtn = await hookReactComponentBySelector(SEND_REQUEST_ADD_NEW_FRIEND_BTN_SELECTOR);
        // sendRequestNewFriendBtn.props.onClick();

        const sendRequestNewFriendBtn = await waitForElementBySelector(SEND_REQUEST_ADD_NEW_FRIEND_BTN_SELECTOR);
        sendRequestNewFriendBtn?.dispatchEvent(new Event('click', { bubbles: true }));
      }

      return ResultAddFriendFlow.SUCCESS;
    } catch (error) {
      //TODO send event error
      console.error('Add friend error', error);
    }

    return ResultAddFriendFlow.FAILURE;
  }
}
