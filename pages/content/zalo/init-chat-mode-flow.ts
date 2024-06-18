import { waitForElement } from '@utils/react-utils';
import { waitForUserLogined } from './zalo-utils';

export function initChatMode() {
  const builder = new ZaloInitChatModeFlowBuilder();
  return builder.build().run();
}

export enum ResultInitChatModeFlow {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

class ZaloInitChatModeFlowBuilder {
  flow: ZaloInitChatModeFlow;

  constructor() {
    this.flow = new ZaloInitChatModeFlow();
  }

  build() {
    return this.flow;
  }
}

class ZaloInitChatModeFlow {
  async run(): Promise<ResultInitChatModeFlow> {
    // eslint-disable-next-line no-debugger
    await waitForUserLogined();

    try {
      //find conversation list
      const conversationList = await waitForElement('conversationListId');

      //find first conversation
      const firstConversation = conversationList?.querySelector('[data-id="div_TabMsg_ThrdChItem"] .conv-item');

      if (firstConversation) {
        firstConversation.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        return ResultInitChatModeFlow.SUCCESS;
      }
    } catch (error) {
      console.log('error', error);
    }

    return ResultInitChatModeFlow.FAILURE;
  }
}
