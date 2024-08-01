import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

const isFirefox = process.env.__FIREFOX__ === 'true';
/**
 * After changing, please reload the extension at `chrome://extensions`
 * @type {chrome.runtime.ManifestV3}
 */
const sidePanelConfig = {
  side_panel: {
    default_path: 'sidepanel/index.html',
  },
  permissions: !isFirefox ? ['sidePanel'] : [],
};

const manifest = Object.assign(
  {
    manifest_version: 3,
    default_locale: 'en',
    /**
     * if you want to support multiple languages, you can use the following reference
     * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization
     */
    name: 'Zalo Extension',
    version: packageJson.version,
    description: 'Extension function for zalo chat',
    permissions: ['storage', 'scripting', 'tabs', 'activeTab'].concat(sidePanelConfig.permissions),
    // options_page: 'options/index.html',
    background: {
      service_worker: 'background.iife.js',
      type: 'module',
    },
    // action: {
    //   default_popup: 'popup/index.html',
    //   default_icon: 'icon-34.png',
    // },
    // chrome_url_overrides: {
    //   newtab: 'newtab/index.html',
    // },
    icons: {
      128: 'icon-128.png',
    },
    content_scripts: [
      {
        matches: ['https://*.zalo.me/*'],
        js: ['content/index.iife.js'],
        run_at: 'document_end',
        // world: 'MAIN',
      },
      {
        matches: ['https://*.zalo.me/*'],
        js: ['zalo/index.iife.js'],
        run_at: 'document_end',
        world: 'MAIN',
      },
      {
        matches: ['http://app.services.io.vn/*', 'http://localhost/*', 'http://127.0.0.1/*'],
        js: ['proxy/index.iife.js'],
        run_at: 'document_end',
        // world: 'MAIN',
      },
    ],
    // devtools_page: 'devtools/index.html',
    web_accessible_resources: [
      {
        resources: ['*.js', '*.css', '*.svg', 'icon-128.png', 'icon-34.png'],
        matches: ['*://*/*'],
      },
    ],
    host_permissions: ['https://*.zalo.me/'],
    content_security_policy: {
      extension_pages: "script-src 'self' ; object-src 'self'; ",
    },
  },
  !isFirefox && { side_panel: { ...sidePanelConfig.side_panel } },
);

export default manifest;
