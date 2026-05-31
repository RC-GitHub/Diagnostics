import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index').then((m) => m.IndexComponent),
    title: 'Diagnostyka',
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register').then((m) => m.RegisterComponent),
    title: 'Diagnostyka - Register',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.LoginComponent),
    title: 'Diagnostyka - Login',
  },
  {
    path: 'complete',
    loadComponent: () => import('./complete/complete').then((m) => m.CompleteSetup),
    title: 'Diagnostyka - Setup',
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile').then((m) => m.ProfileComponent),
    title: 'Diagnostyka - Profile',
  },
  { path: 'api/results/:hash', redirectTo: 'results/:hash', pathMatch: 'full' },
  {
    path: 'results/:hash',
    loadComponent: () => import('./results/results').then((m) => m.ResultsComponent),
    title: 'Diagnostyka - Results',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
