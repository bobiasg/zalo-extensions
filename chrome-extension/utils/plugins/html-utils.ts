export function offRequestAnimationFrame() {
  requestAnimationFrameUtil.override(customRequestAnimationFrame);
}

export function onRequestAnimationFrame() {
  requestAnimationFrameUtil.restore();
}

// Custom implementation for requestAnimationFrame
const customRequestAnimationFrame = function (callback: TimerHandler) {
  console.log('Custom requestAnimationFrame called');
  return window.setTimeout(callback, 1000 / 60); // Example: fallback to setTimeout with 60fps
};

const requestAnimationFrameUtil = (function () {
  let originalRequestAnimationFrame = window.requestAnimationFrame;
  let isOverridden = false;

  function override(
    newFunction: ((callback: FrameRequestCallback) => number) & ((callback: FrameRequestCallback) => number),
  ) {
    if (isOverridden) {
      console.warn('requestAnimationFrame is already overridden.');
      return;
    }

    originalRequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = newFunction;
    isOverridden = true;
  }

  function restore() {
    if (!isOverridden) {
      console.warn('requestAnimationFrame is not overridden.');
      return;
    }

    window.requestAnimationFrame = originalRequestAnimationFrame;
    isOverridden = false;
  }

  return {
    override,
    restore,
  };
})();
