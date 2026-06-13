import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { QuranService } from '../../../services/quran.service';
import { ControlsResService } from '../../../services/controlres.service';
import { SearchInputComponent } from '../search-input/search-input.component';
import { TermSettingsComponent } from '../term-settings/term-settings.component';
import { SearchSettingsComponent } from '../search-settings/search-settings.component';
import { FiltersListComponent } from '../filters-list/filters-list.component';

@Component({
   selector: 'qsearch-controls',
   templateUrl: './search-controls.component.html',
   styleUrls: ['./search-controls.component.css'],
   imports: [
      CommonModule,
      MatProgressBarModule,
      MatIconModule,
      MatButtonModule,
      SearchInputComponent,
      TermSettingsComponent,
      SearchSettingsComponent,
      FiltersListComponent
   ]
})
export class SearchControlsComponent implements OnInit, OnDestroy {

   show_toolbar = true;
   show_up_arrow = false;

   show_opts_one_at_time = true;
   show_term_opts = false;
   show_global_opts = false;
   show_filter_list = false;

   qService = inject(QuranService);
   private constrolService = inject(ControlsResService);
   private bottomSheet = inject(MatBottomSheet);

   constructor() {
      const breakpointObserver = inject(BreakpointObserver);
      breakpointObserver.observe([
         Breakpoints.Handset,
         Breakpoints.XSmall
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
      }
   }

   onOpenTermOptsClicked() {
      if (!this.qService.searchCriteriaPres.cur_filter.show_settings()) {
         return;
      }

      if (this.show_opts_one_at_time) {
         this.bottomSheet.open(TermSettingsComponent);
      } else {
         this.show_term_opts = !this.show_term_opts;
      }
   }

   onOpenGlobOptsClicked() {
      if (this.show_opts_one_at_time) {
         this.bottomSheet.open(SearchSettingsComponent);
      } else {
         this.show_global_opts = !this.show_global_opts;
      }
   }

   onOpenFiltersClicked() {
      if (!this.qService.searchCriteriaPres.show_filters()) {
         return;
      }

      if (this.show_opts_one_at_time) {
         this.bottomSheet.open(FiltersListComponent);
      } else {
         this.show_filter_list = !this.show_filter_list;
      }
   }

   onScrollUpwardsClicked() {
      this.constrolService.request_scroll_to_top();
   }

   update_options_layout() {
      if (this.show_opts_one_at_time) {
         this.show_term_opts = false;
         this.show_global_opts = false;
         this.show_filter_list = false;
      } else {
         this.bottomSheet.dismiss();
      }
   }
}
