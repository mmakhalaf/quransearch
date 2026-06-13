import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
   {
      path: 'ayah/:id',
      loadComponent: () => import('./modal/ayah/ayah.component').then(m => m.AyahComponent),
      outlet: 'primary'
   },
   {
      path: 'ayah/:id',
      loadComponent: () => import('./modal/ayah/ayah.component').then(m => m.AyahComponent),
      outlet: 'modal'
   },
   {
      path: 'search',
      loadComponent: () => import('./search-page/search-page.component').then(m => m.SearchPageComponent)
   },
   {
      path: '',
      component: HomeComponent
   }
];
