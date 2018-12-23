import { Component, OnInit, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Quran, Ayah } from './quran/quran';
import { QuranSearch, SearchResult } from './quran/quran-search';

// Consts
@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

   quran = new Quran();
   show_more_btn = false;
   subject = new Subject<string>();
   
   all_matches = new Array<SearchResult>();
   disp_matches = new Array<SearchResult>();
   searchVal = '';

   constructor() {
      
   }

   ngOnInit() {
      this.subject.pipe(debounceTime(500)).subscribe(searchVal => {
         this.onSearch(searchVal);
      });
   }

   /// Events
   onKeyUp(searchTextValue: string){
      this.searchVal = searchTextValue;
      this.subject.next(searchTextValue);
   }

   onSearch(searchTextValue: string) {
      this.clear_matches();
      this.searchVal = searchTextValue;
      if (this.searchVal.length < 2)
         return;
      
      let searcher = new QuranSearch(this.quran);
      this.all_matches = searcher.search_by_word(this.searchVal);
      this.disp_matches = this.init_num_results();
      this.show_more_btn = this.can_show_more();
   }

   onMoreClicked() {
      this.disp_matches = this.inc_num_results();
      this.show_more_btn = this.can_show_more();
   }
   
   /// DOM & Search

   can_show_more(): boolean {
      return this.all_matches.length != 0 && this.disp_matches.length < this.all_matches.length;
   }

   init_num_results(): any {
      let s = Math.min(this.all_matches.length, 50);
      return this.all_matches.slice(0, s);
   }

   inc_num_results(): any {
      let s = Math.min(this.all_matches.length, this.disp_matches != null ? this.disp_matches.length + 50 : 50);
      return this.all_matches.slice(0, s);
   }

   clear_matches() {
      this.all_matches = new Array<SearchResult>();
      this.disp_matches = new Array<SearchResult>();
   }
}
