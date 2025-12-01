import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ADMIN_PRIVATE_ROUTES } from '../../constants';

import DevoteamLogo from '../../assets/Devoteam_logo.png';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '../../context';

const Sidebar = () => {
  const navigate = useNavigate();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { t, i18n } = useTranslation('sidebar');

  const location = useLocation();

  const isRTL = i18n.dir() === 'rtl';

  const routes = ADMIN_PRIVATE_ROUTES;

  return (
    <aside
      className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-screen border-x border-gray-300 text-white bg-slate-50 
      transition-all duration-300 ease-in-out z-30 ${isCollapsed ? 'w-20' : 'w-58'}`}
    >
      <div className="flex flex-col gap-6 p-4 h-full">
        <div className="flex items-center justify-between">
          <img src={DevoteamLogo} alt="logo" className="w-10 h-10 cursor-pointer" onClick={() => navigate('')} />
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1 rounded-lg transition-colors duration-200 ${isCollapsed ? '' : 'hover:bg-gray-200'}`}
          >
            {isCollapsed ? (
              isRTL ? (
                <ChevronLeft className="w-5 h-5 text-gray-600 cursor-pointer" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600 cursor-pointer" />
              )
            ) : isRTL ? (
              <ChevronRight className="w-5 h-5 text-gray-600 cursor-pointer" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600 cursor-pointer" />
            )}
          </button>
        </div>
        <ul className="space-y-2 flex-1">
          {routes
            ?.filter(route => route?.showInSidebar)
            .map(route => {
              const isActive = location?.pathname === route?.path;
              return (
                <li key={route?.key}>
                  <Link
                    to={route?.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 font-medium ${
                      isActive ? 'bg-gray-200 text-primary-rich' : 'hover:bg-gray-200 hover:text-primary-rich'
                    }`}
                    title={isCollapsed ? route?.label : ''}
                  >
                    {route?.icon && (
                      <span>
                        <route.icon size={22} strokeWidth={1} />
                      </span>
                    )}
                    <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
                      {t(route?.label)}
                    </span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
