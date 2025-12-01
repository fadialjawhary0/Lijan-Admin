import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/Home/HomePage'));
const UserManagement = lazy(() => import('../pages/UserManagement/UserManagement'));
const AddUser = lazy(() => import('../pages/UserManagement/AddUser'));
const AddExternalUser = lazy(() => import('../pages/UserManagement/AddExternalUser'));
const EditUser2 = lazy(() => import('../pages/UserManagement/EditUser2'));


import { ADMIN_PRIVATE_ROUTES } from '../constants';

const pageComponents = {
  HomePage,
  UserManagement,
  AddUser,
  AddExternalUser,
  EditUser2,
};

export default ADMIN_PRIVATE_ROUTES?.map(route => <Route key={route?.key} path={route?.path} element={React.createElement(pageComponents[route?.element])} />);
