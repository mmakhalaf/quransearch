import { Component, OnInit, ViewChild } from '@angular/core';
import { QuranService } from './services/quran.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { SearchResult } from './quran/search-result';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';

// Consts
@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

   @ViewChild("scroll")
   scroll: VirtualScrollerComponent;
   
   constructor(
      private qService: QuranService,
      private route: ActivatedRoute
      ) {
   }

   ngOnInit() {
      this.route.queryParams.subscribe((params: ParamMap) => {
         this.on_query_change(params);
      });
      this.qService.onSearchValUpdated.set(this, this.on_search_query_changed);
   }

   ngOnDestroy() {
      this.qService.onSearchValUpdated.delete(this);
   }

   on_search_query_changed = (searchVal: string) => {
      this.scroll.invalidateAllCachedMeasurements();
      this.scroll.scrollToPosition(0, 0);
   }

   onItemUpdated(r: SearchResult, i: number) {
      console.log(`Invalidate Cached Measurement for Ayah ${r.ayah.id}`);
      if (i > 0) {
         this.scroll.invalidateCachedMeasurementAtIndex(i - 1);
      }
      if (i < this.qService.matches.length() - 1) {
         this.scroll.invalidateCachedMeasurementAtIndex(i + 1);
      }
      this.scroll.invalidateCachedMeasurementAtIndex(i);
   }

   on_query_change(params: ParamMap) {
      let q = params['q'];
      let r = params['r'];
      console.log(`OnInit ${q}, ${r}`);
      if (q !== undefined) {
         this.qService.perform_query_search(q);
      } else if (r !== undefined) {
         this.qService.perform_root_search(r);
      }
   }
}
