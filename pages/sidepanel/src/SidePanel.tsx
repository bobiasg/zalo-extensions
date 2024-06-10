import '@src/SidePanel.css';
import { withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { useEffect } from 'react';
// import PerfectScrollbar from 'react-perfect-scrollbar';

import ZaloStatus from './ZaloStatus';
import QueueMessages from './QueueMessages';

const SidePanel = () => {
  useEffect(() => {
    console.log('SidePanel mounted');
    return () => {
      console.log('SidePanel unmounted');
    };
  }, []);

  return (
    <div className="flex flex-col mx-3 h-screen overflow-hidden">
      <header className="mt-2 flex-none">
        <ZaloStatus />
      </header>
      <div className="flex-grow overflow-hidden">
        {/* <PerfectScrollbar options={{ suppressScrollX: true }}> */}
        <QueueMessages />
        {/* </PerfectScrollbar> */}
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
