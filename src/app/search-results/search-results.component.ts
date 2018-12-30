import { Component, OnInit, OnDestroy, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { QuranService, SearchMode } from '../services/quran.service';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';
import { SearchResult, SearchResults } from '../quran/search-result';
import { QuranRoot } from '../quran/quran';
import * as StringUtils from '../quran/utils/string-utils';

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
      private change_det: ChangeDetectorRef
      ) {
      
   }

   ngOnInit() {
      this.qService.onSearchValUpdated.set(this, this.on_search_query_changed);
      this.qService.onSearchCompleted.set(this, this.on_search_complete);
   }

   ngOnDestroy() {
      this.qService.onSearchValUpdated.delete(this);
      this.qService.onSearchCompleted.delete(this);
   }

   num_results() {
      return StringUtils.number_en_to_ar(this.qService.matches.length())
   }

   on_search_query_changed = (searchVal: string) => {
      // Scroll to the top of the search when a new query is done
      this.top_item.nativeElement.scrollIntoView({
         behavior: "instant", block: 'nearest'
      });
   }

   on_search_complete = (results: SearchResults, searchMode : SearchMode) => {
      this.roots = new Array<QuranRoot>();
      if (searchMode != SearchMode.Root) {
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
      }

      this.roots.sort((a1: QuranRoot, a2: QuranRoot): number => {
         return a1 < a2 ? -1 : (a1 > a2 ? 1 : 0);
      });
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
      this.qService.request_root_search(root.text);
   }
}
