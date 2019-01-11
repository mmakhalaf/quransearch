import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

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
      component: HomeComponent
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
