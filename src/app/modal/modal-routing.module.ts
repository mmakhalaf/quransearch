import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AyahComponent } from './ayah/ayah.component';

const routes: Routes = [
   {
      path: ':id',
      component: AyahComponent,
      outlet: 'primary'
   },
   {
      path: ':id',
      component: AyahComponent,
      outlet: "modal"
   }
];

@NgModule({
   imports: [
      RouterModule.forChild(
         routes
      ),
   ],
   exports: [
      RouterModule
   ]
})
export class ModalRoutingModule {

}
