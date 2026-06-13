import { Component, OnInit, inject } from '@angular/core';
import { QuranService } from '../services/quran.service';
import { ActivatedRoute, Params } from '@angular/router';
import { FilterGroupPres } from '../services/filter-pres';
import { SearchControlsComponent } from './search-controls/search-controls/search-controls.component';
import { SearchResultsComponent } from './results/search-results/search-results.component';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css'],
  imports: [SearchControlsComponent, SearchResultsComponent]
})
export class SearchPageComponent implements OnInit {

   qService = inject(QuranService);
   private route = inject(ActivatedRoute);

   ngOnInit() {
      this.route.queryParams.subscribe((params: Params) => {
         this.on_query_change(params);
      });
   }

   on_query_change(params: Params) {
      let filters = FilterGroupPres.from_params(params);
      if (filters != null && filters.has_search()) {
         this.qService.perform_search(filters);
      }
   }
}
