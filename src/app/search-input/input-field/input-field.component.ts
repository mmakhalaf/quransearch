import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { QuranService } from 'src/app/services/quran.service';
import { SearchInputStateMatcher, extract_term_strings } from 'src/app/services/filter-pres';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { Quran } from 'src/app/quran/quran';

let timer: any = 0;
const debounce = (() => {
   return (cb, ms) => {
      clearTimeout(timer);
      timer = setTimeout(cb, ms);
   };
})();

@Component({
   selector: 'qinput-input-field',
   templateUrl: './input-field.component.html',
   styleUrls: ['./input-field.component.css']
})
export class InputFieldComponent implements OnInit, OnDestroy {

   searchFormControl = new FormControl('', [
      Validators.required
   ]);

   matcher = new SearchInputStateMatcher();

   autocomp_foptions: Observable<Array<string>>;
   autocomp_options = new Array<string>();
   autocomp_roots = new Array<string>();
   autocomp_categories = new Array<string>();
   autocomp_suwar = new Array<string>();
   autocomp_type = '';

   update_input = true;
   prev_value = '';

   @Output()
   onOpenTermOpts = new EventEmitter<void>();

   constructor(public qService: QuranService) {
      this.matcher.filter_group = this.qService.searchCriteriaPres;
   }

   ngOnInit() {
      this.autocomp_foptions = this.searchFormControl.valueChanges.pipe(
         startWith(''),
         map(value => this._filter(value)),
      );

      this.searchFormControl.valueChanges.subscribe((e: any) => {
         this.onInputChanged(e);
      });

      this.qService.searchCriteriaPres.onFiltersUpdated.set(this, () => { this.on_criteria_updated(); });
      this.qService.onQuranLoaded.set(this, (q: Quran) => { this.on_quran_loaded(q); });

      this.on_quran_loaded(this.qService.quran);
      this.on_criteria_updated();
   }

   ngOnDestroy() {
      this.qService.searchCriteriaPres.onFiltersUpdated.delete(this);
      this.qService.onQuranLoaded.delete(this);
   }

   ///
   /// Events

   onInputChanged(val: string) {
      debounce(() => {
         this.perform_search();
      }, 500);
   }

   onAutoCompOptSelected(e: MatAutocompleteSelectedEvent) {
      if (this.prev_value.length == 0) {
         this.prev_value = e.option.value;
         return;
      }

      let arr = extract_term_strings(this.prev_value, this.qService.searchCriteriaPres.cur_filter.cur_term_type);
      arr = arr.filter(s => s.length != 0);
      if (arr.length == 0) {
         arr.push(e.option.value);
      } else {
         if (arr[arr.length - 1] != e.option.value) {
            arr.push(e.option.value);
         }
      }

      this.prev_value = arr.join(' ، ');
      this.searchFormControl.setValue(this.prev_value);
   }

   onClearCurrentClicked(e: MouseEvent) {
      e.stopPropagation();
      this.qService.searchCriteriaPres.cur_filter.cur_search_term = '';
      this.qService.searchCriteriaPres.filter_updated();
   }

   onOpenTermOptsClicked(e: MouseEvent) {
      e.stopPropagation();
      this.onOpenTermOpts.emit();
   }

   onFilterNewClicked(e: MouseEvent) {
      e.stopPropagation();
      this.qService.searchCriteriaPres.add_current_filter(this.qService.quran);
   }

   disableNewFilterClick(): boolean {
      return !this.qService.searchCriteriaPres.cur_filter.is_valid(this.qService.quran);
   }

   ///
   /// Callbacks

   private on_criteria_updated() {
      this.prev_value = this.input_value_from_current_search();
      this._update_filters();
      if (this.update_input) {
         this.searchFormControl.setValue(
            this.qService.searchCriteriaPres.cur_filter.cur_search_term, {
               emitEvent: false
            });
      }
      this.update_input = true;
   }

   private on_quran_loaded(q: Quran) {
      if (q == null) {
         return;
      }
      this.matcher.quran = q;
      this.autocomp_roots = this.qService.quran.word_store.get_roots_as_sorted_strings();
      this.autocomp_categories = this.qService.quran.get_categories_as_sorted_strings();
      this.autocomp_suwar = this.qService.quran.get_suwar_strings();
      this._update_filters();
   }

   //
   /// Functions

   private perform_search() {
      this.qService.searchCriteriaPres.cur_filter.cur_search_term = this.searchFormControl.value;
      this.prev_value = this.input_value_from_current_search();
      this.qService.searchCriteriaPres.cur_filter.cur_search_term = this.prev_value;
      this.update_input = false;
      this.qService.searchCriteriaPres.filter_updated();
   }

   private _filter(value: string): string[] {
      let vals = extract_term_strings(value, this.qService.searchCriteriaPres.cur_filter.cur_term_type);
      if (vals.length == 0) {
         return this.autocomp_options;
      } else {
         return this.autocomp_options.filter(option => option.toLowerCase().includes(vals[vals.length - 1]));
      }
   }

   private _update_filters() {
      if (this.qService.quran == null) {
         return;
      }

      if (this.qService.searchCriteriaPres.cur_filter.cur_term_type == this.autocomp_type) {
         return;
      }

      this.autocomp_type = this.qService.searchCriteriaPres.cur_filter.cur_term_type;
      switch (this.autocomp_type) {
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
         case "surah": {
            this.autocomp_options = this.autocomp_suwar;
            break;
         }
         default: {
            console.error('Unsupported term type');
            break;
         }
      }
   }

   private input_value_from_current_search(): string {
      let arr = extract_term_strings(
         this.qService.searchCriteriaPres.cur_filter.cur_search_term,
         this.qService.searchCriteriaPres.cur_filter.cur_term_type
      );
      arr = arr.filter(s => s.length != 0);
      return arr.join(' ، ');
   }

}
