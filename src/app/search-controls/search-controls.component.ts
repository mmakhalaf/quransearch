import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { QuranService } from '../services/quran.service';
import { ControlsResService } from '../services/controlres.service';
import { SearchInputStateMatcher, FilterPres } from '../services/filter-pres';
import { FormControl, Validators } from '@angular/forms';
import { Quran } from '../quran/quran';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import * as HttpUtils from '../quran/utils/http-utils';

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
   styleUrls: ['./search-controls.component.css'],
   providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
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

   autocomp_foptions: Observable<Array<string>>;
   autocomp_options = new Array<string>();
   autocomp_roots = new Array<string>();
   autocomp_categories = new Array<string>();
   autocomp_type = '';

   constructor(
      public qService: QuranService, 
      private constrolService: ControlsResService, 
      public change_det: ChangeDetectorRef,
      private location: Location) {
      this.matcher.filter_group = this.qService.searchCriteriaPres;
   }
   
   ngOnInit() {
      this.qService.searchCriteriaPres.onFiltersUpdated.set(this, this.on_criteria_updated);
      this.qService.onQuranLoaded.set(this, this.on_quran_loaded);
      this.constrolService.onScroll.set(this, this.onScroll);

      this.autocomp_foptions = this.searchFormControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value)),
            );
      this.searchFormControl.valueChanges.subscribe(() => {
         this.onKeyUp();
      });
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
      this.autocomp_roots = this.qService.quran.word_store.get_roots_as_sorted_strings();
      this.autocomp_categories = this.qService.quran.get_categories_as_sorted_strings();
      this._update_filters();
   }

   on_criteria_updated = () => {
      this._update_filters();
      this.searchFormControl.setValue(this.qService.searchCriteriaPres.cur_filter.cur_search_term);
      this.onSearch();
   }

   private _filter(value: string): string[] {
      const filterValue = value.toLowerCase();
      return this.autocomp_options.filter(option => option.toLowerCase().includes(filterValue));
   }

   private _update_filters() {
      if (this.qService.quran == null) {
         return;
      }

      if (this.qService.searchCriteriaPres.cur_filter.cur_term_type == this.autocomp_type) {
         return;
      }

      this.autocomp_type = this.qService.searchCriteriaPres.cur_filter.cur_term_type;
      switch (this.qService.searchCriteriaPres.cur_filter.cur_term_type) {
         case "word": {
            this.autocomp_options = [];
            break;
         }
         case "root": {
            this.autocomp_options = this.autocomp_roots;
            break;
         }
         case "category": {
            this.autocomp_options = this.autocomp_categories;
            break;
         }
      }
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

   disableNewFilterClick(): boolean {
      return !this.qService.searchCriteriaPres.cur_filter.is_valid(this.qService.quran);
   }

   onFilterNewClicked() {
      this.qService.searchCriteriaPres.add_current_filter(this.qService.quran);
   }

   onOpenSettingsClicked() {
      this.show_extra_opts = !this.show_extra_opts;
   }

   onClearCurrentClicked() {
      this.qService.searchCriteriaPres.cur_filter.cur_search_term = '';
      this.qService.searchCriteriaPres.filter_updated();
   }
   
   onSelectFilterClicked(filter: FilterPres) {
      console.log(`selection changed`);
      this.qService.searchCriteriaPres.make_current(filter, this.qService.quran);
   }

   onRemoveFilterClicked(filter: FilterPres): void {
      console.log(`selection removed`);
      this.qService.searchCriteriaPres.remove_filter(filter);
      this.change_det.detectChanges();
   }
   
   onScrollUpwardsClicked() {
      this.constrolService.request_scroll_to_top();
   }

   onOpenFiltersClicked() {
      this.show_filter_list = !this.show_filter_list;
   }

   onCopyFiltersClicked(): string {
      return `${location.href}${this.location.path()}?${HttpUtils.params_to_string(this.qService.searchCriteriaPres.to_params(this.qService.quran))}`;
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
}
