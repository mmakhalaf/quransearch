import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCheckboxModule, MatInputModule, MatTabsModule, MatCardModule, MatIconModule, MatExpansionModule, MatGridListModule, MatProgressSpinnerModule, MatProgressBarModule, MatChipsModule, MatSelectModule, MatButtonToggleModule, MatDividerModule, MatBadgeModule, MatAutocompleteModule, MatSnackBarModule, MatBottomSheetModule } from '@angular/material';
import { ClipboardModule } from 'ngx-clipboard';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { SearchControlsComponent } from './search-controls/search-controls.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchInputComponent } from './search-input/search-input.component';
import { TermSettingsComponent } from './term-settings/term-settings.component';
import { FiltersListComponent } from './filters-list/filters-list.component';
import { SearchSettingsComponent } from './search-settings/search-settings.component';
import { InputFieldComponent } from './search-input/input-field/input-field.component';
import { TypeSelectComponent } from './search-input/type-select/type-select.component';
import { OptsButtonsComponent } from './search-input/opts-buttons/opts-buttons.component';

@NgModule({
   declarations: [
      AppComponent,
      SearchResultComponent,
      SearchControlsComponent,
      SearchResultsComponent,
      SearchInputComponent,
      TermSettingsComponent,
      FiltersListComponent,
      SearchSettingsComponent,
      InputFieldComponent,
      TypeSelectComponent,
      OptsButtonsComponent
   ],
   entryComponents: [
      TermSettingsComponent,
      SearchSettingsComponent,
      FiltersListComponent
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
      MatSnackBarModule,
      MatBottomSheetModule,
      VirtualScrollerModule,
      AppRoutingModule
   ],
   providers: [
      CookieService
   ],
   bootstrap: [AppComponent]
})
export class AppModule { }
