import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './en/common.json';
import enNavbar from './en/navbar.json';
import enSidebar from './en/sidebar.json';
import enStrategiesForm from './en/strategiesForm.json';
import enGoalsForm from './en/goalsForm.json';
import enConcernsForm from './en/concernsForm.json';
import enDeliverablesForm from './en/deliverablesForm.json';
import enPortfolioForm from './en/portfolioForm.json';
import enMilestonesForm from './en/milestonesForm.json';
import enInitiativesForm from './en/initiativesForm.json';
import enBudgetForm from './en/budgetForm.json';
import enOrganizationForm from './en/organizationForm.json';
import enKPIsForm from './en/kpisForm.json';

import arCommon from './ar/common.json';
import arNavbar from './ar/navbar.json';
import arSidebar from './ar/sidebar.json';
import arStrategiesForm from './ar/strategiesForm.json';
import arGoalsForm from './ar/goalsForm.json';
import arConcernsForm from './ar/concernsForm.json';
import arDeliverablesForm from './ar/deliverablesForm.json';
import arPortfolioForm from './ar/portfolioForm.json';
import arMilestonesForm from './ar/milestonesForm.json';
import arInitiativesForm from './ar/initiativesForm.json';
import arBudgetForm from './ar/budgetForm.json';
import arOrganizationForm from './ar/organizationForm.json';
import arKPIsForm from './ar/kpisForm.json';

const savedLang = localStorage.getItem('i18nextLng') || 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        navbar: enNavbar,
        sidebar: enSidebar,
        strategiesForm: enStrategiesForm,
        goalsForm: enGoalsForm,
        concernsForm: enConcernsForm,
        deliverablesForm: enDeliverablesForm,
        portfolioForm: enPortfolioForm,
        milestonesForm: enMilestonesForm,
        initiativesForm: enInitiativesForm,
        budgetForm: enBudgetForm,
        organizationForm: enOrganizationForm,
        kpisForm: enKPIsForm,
      },
      ar: {
        common: arCommon,
        navbar: arNavbar,
        sidebar: arSidebar,
        strategiesForm: arStrategiesForm,
        goalsForm: arGoalsForm,
        concernsForm: arConcernsForm,
        deliverablesForm: arDeliverablesForm,
        portfolioForm: arPortfolioForm,
        milestonesForm: arMilestonesForm,
        initiativesForm: arInitiativesForm,
        budgetForm: arBudgetForm,
        organizationForm: arOrganizationForm,
        kpisForm: arKPIsForm,
      },
    },
    lng: savedLang,
    fallbackLng: 'en',
    ns: [
      'common',
      'navbar',
      'sidebar',
      'strategiesForm',
      'goalsForm',
      'concernsForm',
      'deliverablesForm',
      'portfolioForm',
      'milestonesForm',
      'initiativesForm',
      'budgetForm',
      'organizationForm',
      'kpisForm',
    ],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
