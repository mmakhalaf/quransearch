import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule, MatButtonModule, MatIconModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { ClipboardModule } from 'ngx-clipboard';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

@NgModule({
   declarations: [
      AppComponent,
      HomeComponent
   ],
   imports: [
      CommonModule,
      BrowserModule,
      FormsModule,
      BrowserAnimationsModule,
      ClipboardModule,
      MatSnackBarModule,
      MatButtonModule,
      MatIconModule,
      AppRoutingModule
   ],
   providers: [
      CookieService
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
