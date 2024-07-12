// import { moveCursorToEnd } from '@utils/html-utils';
// import { offRequestAnimationFrame, onRequestAnimationFrame } from '@utils/html-utils';
import { waitForElement, waitForElementBySelector } from '../utils/react-utils';
import {
  ADD_FRIEND_BTN_SELECTOR,
  FIND_FRIEND_CONTAINER,
  FIND_FRIEND_PHONE_NUMBER_INPUT,
  PROFILE_CONTAINER_SELECTOR,
  SEND_BTN_SELECTOR,
  SEND_MESSAGE_BTN_SELECTOR,
  SEND_MESSAGE_TEXT_CONTAINER_ID,
  // SEND_MESSAGE_TEXT_ID_PREFIX,
} from './constant';
import { waitForUserLogined } from './zalo-utils';

export enum ResultSendMessageFlow {
  NO_ADD_FRIEND_BUTTON = 'NO_ADD_FRIEND_BUTTON',
  NO_FIND_FRIEND_CONTAINER = 'NO_FIND_FRIEND_CONTAINER',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  OVER_QUOTA = 'OVER_QUOTA',
  CAN_NOT_SEND_MESSAGE = 'CAN_NOT_SEND_MESSAGE',
  NO_FIND_USER = 'NO_FIND_USER',
  EXISTS_FRIEND = 'EXISTS_FRIEND',
  EXISTS_USER = 'EXISTS_USER',
}

export interface SendMessageResult {
  status: ResultSendMessageFlow;
  user: {
    userStatus: 'friend' | 'user' | 'no_user' | '';
    userInfo: unknown;
  };
}

const SendMessageFailureResult: SendMessageResult = {
  status: ResultSendMessageFlow.FAILURE,
  user: {
    userStatus: '',
    userInfo: null,
  },
};

