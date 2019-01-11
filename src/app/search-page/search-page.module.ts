import { NgModule } from '@angular/core';
import { SearchControlsModule } from './search-controls/search-controls.module';
import { ResultsModule } from './results/results.module';
import { SearchPageComponent } from './search-page.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchPageRoutingModule } from './search-page-routing.module';

@NgModule({
   declarations: [
      SearchPageComponent
   ],
   imports: [
      CommonModule,
      FormsModule,
      SearchControlsModule,
      ResultsModule,
      SearchPageRoutingModule
   ]
})
export class SearchPageModule {

}
