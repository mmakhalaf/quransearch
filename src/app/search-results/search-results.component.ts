import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { QuranService } from '../services/quran.service';
import { VirtualScrollerComponent, ChangeEvent } from 'ngx-virtual-scroller';
import { SearchResult, SearchResults } from '../quran/quran-search/search-result';
import { QuranRoot } from '../quran/quran';
import * as StringUtils from '../quran/utils/string-utils';
import { ControlsResService } from '../services/controlres.service';

@Component({
   selector: 'qsearch-results',
   templateUrl: './search-results.component.html',
   styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {

   @ViewChild("scroll")
   scroll: VirtualScrollerComponent;

   @ViewChild("scrolltop")
   top_item: any;

   @Input()
   parent: any;

   roots = new Array<QuranRoot>();

   constructor(
      public qService: QuranService,
      private constrolService: ControlsResService
      ) {
      
   }

   ngOnInit() {
      this.qService.onSearchCompleted.set(this, this.on_search_complete);
      this.constrolService.onScrollToTopRequest.set(this, this.scrollToTop);
   }

   ngOnDestroy() {
      this.qService.onSearchCompleted.delete(this);
      this.constrolService.onScrollToTopRequest.delete(this);
   }

   num_results() {
      return StringUtils.number_en_to_ar(this.qService.matches.length())
   }
   
   scrollToTop = () => {
      // Scroll to the top of the search when a new query is done
      this.top_item.nativeElement.scrollIntoView({
         behavior: "instant", block: 'nearest'
      });
   }

   on_search_complete = (results: SearchResults) => {
      this.roots = new Array<QuranRoot>();
      for (let res of results.results) {
         res.word_indices.forEach((val: number, k: number) => {
            let w = res.ayah.words[val];
            let r = w.get_root();
            if (r != null) {
               let found = false;
               for (let r of this.roots) {
                  if (r.text === r.text) {
                     found = true;
                  }
               }
               if (!found) {
                  this.roots.push(r);
               }
            }
         });
      }

      this.roots.sort((a1: QuranRoot, a2: QuranRoot): number => {
         return a1 < a2 ? -1 : (a1 > a2 ? 1 : 0);
      });

      this.scrollToTop();
   }

   onItemUpdated(r: SearchResult, i: number) {
      if (i > 0) {
         this.scroll.invalidateCachedMeasurementAtIndex(i - 1);
      }
      if (i < this.qService.matches.length() - 1) {
         this.scroll.invalidateCachedMeasurementAtIndex(i + 1);
      }
      this.scroll.invalidateCachedMeasurementAtIndex(i);
   }

   onRootClicked(root: QuranRoot) {
      this.qService.reset_search_with_root_filter(root);
   }

   curPos = 0;
   onScrollChanged(e: ChangeEvent) {
      if (e.scrollStartPosition == 0 || e.scrollStartPosition < this.curPos) {
         this.constrolService.onScrollUp(e.start <= 0);
      } else {
         this.constrolService.onScrollDown(e.start <= 0);
      }
      this.curPos = e.scrollStartPosition;
   }
}
