import { Component, Input, OnInit, ChangeDetectorRef, Output, EventEmitter, NgZone } from '@angular/core';
import { SearchResult } from '../quran/quran-search/search-result';
import { QuranService } from '../services/quran.service';
import { QuranWord, Category } from '../quran/quran';
import * as StringUtils from '../quran/utils/string-utils';


@Component({
   selector: 'qsearch-result',
   templateUrl: './search-result.component.html',
   styleUrls: ['./search-result.component.css'],
   // changeDetection: ChangeDetectionStrategy.OnPush,
   host: {
      '[id]': 'result.ayah.id'
   }
})
export class SearchResultComponent implements OnInit {

   @Input()
   result: SearchResult;

   @Output()
   sizeChanged = new EventEmitter<void>();

   constructor(private qService: QuranService, private change_det: ChangeDetectorRef, private zone: NgZone) {
   }

   ngOnInit() {
   }
   
   should_highlight(index: number): boolean {
      return this.result.word_indices.has(index);
   }
   
   onWordClicked(word: QuranWord) {
      this.qService.request_search_with_word_filter(word.imlaai, false);
   }

   onCategoryClicked(cat: Category) {
      this.qService.request_search_with_cat_filter(cat, false);
   }
   
   number_en_to_ar(num: number): string {
      return StringUtils.number_en_to_ar(num);
   }

   panelChanged() {
      this.sizeChanged.emit();
   }
}
