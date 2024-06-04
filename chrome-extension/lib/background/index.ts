console.log('background loaded');
console.log("Edit 'apps/chrome-extension/lib/background/index.ts' and save to reload.");

// chrome.scripting
//   .registerContentScripts([
//     {
//       id: 'content',
//       matches: ['https://*.zalo.me/*'],
//       js: ['content/index.iife.js'],
//       runAt: 'document_idle',
//       // eslint-disable-next-line
//       // @ts-ignore
//       world: chrome.scripting.ExecutionWorld.MAIN,
//     },
//   ])
//   .then(() => console.log('zalo registered'))
//   .catch(error => console.error(error));

// chrome.action.onClicked.addListener(tab => {
//   chrome.scripting
//     .executeScript({
//       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//       // @ts-ignore
//       target: { tabId: tab.id },
//       files: ['zalo/index.iife.js'],
//     })
//     .then(() => console.log('zalo registered'))
//     .catch(error => console.error(error));
// });

// chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
//   if (req.type === 'github-account') {
//     chrome.storage.sync.get(GITHUB_ACCOUNT_KEY).then(result => {
//       sendResponse(result);
//     })
//   }
//   return true;
// })
