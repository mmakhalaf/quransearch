import { ErrorStateMatcher } from '@angular/material/core';
import { UntypedFormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Quran } from '../quran/quran';
import { FilterGroupPres } from './filter-pres';

// Angular-Material specific error state for the search input. Kept separate from
// filter-pres.ts so that module stays framework-free and can be imported by the
// search Web Worker.
export class SearchInputStateMatcher implements ErrorStateMatcher {
   filter_group!: FilterGroupPres;
   quran: Quran | null = null;

   isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      if (this.filter_group.cur_filter == null) {
         console.error('Null Filter');
         return false;
      } else if (this.quran == null) {
         return false;
      } else {
         let err = this.filter_group.cur_filter.validate(this.quran);
         if (err.length == 0) {
            return false;
         } else {
            control?.setErrors({ err: err });
            return true;
         }
      }
   }
}
