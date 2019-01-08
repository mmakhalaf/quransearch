import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { QuranService } from '../services/quran.service';
import { ControlsResService } from '../services/controlres.service';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
   selector: 'qsearch-controls',
   templateUrl: './search-controls.component.html',
   styleUrls: ['./search-controls.component.css']
})
export class SearchControlsComponent implements OnInit, OnDestroy {

   show_toolbar = true;
   show_up_arrow = false;

   show_opts_one_at_time = true;
   show_term_opts = false;
   show_global_opts = false;
   show_filter_list = false;
   
   constructor(
      public qService: QuranService, 
      private constrolService: ControlsResService, 
      change_det: ChangeDetectorRef,
      breakpointObserver: BreakpointObserver
      ) {
      breakpointObserver.observe([
         Breakpoints.Handset
      ]).subscribe((result: BreakpointState) => {
         if (result.matches) {
            this.show_opts_one_at_time = true;
         } else {
            this.show_opts_one_at_time = false;
         }
         this.update_options_layout();
      });
   }
   
   ngOnInit() {
      this.constrolService.onScroll.set(this, (dir, at_top) => { this.onScroll(dir, at_top); });

   }

   ngOnDestroy() {
      this.constrolService.onScroll.delete(this);
   }

   /// Events

   onScroll = (dir: number, at_top: boolean) => {
      if (at_top) {
         this.show_toolbar = true;
         this.show_up_arrow = false;
      } else {
         this.show_up_arrow = true;
         this.show_toolbar = false;
         this.show_term_opts = false;
         this.show_global_opts = false;
         this.show_filter_list = false;
      }
   }

   onOpenTermOptsClicked() {
      this.show_term_opts = !this.show_term_opts;
      if (this.show_term_opts && this.show_opts_one_at_time) {
         this.show_global_opts = false;
         this.show_filter_list = false;
      }
   }

   onOpenGlobOptsClicked() {
      this.show_global_opts = !this.show_global_opts;
      if (this.show_global_opts && this.show_opts_one_at_time) {
         this.show_term_opts = false;
         this.show_filter_list = false;
      }
   }

   onOpenFiltersClicked() {
      this.show_filter_list = !this.show_filter_list;
      if (this.show_filter_list && this.show_opts_one_at_time) {
         this.show_global_opts = false;
         this.show_term_opts = false;
      }
   }
   
   onScrollUpwardsClicked() {
      this.constrolService.request_scroll_to_top();
   }

   update_options_layout() {
      if (this.show_opts_one_at_time) {
         // Determine which one to keep
         let arr = [
            { flag: this.show_term_opts, fn: () => { this.onOpenTermOptsClicked(); } },
            { flag: this.show_global_opts, fn: () => { this.onOpenGlobOptsClicked(); } }, 
            { flag: this.show_filter_list, fn: () => { this.onOpenFiltersClicked(); } }
         ];
         arr = arr.filter(val => val.flag == true);
         if (arr.length > 1) {
            console.log(`${arr.length} Shown`);
            for (let i = 1; i < arr.length; ++i) {
               arr[i].fn();
            }
         }
      }
   }
}
