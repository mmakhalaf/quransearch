import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { QuranService } from '../services/quran.service';

let $: any;

@Component({
   selector: 'qsearch-controls',
   templateUrl: './search-controls.component.html',
   styleUrls: ['./search-controls.component.css']
})
export class SearchControlsComponent implements OnInit, OnDestroy {

   subject = new Subject<string>();
   searchVal = '';

   constructor(private qService: QuranService) {
      
   }

   ngOnInit() {
      this.qService.onSearchValUpdated.set(this, this.on_search_val_updated);
      this.subject.pipe(debounceTime(250)).subscribe(() => {
         this.onSearch();
      });
   }

   ngOnDestroy() {
      this.qService.onSearchValUpdated.delete(this);
   }

   /// Events
   onKeyUp(){
      this.subject.next();
   }

   onSearch() {
      this.qService.request_query_search(this.searchVal);
   }

   on_search_val_updated = (searchVal: string) => {
      if (this.searchVal !== searchVal) {
         this.searchVal = searchVal;
      }
   }

}
