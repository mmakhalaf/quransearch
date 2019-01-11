import { Component, OnInit, ViewChild } from '@angular/core';
import { QuranService } from '../services/quran.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FilterGroupPres } from '../services/filter-pres';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit {

   @ViewChild('cb')
   cb: any;

   constructor(
      public qService: QuranService,
      private route: ActivatedRoute
      ) { 
         
      }

   ngOnInit() {
      console.log('Search Page Component Created');
      this.qService.cbElem = this.cb.nativeElement;
      this.route.queryParams.subscribe((params: ParamMap) => {
         this.on_query_change(params);
      });
   }

   on_query_change(params: ParamMap) {
      let filters = FilterGroupPres.from_params(params);
      if (filters != null && filters.has_search()) {
         this.qService.perform_search(filters);
      }
   }
}
