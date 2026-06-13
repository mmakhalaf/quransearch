import { Component, OnInit, OnDestroy, ViewChild, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
   imports: [CommonModule, MatIconModule, MatButtonModule, SearchResultComponent]
})
export class SearchResultsComponent implements OnInit, OnDestroy {

   @ViewChild("scrolltop")
   top_item: any;

   roots = new Array<QuranRoot>();

   qService = inject(QuranService);
   private constrolService = inject(ControlsResService);

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

   num_occurances() {
      return StringUtils.number_en_to_ar(this.qService.matches.num_occurances());
   }

   trackByAyah(_index: number, r: SearchResult): number {
      return r.ayah.id;
   }

   scrollToTop = () => {
      // Scroll to the top of the search when a new query is done
      if (this.top_item != null) {
         this.top_item.nativeElement.scrollIntoView({
            behavior: "auto", block: 'nearest'
         });
      }
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

   private curPos = 0;

   @HostListener('window:scroll')
   onWindowScroll() {
      let y = window.scrollY || document.documentElement.scrollTop || 0;
      let at_top = y <= 0;
      if (y < this.curPos) {
         this.constrolService.onScrollUp(at_top);
      } else {
         this.constrolService.onScrollDown(at_top);
      }
      this.curPos = y;
   }
}
