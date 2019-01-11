import { Component, Input, OnInit, ChangeDetectorRef, Output, EventEmitter, NgZone } from '@angular/core';
import { SearchResult } from '../../../quran/quran-search/search-result';
import { QuranService } from '../../../services/quran.service';
import { QuranWord, Category, Ayah } from '../../../quran/quran';
import * as StringUtils from '../../../quran/utils/string-utils';
import { Router } from '@angular/router';
import { NavService } from '../../../services/nav-service.service';


@Component({
   selector: 'qsearch-result',
   templateUrl: './search-result.component.html',
   styleUrls: ['./search-result.component.css'],
   host: {
      '[id]': 'result.ayah.id'
   }
})
export class SearchResultComponent implements OnInit {

   @Input()
   result: SearchResult;
   
   constructor(
      private router: Router,
      private qService: QuranService,
      private navService: NavService
      ) {
   }

   ngOnInit() {
   }
   
   should_highlight(index: number): boolean {
      return this.result.word_indices.indexOf(index) != -1;
   }
   
   onAyahClicked() {
      this.navService.open_ayah(this.result.ayah.id);
   }

   number_en_to_ar(num: number): string {
      return StringUtils.number_en_to_ar(num);
   }

   OnNavAyahLink(ayah: Ayah) {
      this.navService.open_ayah_and_copy_link(ayah.id);
   }
}
