import { NgModule } from '@angular/core';
import { ClipboardModule } from 'ngx-clipboard';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ModalModule } from './modal/modal.module';
import { SearchPageModule } from './search-page/search-page.module';

@NgModule({
   declarations: [
      AppComponent
   ],
   imports: [
      ClipboardModule,
      AppRoutingModule,
      SearchPageModule,
      ModalModule
   ],
   providers: [
      CookieService
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
