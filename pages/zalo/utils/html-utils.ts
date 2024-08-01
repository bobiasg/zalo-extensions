//TODO wip should on off requestAnimationFrame by send message between content script and web page with window.sendMessage
export function offRequestAnimation() {
  const customRequestAnimationFrame = function (callback: TimerHandler) {
    // console.log('Custom requestAnimationFrame called');
    return window.setTimeout(callback, 1000 / 60); // Example: fallback to setTimeout with 60fps
  };

  window.requestAnimationFrame = customRequestAnimationFrame;
}

export function setConsole() {
  // if (process.env.NODE_ENV !== 'development') return;

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  // eslint-disable-next-line
  // @ts-ignore
  const console = iframe.contentWindow.console;
  window.console = console;
}
