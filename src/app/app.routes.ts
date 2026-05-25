import { Routes } from '@angular/router';

export const routes: Routes = [
  {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },
    {
      path: 'dashboard',
      loadComponent: () => import('./index/index').then(m => m.IndexComponent),
      title: 'Diagnostyka - Dashboard'
    },
    {
      path: 'register',
      loadComponent: () => import('./register/register').then(m => m.RegisterComponent),
      title: 'Diagnostyka - Register'
    },
    {
      path: 'login',
      loadComponent: () => import('./login/login').then(m => m.LoginComponent),
      title: 'Diagnostyka - Login'
    },
    {
      path: 'setup',
      loadComponent: () => import('./setup/setup').then(m => m.ProfileSetupComponent),
      title: 'Diagnostyka - Setup'
    },
    {
      path: 'profile',
      loadComponent: () => import('./profile/profile').then(m => m.ProfileComponent),
      title: 'Diagnostyka - Profile'
    },
    {
      path: '**',
      redirectTo: 'dashboard'
    }
];
