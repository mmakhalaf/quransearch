import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { QuranService } from '../../../services/quran.service';
import { InputFieldComponent } from './input-field/input-field.component';
import { TypeSelectComponent } from './type-select/type-select.component';
import { OptsButtonsComponent } from './opts-buttons/opts-buttons.component';

export enum DisplayMode {
   SingleLine,
   MultiLine
}

@Component({
   selector: 'qsearch-input',
   templateUrl: './search-input.component.html',
   styleUrls: ['./search-input.component.css'],
   imports: [CommonModule, InputFieldComponent, TypeSelectComponent, OptsButtonsComponent]
})
export class SearchInputComponent {

   @Output()
   onOpenTermOpts = new EventEmitter<void>();

   @Output()
   onOpenGlobOpts = new EventEmitter<void>();

   @Output()
   onOpenFilters = new EventEmitter<void>();

   DisplayMode = DisplayMode;
   displayMode = DisplayMode.SingleLine;

   qService = inject(QuranService);

   constructor() {
      const breakpointObserver = inject(BreakpointObserver);
      breakpointObserver.observe([
         Breakpoints.HandsetPortrait,
         Breakpoints.XSmall
      ]).subscribe((result: BreakpointState) => {
         if (result.matches) {
            this.make_multi_line();
         } else {
            this.make_single_line();
         }
      });
   }

   ///
   /// Functions

   private make_single_line() {
      this.displayMode = DisplayMode.SingleLine;
   }

   private make_multi_line() {
      this.displayMode = DisplayMode.MultiLine;
   }
}
