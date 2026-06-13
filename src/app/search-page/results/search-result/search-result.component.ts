import { Component, Input, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SearchResult } from '../../../quran/quran-search/search-result';
import { Ayah } from '../../../quran/quran';
import * as StringUtils from '../../../quran/utils/string-utils';
import { NavService } from '../../../services/nav-service.service';


@Component({
   selector: 'qsearch-result',
   templateUrl: './search-result.component.html',
   styleUrls: ['./search-result.component.css'],
   changeDetection: ChangeDetectionStrategy.OnPush,
   host: {
      '[id]': 'result.ayah.id'
   },
   imports: [CommonModule, MatButtonModule, MatIconModule]
})
export class SearchResultComponent implements OnInit {

   @Input()
   result!: SearchResult;

   private highlight_set = new Set<number>();

   private navService = inject(NavService);

   ngOnInit() {
      // Pre-compute the matched word indices once so highlighting is O(1) per
      // word rather than scanning the array on every check.
      this.highlight_set = new Set<number>(this.result.word_indices);
   }

   should_highlight(index: number): boolean {
      return this.highlight_set.has(index);
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
