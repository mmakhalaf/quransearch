import { Component, OnInit, AfterViewInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ScrollingModule as ExperimentalScrollingModule } from '@angular/cdk-experimental/scrolling';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { QuranService } from '../../../services/quran.service';
import { SearchResult, SearchResults } from '../../../quran/quran-search/search-result';
import { QuranRoot } from '../../../quran/quran';
import * as StringUtils from '../../../quran/utils/string-utils';
import { ControlsResService } from '../../../services/controlres.service';
import { SearchResultComponent } from '../search-result/search-result.component';

@Component({
   selector: 'qsearch-results',
   templateUrl: './search-results.component.html',
   styleUrls: ['./search-results.component.css'],
   imports: [
      CommonModule,
      ScrollingModule,
      ExperimentalScrollingModule,
      MatIconModule,
      MatButtonModule,
      SearchResultComponent
   ]
})
export class SearchResultsComponent implements OnInit, AfterViewInit {

   @ViewChild(CdkVirtualScrollViewport)
   viewport?: CdkVirtualScrollViewport;

   roots = new Array<QuranRoot>();

   qService = inject(QuranService);
   private constrolService = inject(ControlsResService);
   private destroyRef = inject(DestroyRef);
   private curPos = 0;

   ngOnInit() {
      this.qService.searchCompleted$
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(this.on_search_complete);
      this.constrolService.scrollToTop$
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(this.scrollToTop);
   }

   ngAfterViewInit() {
      // Drive the toolbar show/hide from the virtual viewport's scroll position.
      this.viewport?.elementScrolled()
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(() => {
            let offset = this.viewport!.measureScrollOffset('top');
            let at_top = offset <= 0;
            if (offset < this.curPos) {
               this.constrolService.onScrollUp(at_top);
            } else {
               this.constrolService.onScrollDown(at_top);
            }
            this.curPos = offset;
         });
   }

   num_results() {
      return StringUtils.number_en_to_ar(this.qService.matches.length())
   }

   num_occurances() {
      return StringUtils.number_en_to_ar(this.qService.matches.num_occurances());
   }

   trackByAyah(_index: number, r: SearchResult): number {
      return r.ayah.id;
   }

   scrollToTop = () => {
      this.viewport?.scrollToOffset(0);
   }

   on_search_complete = (results: SearchResults) => {
      // Collect the unique roots found across all matched words.
      let seen = new Set<string>();
      this.roots = new Array<QuranRoot>();
      for (let res of results.results) {
         for (let val of res.word_indices) {
            let w = res.ayah.words[val];
            let r = w.get_root();
            if (r != null && !seen.has(r.text)) {
               seen.add(r.text);
               this.roots.push(r);
            }
         }
      }

      this.roots.sort((a1: QuranRoot, a2: QuranRoot): number => {
         return a1.text < a2.text ? -1 : (a1.text > a2.text ? 1 : 0);
      });

      this.scrollToTop();
   }

   onRootClicked(root: QuranRoot) {
      this.qService.request_search_with_root_filter(root, true);
   }
}
