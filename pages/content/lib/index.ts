// import { zaloSendMessage } from '@zalo/send-message-friend-flow';
// import { getFriendList } from '../zalo';
import { useZaloEventProcessor } from '@zalo/zalo-event-processor';

// //sync friend list
// setInterval(async () => {
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment, no-debugger
//   //get friend list
//   const contacts = await getFriendList();

//   //update to storage

//   //debug
//   console.log('contacts:', contacts);
// }, 1000 * 30);

// eslint-disable-next-line no-debugger
// eslint-disable-next-line react-hooks/rules-of-hooks
// const addFriendFlowBuilder = useZaloAddFriendFlow('0931205663', 'Hi bot');
// await addFriendFlowBuilder.build().run();
// await zaloSendMessage('0948832001', 'this is bot auto send message to user by phone number');

// eslint-disable-next-line react-hooks/rules-of-hooks
const { processor, enqueue } = useZaloEventProcessor();

function connectToBackgroundScript(retryCount = 0) {
  // Connect to the background script
  const port = chrome.runtime.connect({ name: 'content' });

  //listernet event result and send back to background
  const messageSubscription = processor.subscribe(result => {
    console.log('content: processed result:', result);
    port.postMessage(result);
  });

  //TODO should store sendResponse map to handle response
  // add chrome runtime message listener
  port.onMessage.addListener(request => {
    // eslint-disable-next-line no-debugger
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.log('content: receive request:', request);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // console.log('sender:', sender);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    enqueue(request);
  });

  port.onDisconnect.addListener(() => {
    console.log('content: port disconnected');

    //unsubscribe
    messageSubscription.unsubscribe();

    //TODO handle reconnect
    // Retry connection up to 3 times
    if (retryCount < 3) {
      console.log(`content: retrying connection (${retryCount + 1})`);
      setTimeout(() => connectToBackgroundScript(retryCount + 1), 1000);
    } else {
      console.log('content: failed to reconnect after 3 attempts');
    }
  });
}

connectToBackgroundScript();
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
