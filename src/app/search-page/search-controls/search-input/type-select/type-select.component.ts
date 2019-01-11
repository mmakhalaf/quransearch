import { Component, OnInit } from '@angular/core';
import { QuranService } from '../../../../services/quran.service';

@Component({
   selector: 'qinput-type-select',
   templateUrl: './type-select.component.html',
   styleUrls: ['./type-select.component.css']
})
export class TypeSelectComponent implements OnInit {

   constructor(public qService: QuranService) {

   }

   ngOnInit() {
   }
   
   onTermTypeChanged() {
      this.qService.searchCriteriaPres.cur_filter.cur_search_term = '';
      this.qService.searchCriteriaPres.filter_updated();
   }

}
