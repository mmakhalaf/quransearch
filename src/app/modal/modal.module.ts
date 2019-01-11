import { NgModule } from '@angular/core';
import { AyahComponent, AyahDialogComponent } from './ayah/ayah.component';
import { MatDialogModule, MatTabsModule, MatButtonModule, MatIconModule } from '@angular/material';
import { ModalRoutingModule } from './modal-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
   declarations: [
      AyahComponent,
      AyahDialogComponent
   ],
   imports: [
      CommonModule,
      FormsModule,
      MatIconModule,
      MatButtonModule,
      MatTabsModule,
      MatDialogModule,
      ModalRoutingModule
   ],
   entryComponents: [
      AyahDialogComponent
   ],
})
export class ModalModule {

}
