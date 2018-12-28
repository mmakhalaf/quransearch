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
export class SearchResultComponent implements OnInit, OnDestroy {

   @Input()
   result: SearchResult;

   @Output()
   sizeChanged = new EventEmitter<void>();
   
   show_roots = false;
   show_related = false;

   roots = new Array<QuranRoot>();
   related_ayat = new Array<SimilarAyah>();

   constructor(private qService: QuranService, private change_det: ChangeDetectorRef, private zone: NgZone) {
   }

   ngOnInit() {
      // console.log(`Component created for Ayah ${this.result.ayah.id}`);
      this.result.word_indices.forEach((val: number, k: number) => {
         let w = this.result.ayah.words[val];
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
      
      this.related_ayat = this.result.ayah.get_related_ayat();
   }

   ngOnDestroy() {
   }
   
   should_highlight(index: number): boolean {
      return this.result.word_indices.has(index);
   }
   
   onShowRootsClicked() {
      this.show_roots = !this.show_roots;
      this.change_det.detectChanges();
   }

   onShowRelatedClicked() {
      this.show_related = !this.show_related;
      this.change_det.detectChanges();
   }

   onWordClicked(word: QuranWord) {
      this.qService.request_query_search(word.imlaai);
   }

   onRootClicked(root: QuranRoot) {
      this.qService.request_root_search(root.text);
   }

   number_en_to_ar(num: number): string {
      return StringUtils.number_en_to_ar(num);
   }

   panelChanged() {
      this.sizeChanged.emit();
   }
}
