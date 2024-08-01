import interceptor from '../interceptors/message-interceptor';
import { setConsole, offRequestAnimation } from '@utils/html-utils';
import { dispatch } from '../dispatchers/default-dispatcher';
import { ZaloReceivedMessageEvent, ZaloMessageData } from '@chrome-extension-boilerplate/zalo/models';

function intercepterZaloMessage() {
  interceptor.subscribe((message: ZaloMessageData) => {
    console.debug('intercepterZalo: ', message);

    // send the message to the content script
    dispatch(new ZaloReceivedMessageEvent(message));
  });

  interceptor.start();
}

function init() {
  // for debug, enable console.log
  setConsole();

  //TODO wip should on off requestAnimationFrame by send message between content script and web page with window.sendMessage
  offRequestAnimation();

  setTimeout(() => {
    intercepterZaloMessage();
  }, 5000);

  console.debug('zalo interceptor script loaded');
}

init();
