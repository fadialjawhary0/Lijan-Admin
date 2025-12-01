import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import i18n from '../../i18n/i18n';

const Navbar = () => {
  const { t } = useTranslation('navbar');
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (i18n.language === 'ar') {
      document.body.classList.add('ar-font');
    } else {
      document.body.classList.remove('ar-font');
    }
  }, [i18n.language]);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = () => {
    logout();
    navigate('login');
  };

  return (
    <header className="px-4 py-2 flex justify-between items-center border-b border-gray-400 bg-slate-50">
      <h6 className="text-lg font-semibold">{t('welcome')}</h6>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLanguage}
          className="text-sm text-primary border px-2 py-1 rounded hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer"
        >
          {t('switch')}
        </button>
        <Bell className="w-4 h-4 text-primary cursor-pointer" />
        <span className="h-6 border-l border-gray-300 mx-2"></span>
        <User className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-gray-800" lang="en">
          Admin User
        </span>
        <span className="h-6 border-l border-gray-300 mx-2"></span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
