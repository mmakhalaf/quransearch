import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { MatIconModule, MatButtonModule } from '@angular/material';

@NgModule({
   declarations: [
      SearchResultsComponent,
      SearchResultComponent
   ],
   imports: [
      CommonModule,
      BrowserModule,
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