export async function zaloSendMessage(phoneNumber: string = '', message: string = ''): Promise<SendMessageResult> {
  const builder = new ZaloSendMessageFlowBuilder();

  // eslint-disable-next-line no-debugger
  if (!phoneNumber || !message) return SendMessageFailureResult;

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

  async run(): Promise<SendMessageResult> {
    let result: SendMessageResult = {
      status: ResultSendMessageFlow.FAILURE,
      user: {
        userStatus: '',
        userInfo: null,
      },
    };

    if (!this.phoneNumber) {
      result.status = ResultSendMessageFlow.NO_FIND_USER;
      return result;
    }

    // eslint-disable-next-line no-debugger
    await waitForUserLogined();

    //TODO get friend from contact list
    result = await this.openChatBoxForFriend(this.phoneNumber);

    // DEBUG
    // return result;

    if (result.status == ResultSendMessageFlow.EXISTS_USER || result.status == ResultSendMessageFlow.EXISTS_FRIEND) {
      result.status = await this.sendMessageToFriend(this.message);
    }

    return result;

    //=========================================================================================================

    //when not in contact list, follow fallback
    // return this.fallback();
  }

  private async openChatBoxForFriend(phoneNumber: string): Promise<SendMessageResult> {
    // offRequestAnimationFrame();

    const result: SendMessageResult = {
      status: ResultSendMessageFlow.NO_FIND_USER,
      user: {
        userStatus: '',
        userInfo: null,
      },
    };

    let searchFriendInput: HTMLInputElement | null = null;
    try {
      searchFriendInput = (await waitForElement('contact-search-input')) as HTMLInputElement;
      searchFriendInput.value = phoneNumber;
      searchFriendInput.dispatchEvent(new Event('input', { bubbles: true }));

      const itemSearchTitle = await waitForElementBySelector('[class="item-search__title"]');
      const searchResultList = await waitForElement('global_search_list');
      //get first item has class 'conv-item'
      const firstItem = searchResultList.querySelector('.conv-item');
      //TODO should check phone number again to make sure select right person

      //trigger click event
      if (firstItem && firstItem.getAttribute('id')?.startsWith('friend-item')) {
        const friendId = firstItem.getAttribute('id')?.replace('friend-item-', '');

        firstItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        // sleep 1s to wait chat box appear
        await new Promise(resolve => setTimeout(resolve, 500));

        //wait chat box appear
        const messageViewContainer = (await waitForElement('messageView')) as HTMLDivElement;

        // find has add friend button
        const addFriendBtn = messageViewContainer.querySelector('[data-id="btn_Chat_AddFrd"]');
        result.status = addFriendBtn == null ? ResultSendMessageFlow.EXISTS_FRIEND : ResultSendMessageFlow.EXISTS_USER;
        result.user = {
          userStatus: result.status == ResultSendMessageFlow.EXISTS_FRIEND ? 'friend' : 'user',
          userInfo: {
            userId: friendId,
          },
        };

        // check if show modal  ???
        try {
          await waitForElementBySelector('div.zl-modal span.zl-modal__dialog__header__title-text', 500);
          result.status = ResultSendMessageFlow.NO_FIND_USER;
        } catch {
          // when not show modal, it means already in chat box
          //result = ResultSendMessageFlow.EXISTS_FRIEND;
        }
      } else {
        // sleep 1s to wait chat box appear
        await new Promise(resolve => setTimeout(resolve, 300));

        // check if has warning over quota seach friend
        if (
          itemSearchTitle.querySelector('[data-translate-inner="STR_PLEASE_NOTE"]') != null ||
          searchResultList.querySelector('[data-translate-inner="STR_LIMIT_SEARCH_NUM_PHONE"]') != null
        ) {
          result.status = ResultSendMessageFlow.OVER_QUOTA;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (searchFriendInput) {
        //clear search input
        searchFriendInput.value = '';
        searchFriendInput.dispatchEvent(new Event('blur', { bubbles: true }));
        searchFriendInput.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, keyCode: 27, which: 27 }),
        );
      }
    }

    // onRequestAnimationFrame();

    return result;
  }

  private async fallbackToFindFriend(phoneNumber: string): Promise<boolean> {
    // offRequestAnimationFrame();

    let result: boolean = false;

    try {
      //reset search friend input
      const searchFriendInput = (await waitForElement('contact-search-input')) as HTMLInputElement;
      searchFriendInput.value = '';
      searchFriendInput.dispatchEvent(new Event('blur', { bubbles: true }));
      // display event esc key
      searchFriendInput.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, keyCode: 27, which: 27 }),
      );

      //get add friend button
      const addFriendBtn = await waitForElementBySelector(ADD_FRIEND_BTN_SELECTOR);

      addFriendBtn.dispatchEvent(new Event('click', { bubbles: true }));

      const findFriendContainer = await waitForElement(FIND_FRIEND_CONTAINER);

      // eslint-disable-next-line no-debugger
      const phoneNumberInput = findFriendContainer.querySelector(FIND_FRIEND_PHONE_NUMBER_INPUT) as HTMLInputElement;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      phoneNumberInput.value = phoneNumber;
      phoneNumberInput.dispatchEvent(new Event('input', { bubbles: true }));
      phoneNumberInput.dispatchEvent(
        new KeyboardEvent('keypress', { key: 'Enter', bubbles: true, which: 13, keyCode: 13 }),
      );

      //now, it has 3 status return
      // 1. no find user
      // 2. find user without friendly
      // 3. find user with friendly

      await waitForElementBySelector(PROFILE_CONTAINER_SELECTOR);

      const sendMessageBtn = await waitForElementBySelector(SEND_MESSAGE_BTN_SELECTOR);
      sendMessageBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      result = true;
    } catch (error) {
      //TODO send error to server
      console.error(error);
    }

    // TODO
    // onRequestAnimationFrame();

    return result;
  }

  private async sendMessageToFriend(message: string): Promise<ResultSendMessageFlow> {
    let result: ResultSendMessageFlow = ResultSendMessageFlow.FAILURE;

    try {
      const messageTextContainer = await waitForElement(SEND_MESSAGE_TEXT_CONTAINER_ID);

      const clipboardData = new DataTransfer();
      const dataType = 'text/plain';
      clipboardData.setData(dataType, message);
      const clipboardEvent = new ClipboardEvent('paste', {
        clipboardData,
        bubbles: true,
        composed: true,
        // dataType,
        // data
      });
      // messageText.dispatchEvent(clipboardEvent);
      messageTextContainer?.dispatchEvent(clipboardEvent);

      const sendBtn = await waitForElementBySelector(SEND_BTN_SELECTOR);

      sendBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      result = ResultSendMessageFlow.SUCCESS;
    } catch (error) {
      console.error(error);
    }

    return result;
  }

  private async fallback(): Promise<ResultSendMessageFlow> {
    //fix issue: when zalo tab not active, container SEND_MESSAGE_TEXT_CONTAINER_ID does not appear
    // offRequestAnimationFrame();

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // const addFriendBtn = await hookReactComponentBySelector(ADD_FRIEND_BTN_SELECTOR);
      // use html element below
      // if (addFriendBtn == null) return ResultSendMessageFlow.NO_ADD_FRIEND_BUTTON;
      // addFriendBtn.props.onClick();
      //use html event
      const addFriendBtn = await waitForElementBySelector(ADD_FRIEND_BTN_SELECTOR);
      if (addFriendBtn == null) return ResultSendMessageFlow.NO_ADD_FRIEND_BUTTON;
      addFriendBtn.dispatchEvent(new Event('click', { bubbles: true }));

      // await waitForElement(FIND_FRIEND_CONTAINER);

      //use html element below
      // const findFriendContainer = await hookReactComponent(FIND_FRIEND_CONTAINER);
      // if (findFriendContainer == null) return ResultSendMessageFlow.NO_FIND_FRIEND_CONTAINER;
      // findFriendContainer.state.phoneNumber = this.phoneNumber;
      // findFriendContainer.submitFindFriend();

      const findFriendContainer = await waitForElement(FIND_FRIEND_CONTAINER);
      if (findFriendContainer == null) return ResultSendMessageFlow.NO_FIND_FRIEND_CONTAINER;
      // eslint-disable-next-line no-debugger
      const phoneNumberInput = findFriendContainer.querySelector(FIND_FRIEND_PHONE_NUMBER_INPUT);
      if (phoneNumberInput == null) return ResultSendMessageFlow.NO_FIND_FRIEND_CONTAINER;
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
      //TODO profileContainer has data in memoizedProps {info :{}}
      // use html element below
      // const profileContainer = await hookReactComponentBySelector(PROFILE_CONTAINER_SELECTOR, 1);
      // if (profileContainer == null) {
      //   //no find user
      //   return ResultSendMessageFlow.NO_FIND_USER;
      // }
      //console.log(profileContainer, profileContainer?.memoizedProps);
      // use html element
      const profileContainer = await waitForElementBySelector(PROFILE_CONTAINER_SELECTOR);
      if (profileContainer == null) {
        //no find user
        return ResultSendMessageFlow.NO_FIND_USER;
      }

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

        // console.log(`send message btn: `, sendMessageBtn);
        sendMessageBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        //find user without friendly

        const messageTextContainer = await waitForElement(SEND_MESSAGE_TEXT_CONTAINER_ID);

        const clipboardData = new DataTransfer();
        const dataType = 'text/plain';
        clipboardData.setData(dataType, this.message);
        const clipboardEvent = new ClipboardEvent('paste', {
          clipboardData,
          bubbles: true,
          composed: true,
          // dataType,
          // data
        });
        // messageText.dispatchEvent(clipboardEvent);
        messageTextContainer?.dispatchEvent(clipboardEvent);

        const sendBtn = await waitForElementBySelector(SEND_BTN_SELECTOR);

        sendBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        // Dispatch the event to the element
        // document.dispatchEvent(clipboardEvent);
        // console.log(clipboardEvent);
        //   let messageText: HTMLElement | null = null;
        //   const messageLines = this.message.split('\n');
        //   for (let i = 0; i < messageLines.length; i++) {
        //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //     // @ts-ignore
        //     messageText = await waitForElement(SEND_MESSAGE_TEXT_ID_PREFIX + i);

        //     if (messageText == null) continue;

        //     const messageLine = messageLines[i];

        //     // console.log(messageLine);
        //     //add message
        //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //     // @ts-ignore
        //     messageText.innerHTML = messageLine.trim() == '' ? '&nbsp;' : messageLine;
        //     moveCursorToEnd(messageText);
        //     // Trigger input event
        //     messageText.dispatchEvent(new Event('input', { bubbles: true }));
        //     // messageTextContainer.dispatchEvent(new Event('input', { bubbles: true }));

        //     if (i < messageLines.length - 1) {
        //       setTimeout(() => {
        //         // Trigger keydown event for Enter key
        //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //         // @ts-ignore

        //         messageText.dispatchEvent(
        //           new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true, which: 13, keyCode: 13 }),
        //         );
        //         messageText?.blur();

        //         const innerMessageTexts = messageText?.querySelectorAll('span');
        //         console.log(innerMessageTexts);

        //         console.log(`fire keydown event`, messageText);
        //         // messageTextContainer?.blur();
        //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //         // @ts-ignore
        //       }, 1000);
        //     }
        //   }

        //   if (messageText instanceof HTMLElement) {
        //     // Trigger keydown event for Enter key
        //     // setTimeout(() => {
        //     // console.log(`send ........`);
        //     messageText.dispatchEvent(
        //       new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, which: 13, keyCode: 13 }),
        //     );
        //     // }, 1000);
        //   }
      }

      // onRequestAnimationFrame();

      return ResultSendMessageFlow.SUCCESS;
    } catch (error) {
      //TODO send error to server
      console.error(error);
    }

    return ResultSendMessageFlow.FAILURE;
  }
}
