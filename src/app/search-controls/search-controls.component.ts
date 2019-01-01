import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { QuranService } from '../services/quran.service';
import { ControlsResService } from '../services/controlres.service';
import { SearchInputStateMatcher } from '../services/filter-pres';
import { FormControl, Validators } from '@angular/forms';
import { Quran } from '../quran/quran';

let timer: any = 0;
const debounce = (() => {
   return (cb, ms) => {
      clearTimeout(timer);
      timer = setTimeout(cb, ms);
   };
})();

@Component({
   selector: 'qsearch-controls',
   templateUrl: './search-controls.component.html',
   styleUrls: ['./search-controls.component.css']
})
export class SearchControlsComponent implements OnInit, OnDestroy, AfterViewInit {

   searchFormControl = new FormControl('', [
      Validators.required
   ]);

   matcher = new SearchInputStateMatcher();
   
   show_filter_list = false;
   show_extra_opts = false;
   show_toolbar = true;
   show_up_arrow = false;

   prevScrollPos = 0;

   filters = [
      'كلمتان', 
      'خفيفتان', 
      'على',
      'اللسان'
   ];

   constructor(public qService: QuranService, private constrolService: ControlsResService) {
      this.matcher.filter_group = this.qService.searchCriteriaPres;
   }
   
   ngOnInit() {
      this.qService.searchCriteriaPres.onFiltersUpdated.set(this, this.on_criteria_updated);
      this.qService.onQuranLoaded.set(this, this.on_quran_loaded);
      this.constrolService.onScroll.set(this, this.onScroll);
   }

   ngOnDestroy() {
      this.qService.searchCriteriaPres.onFiltersUpdated.delete(this);
      this.qService.onQuranLoaded.delete(this);
      this.constrolService.onScroll.delete(this);
   }

   ngAfterViewInit() {
   }


   /// Callbacks

   on_quran_loaded = (q: Quran) => {
      this.matcher.quran = q;
   }

   on_criteria_updated = () => {
      this.searchFormControl.setValue(this.qService.searchCriteriaPres.cur_filter.cur_search_term);
   }

   /// Events

   onKeyUp() {
      debounce(() => {
         this.onSearch();
      }, 500);
   }

   onSearch() {
      this.qService.searchCriteriaPres.cur_filter.cur_search_term = this.searchFormControl.value;
      this.qService.request_search(this.qService.searchCriteriaPres);
   }

   onScroll = (dir: number, at_top: boolean) => {
      if (at_top) {
         this.show_toolbar = true;
         this.show_up_arrow = false;
      } else {
         this.show_toolbar = false;
         this.show_up_arrow = true;
         this.show_extra_opts = false;
         this.show_filter_list = false;
      }
   }

   onFilterNewClicked() {
      console.log('TODO: Add the current search as a filter and clear the field');
   }

   onRemoveFilterClicked(filter: string): void {
      console.log('TODO: Remove filter.');
   }
   
   onScrollUpwardsClicked() {
      this.constrolService.request_scroll_to_top();
   }

   onOpenSettingsClicked() {
      this.show_extra_opts = !this.show_extra_opts;
   }

   onOpenFiltersClicked() {
      this.show_filter_list = !this.show_filter_list;
   }

   onTermTypeChanged() {
      this.qService.searchCriteriaPres.filter_updated();
      this.onSearch();
   }

   onWordOrderChanged() {
      this.qService.searchCriteriaPres.filter_updated();
      this.onSearch();
   }

   onMatchTypeChanged() {
      this.qService.searchCriteriaPres.filter_updated();
      this.onSearch();
   }

   onSortOrderChanged() {
      this.qService.searchCriteriaPres.filter_updated();
      this.onSearch();
   }

   private valid_input() {

   }
}
