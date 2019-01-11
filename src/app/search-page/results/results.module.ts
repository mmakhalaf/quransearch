import { NgModule } from '@angular/core';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { MatIconModule, MatButtonModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
   declarations: [
      SearchResultsComponent,
      SearchResultComponent
   ],
   imports: [
      CommonModule,
      FormsModule,
      VirtualScrollerModule,
      MatIconModule,
      MatButtonModule
   ],
   exports: [
      SearchResultsComponent,
      SearchResultComponent
   ]
})
export class ResultsModule { }
