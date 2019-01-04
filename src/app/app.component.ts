import { Component, OnInit } from '@angular/core';
import { QuranService } from './services/quran.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FilterGroupPres } from './services/filter-pres';

// Consts
@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

   constructor(
      public qService: QuranService,
      private route: ActivatedRoute
      ) {
   }

   ngOnInit() {
      this.route.queryParams.subscribe((params: ParamMap) => {
         this.on_query_change(params);
      });
   }

   on_query_change(params: ParamMap) {
      console.log(`OnQueryChange From URL`);
      let filters = FilterGroupPres.from_params(params);
      if (filters != null && filters.has_search()) {
         this.qService.perform_search(filters);
      }
   }
}
