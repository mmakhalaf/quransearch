import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { QuranService } from '../services/quran.service';
import { ControlsResService } from '../services/controlres.service';

@Component({
   selector: 'qsearch-controls',
   templateUrl: './search-controls.component.html',
   styleUrls: ['./search-controls.component.css']
})
export class SearchControlsComponent implements OnInit, OnDestroy {

   show_toolbar = true;
   show_term_opts = false;
   show_global_opts = false;
   show_filter_list = false;
   show_up_arrow = false;
   
   constructor(
      public qService: QuranService, 
      private constrolService: ControlsResService, 
      public change_det: ChangeDetectorRef) {
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

   onOpenGlobOptsClicked() {
      this.show_global_opts = !this.show_global_opts;
   }

   onOpenTermOptsClicked() {
      this.show_term_opts = !this.show_term_opts;
   }

   onOpenFiltersClicked() {
      this.show_filter_list = !this.show_filter_list;
   }
   
   onScrollUpwardsClicked() {
      this.constrolService.request_scroll_to_top();
   }

}
