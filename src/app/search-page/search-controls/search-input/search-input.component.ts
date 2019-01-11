import { Component, EventEmitter, Output } from '@angular/core';
import { QuranService } from '../../../services/quran.service';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

export enum DisplayMode {
   SingleLine,
   MultiLine
}

@Component({
   selector: 'qsearch-input',
   templateUrl: './search-input.component.html',
   styleUrls: ['./search-input.component.css']
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
   
   constructor(public qService: QuranService, breakpointObserver: BreakpointObserver) {
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
