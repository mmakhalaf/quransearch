import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

const routes: Routes = [
   {
      path: 'ayah',
      loadChildren: './modal/modal.module#ModalModule',
      outlet: 'primary'
   },
   {
      path: 'ayah',
      loadChildren: './modal/modal.module#ModalModule',
      outlet: "modal"
   },
   {
      path: 'search',
      loadChildren: './search-page/search-page.module#SearchPageModule',
   },
   {
      path: '',
      component: AppComponent
   }
];

@NgModule({
   imports: [
      RouterModule.forRoot(
         routes
      ),
   ],
   exports: [
      RouterModule
   ]
})
export class AppRoutingModule { }
