import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchControlsComponent } from './search-controls/search-controls.component';
import { SearchInputComponent } from './search-input/search-input.component';
import { TermSettingsComponent } from './term-settings/term-settings.component';
import { FiltersListComponent } from './filters-list/filters-list.component';
import { SearchSettingsComponent } from './search-settings/search-settings.component';
import { InputFieldComponent } from './search-input/input-field/input-field.component';
import { TypeSelectComponent } from './search-input/type-select/type-select.component';
import { OptsButtonsComponent } from './search-input/opts-buttons/opts-buttons.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule, MatIconModule, MatFormFieldModule, MatChipsModule, MatOptionModule, MatAutocompleteModule, MatInputModule, MatBadgeModule, MatSelectModule, MatButtonModule, MatBottomSheetModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
   declarations: [
      SearchControlsComponent,
      SearchInputComponent,
      TermSettingsComponent,
      FiltersListComponent,
      SearchSettingsComponent,
      InputFieldComponent,
      TypeSelectComponent,
      OptsButtonsComponent
   ],
   imports: [
      CommonModule,
      BrowserModule,
      FormsModule,
      ReactiveFormsModule,
      BrowserAnimationsModule,
      MatProgressBarModule,
      MatIconModule,
      MatFormFieldModule,
      MatChipsModule,
      MatOptionModule,
      MatAutocompleteModule,
      MatInputModule,
      MatBadgeModule,
      MatSelectModule,
      MatButtonModule,
      MatBottomSheetModule
   ],
   exports: [
      SearchControlsComponent
   ],
   entryComponents: [
      TermSettingsComponent,
      SearchSettingsComponent,
      FiltersListComponent
   ]
})
export class SearchControlsModule {

}
