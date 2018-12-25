import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { QuranService } from '../services/quran.service';

@Component({
   selector: 'qsearch-controls',
   templateUrl: './search-controls.component.html',
   styleUrls: ['./search-controls.component.css']
})
export class SearchControlsComponent implements OnInit {

   subject = new Subject<string>();
   searchVal = '';

   constructor(private qService: QuranService) {
      
   }

   ngOnInit() {
      this.qService.onSearchValUpdated.push(this.onSearchValUpdated);
      this.subject.pipe(debounceTime(250)).subscribe(() => {
         this.onSearch();
      });
   }

   /// Events
   onKeyUp(){
      this.subject.next();
   }

   onSearch() {
      this.qService.request_query_search(this.searchVal);
   }

   onSearchValUpdated = (searchVal: string) => {
      if (this.searchVal !== searchVal) {
         this.searchVal = searchVal;
      }
   }

}
