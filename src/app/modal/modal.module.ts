import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AyahComponent, AyahDialogComponent } from './ayah/ayah.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule, MatSnackBarModule, MatTabsModule, MatButtonModule, MatIconModule } from '@angular/material';

@NgModule({
   declarations: [
      AyahComponent,
      AyahDialogComponent
   ],
   imports: [
      CommonModule,
      BrowserModule,
      FormsModule,
      MatIconModule,
      MatButtonModule,
      MatTabsModule,
      MatSnackBarModule,
      MatDialogModule
   ],
   entryComponents: [
      AyahDialogComponent
   ],
})
export class ModalModule {

}
