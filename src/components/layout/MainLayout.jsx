import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useSidebar } from '../../context';

const MainLayout = ({ children }) => {
  const { i18n } = useTranslation('sidebar');
  const isRTL = i18n.dir() === 'rtl';

  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div
        className={`flex-1 transition-all duration-300 overflow-x-auto ${
          isCollapsed ? (isRTL ? 'pr-20' : 'pl-20') : isRTL ? 'pr-58' : 'pl-58'
        } flex flex-col min-h-0`}
      >
        <Navbar />
        <div className="flex-1 p-2 md:p-4 flex flex-col min-h-0">
          <main className="flex-1 flex flex-col min-h-0">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
