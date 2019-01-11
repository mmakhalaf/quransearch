import { NgModule } from '@angular/core';
import { SearchControlsModule } from './search-controls/search-controls.module';
import { ResultsModule } from './results/results.module';
import { SearchPageComponent } from './search-page.component';

@NgModule({
   declarations: [
      SearchPageComponent
   ],
   imports: [
      SearchControlsModule,
      ResultsModule
   ]
})
export class SearchPageModule {

}
