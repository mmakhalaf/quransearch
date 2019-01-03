import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCheckboxModule, MatInputModule, MatTabsModule, MatCardModule, MatIconModule, MatExpansionModule, MatGridListModule, MatProgressSpinnerModule, MatProgressBarModule, MatChipsModule, MatSelectModule, MatButtonToggleModule, MatDividerModule, MatBadgeModule, MatAutocompleteModule } from '@angular/material';
import { ClipboardModule } from 'ngx-clipboard';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { SearchControlsComponent } from './search-controls/search-controls.component';
import { SearchResultsComponent } from './search-results/search-results.component';

@NgModule({
   declarations: [
      AppComponent,
      SearchResultComponent,
      SearchControlsComponent,
      SearchResultsComponent
   ],
   imports: [
      BrowserModule,
      FormsModule,
      ReactiveFormsModule,
      ClipboardModule,
      BrowserAnimationsModule,
      MatIconModule,
      MatButtonModule,
      MatCheckboxModule,
      MatTabsModule,
      MatCardModule,
      MatExpansionModule,
      MatGridListModule,
      MatInputModule,
      MatProgressSpinnerModule,
      MatProgressBarModule,
      MatChipsModule,
      MatSelectModule,
      MatButtonToggleModule,
      MatBadgeModule,
      MatAutocompleteModule,
      VirtualScrollerModule,
      AppRoutingModule
   ],
   providers: [],
   bootstrap: [AppComponent]
})
export class AppModule { }
