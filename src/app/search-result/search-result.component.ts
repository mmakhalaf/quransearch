import { Component, Input, AfterViewInit, OnInit } from '@angular/core';
import { SearchResult } from '../quran/search-result';
import { QuranService } from '../services/quran.service';
import { QuranRoot, QuranWord, Ayah } from '../quran/quran';

@Component({
   selector: 'qsearch-result',
   templateUrl: './search-result.component.html',
   styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {

   @Input()
   result: SearchResult;

   show_roots = false;
   show_related = false;

   roots = new Array<QuranRoot>();
   highlighted_words = new Array<QuranWord>();
   related_ayat = new Array<Ayah>();

   constructor(private qService: QuranService) {

   }

   ngOnInit() {
      this.result.word_indices.forEach((val: number, k: number) => {
         let w = this.result.ayah.words[val];
         this.highlighted_words.push(w);
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
      
      this.result.ayah.for_each_related_ayah((ayah: Ayah) => {
         this.related_ayat.push(ayah);
      });
   }

   should_highlight(w: QuranWord): boolean {
      return this.highlighted_words.indexOf(w) != -1;
   }
   
   onShowRootsClicked() {
      this.show_roots = !this.show_roots;
   }

   onShowRelatedClicked() {
      this.show_related = !this.show_related
   }

   onWordClicked(word: QuranWord) {
      this.qService.request_query_search(word.imlaai);
   }

   onRootClicked(root: QuranRoot) {
      this.qService.request_root_search(root.text);
   }

   onCopyAyahClicked() {
      let selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = this.result.ayah.uthmani;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);
   }
   
}
