import zaloInterceptor from '../interceptors/zaloInterceptor';

//TODO wip should on off requestAnimationFrame by send message between content script and web page with window.sendMessage
function offRequestAnimation() {
  const customRequestAnimationFrame = function (callback: TimerHandler) {
    // console.log('Custom requestAnimationFrame called');
    return window.setTimeout(callback, 1000 / 60); // Example: fallback to setTimeout with 60fps
  };

  window.requestAnimationFrame = customRequestAnimationFrame;
}

async function intercepterZalo() {
  (await zaloInterceptor.intercepterMessages()).subscribe(message => {
    console.log('intercepterZalo: ', message);

    // send the message to the content script
    window.postMessage(message);
  });
}

function init() {
  // for debug, enable console.log
  setConsole();

  //TODO wip should on off requestAnimationFrame by send message between content script and web page with window.sendMessage
  offRequestAnimation();

  setTimeout(() => {
    intercepterZalo();
  }, 5000);
}

function setConsole() {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  // eslint-disable-next-line
  // @ts-ignore
  const console = iframe.contentWindow.console;
  window.console = console;
}

init();

console.log('zalo interceptor script loaded');
