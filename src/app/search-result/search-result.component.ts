import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, Output, EventEmitter, NgZone } from '@angular/core';
import { SearchResult } from '../quran/search-result';
import { QuranService } from '../services/quran.service';
import { QuranRoot, QuranWord, Ayah, SimilarAyah } from '../quran/quran';
import * as StringUtils from '../quran/string-utils';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


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
   
   related_ayat = new Array<SimilarAyah>();

   constructor(private qService: QuranService, private change_det: ChangeDetectorRef, private zone: NgZone) {
   }

   ngOnInit() {
      this.related_ayat = this.result.ayah.get_related_ayat();
   }
   
   should_highlight(index: number): boolean {
      return this.result.word_indices.has(index);
   }
   
   onWordClicked(word: QuranWord) {
      this.qService.request_query_search(word.imlaai);
   }
   
   number_en_to_ar(num: number): string {
      return StringUtils.number_en_to_ar(num);
   }

   panelChanged() {
      this.sizeChanged.emit();
   }
}
