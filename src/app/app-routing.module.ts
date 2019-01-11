import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AyahComponent } from './ayah/ayah.component';
import { SearchPageComponent } from './search-page/search-page.component';

const routes: Routes = [
   {
      path: 'ayah/:id',
      component: AyahComponent,
      outlet: 'primary'
   },
   {
      path: 'ayah/:id',
      component: AyahComponent,
      outlet: "modal"
   },
   {
      path: 'search',
      component: SearchPageComponent
   },
   {
      path: '',
      component: SearchPageComponent
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
