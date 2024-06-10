import { createRoot } from 'react-dom/client';
import '@src/index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-perfect-scrollbar/dist/css/styles.css';

import SidePanel from '@src/SidePanel';

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);
  root.render(<SidePanel />);
}

init();
