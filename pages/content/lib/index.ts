import { zaloSendMessage } from '@zalo/send-message-friend-flow';
import { getFriendList } from '../zalo';

//sync friend list
setInterval(async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment, no-debugger
  //get friend list
  const contacts = await getFriendList();

  //update to storage

  //debug
  console.log('contacts:', contacts);
}, 1000 * 30);

(async () => {
  // eslint-disable-next-line no-debugger
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // const addFriendFlowBuilder = useZaloAddFriendFlow('0931205663', 'Hi bot');
  // await addFriendFlowBuilder.build().run();

  await zaloSendMessage('0948832001', 'this is bot auto send message to user by phone number');
})();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
