import { Component, OnInit, OnDestroy, ViewChild, HostListener, Input, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { QuranService } from '../services/quran.service';
import { MatExpansionPanel } from '@angular/material';
import { ControlsResService } from '../services/controlres.service';
import { trigger, transition, style, animate } from '@angular/animations';

let $: any;

@Component({
   selector: 'qsearch-controls',
   templateUrl: './search-controls.component.html',
   styleUrls: ['./search-controls.component.css'],
   animations: [
      trigger('slideInOut', [
         transition(':enter', [
            style({ transform: 'translateY(-100%)' }),
            animate('200ms ease-in', style({ transform: 'translateY(0%)' }))
         ]),
         transition(':leave', [
            animate('200ms ease-in', style({ transform: 'translateY(-100%)' }))
         ])
      ])
   ]
})
export class SearchControlsComponent implements OnInit, OnDestroy, AfterViewInit {

   subject = new Subject<string>();
   searchVal = '';

   show_filter_list = false;
   show_extra_opts = false;
   show_toolbar = true;

   prevScrollPos = 0;

   filters = [
      'كلمتان', 
      'خفيفتان', 
      'على',
      'اللسان'
   ];

   constructor(public qService: QuranService, private constrolService: ControlsResService) {
   }

   ngOnInit() {
      this.qService.onSearchValUpdated.set(this, this.on_search_val_updated);
      this.constrolService.onScroll.set(this, this.onScroll);
      this.subject.pipe(debounceTime(500)).subscribe(() => {
         this.onSearch();
      });
   }

   ngOnDestroy() {
      this.qService.onSearchValUpdated.delete(this);
      this.constrolService.onScroll.delete(this);
   }

   ngAfterViewInit() {
   }


   /// Callbacks

   on_search_val_updated = (searchVal: string) => {
      if (this.searchVal !== searchVal) {
         this.searchVal = searchVal;
      }
   }

   /// Events

   onKeyUp() {
      this.subject.next();
   }

   onSearch() {
      this.qService.request_query_search(this.searchVal);
   }

   onScroll = (dir: number) => {
      if (dir < 0) {
         this.show_toolbar = false;
         this.show_extra_opts = false;
         this.show_filter_list = false;
      } else {
         this.show_toolbar = true;
      }
   }

   onRemoveFilterClicked(filter: string): void {
      console.log('TODO: Remove filter.');
   }

   onFilterNewClicked() {
      console.log('TODO: Add the current search as a filter and clear the field');
   }

   onScrollUpwardsClicked() {
      this.constrolService.request_scroll_to_top();
   }

   extraOptsExpanded() {
      this.show_extra_opts = true;
   }
   extraOptsCollapsed() {
      this.show_extra_opts = false;
   }

   onOpenSettingsClicked() {
      this.show_extra_opts = !this.show_extra_opts;
   }

   filtersExpanded() {
      this.show_filter_list = true;
   }

   filtersCollapsed() {
      this.show_filter_list = false;
   }

   onOpenFiltersClicked() {
      this.show_filter_list = !this.show_filter_list;
   }
}
