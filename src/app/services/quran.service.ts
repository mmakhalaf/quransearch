import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Quran, QuranRoot, Category } from '../quran/quran';
import { SearchResults } from '../quran/quran-search/search-result';
import { FilterGroupPres } from './filter-pres';
import { QuranDataService } from './quran-data.service';
import { SearchService } from './search.service';

/**
 * Thin facade over QuranDataService (loading) and SearchService (search/state)
 * plus copy-to-clipboard side effects. Keeps a single stable injection point for
 * components while the responsibilities live in the focused services.
 */
@Injectable({
   providedIn: 'root'
})
export class QuranService {

   private data = inject(QuranDataService);
   private search = inject(SearchService);
   private clipboard = inject(Clipboard);
   private snackBar = inject(MatSnackBar);

   get quran(): Quran { return this.data.quran; }
   get isOpPending(): boolean { return this.data.isOpPending; }
   get quranLoaded$(): Observable<Quran> { return this.data.quranLoaded$; }

   get matches(): SearchResults { return this.search.matches; }
   get searchCriteriaPres(): FilterGroupPres { return this.search.searchCriteriaPres; }
   get searchCompleted$(): Observable<SearchResults> { return this.search.searchCompleted$; }

   request_search_with_word_filter(word: string, reset: boolean) {
      this.search.request_search_with_word_filter(word, reset);
   }

   request_search_with_root_filter(root: QuranRoot, reset: boolean) {
      this.search.request_search_with_root_filter(root, reset);
   }

   request_search_with_cat_filter(cat: Category, reset: boolean) {
      this.search.request_search_with_cat_filter(cat, reset);
   }

   perform_search(crit: FilterGroupPres) {
      this.search.perform_search(crit);
   }

   copy_text(txt: string, message: string) {
      this.clipboard.copy(txt);
      this.snackBar.open(message, 'أغلق', {
         duration: 2000,
         direction: 'rtl'
      });
   }
}
