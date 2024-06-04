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
