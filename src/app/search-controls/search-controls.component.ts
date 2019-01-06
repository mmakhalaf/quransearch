import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { QuranService } from '../services/quran.service';
import { ControlsResService } from '../services/controlres.service';

@Component({
   selector: 'qsearch-controls',
   templateUrl: './search-controls.component.html',
   styleUrls: ['./search-controls.component.css']
})
export class SearchControlsComponent implements OnInit, OnDestroy {

   show_filter_list = false;
   show_extra_opts = false;
   show_toolbar = true;
   show_up_arrow = false;
   
   constructor(
      public qService: QuranService, 
      private constrolService: ControlsResService, 
      public change_det: ChangeDetectorRef) {
   }
   
   ngOnInit() {
      this.qService.searchCriteriaPres.onFiltersUpdated.set(this, () => { this.on_filters_updated(); });
      this.constrolService.onScroll.set(this, (dir, at_top) => { this.onScroll(dir, at_top); });

   }

   ngOnDestroy() {
      this.qService.searchCriteriaPres.onFiltersUpdated.delete(this);
      this.qService.onQuranLoaded.delete(this);
      this.constrolService.onScroll.delete(this);
   }

   /// Callbacks

   private on_filters_updated() {
      this.qService.request_search(this.qService.searchCriteriaPres);
   }

   /// Events

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

   onOpenSettingsClicked() {
      this.show_extra_opts = !this.show_extra_opts;
   }

   onOpenFiltersClicked() {
      this.show_filter_list = !this.show_filter_list;
   }
   
   onScrollUpwardsClicked() {
      this.constrolService.request_scroll_to_top();
   }

}
