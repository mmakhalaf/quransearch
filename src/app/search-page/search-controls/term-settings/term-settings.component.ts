import { Component, OnInit, OnDestroy } from '@angular/core';
import { QuranService } from '../../../services/quran.service';
import { opts_ayah_order, opts_ayah_loc } from 'src/app/services/filter-pres';
import { FormControl } from '@angular/forms';
import { Platform } from '@angular/cdk/platform';
import { MatSlideToggleChange } from '@angular/material';

@Component({
   selector: 'qterm-settings',
   templateUrl: './term-settings.component.html',
   styleUrls: ['./term-settings.component.css'],
   host: {
      'style': 'display: flex; direction: rtl;'
   }
})
export class TermSettingsComponent implements OnInit, OnDestroy {
   
   show_native = false;

   pos = new FormControl();
   vf = new FormControl();

   constructor(
      platform: Platform, 
      public qService: QuranService
      ) {
      if (platform.ANDROID || platform.IOS) {
         this.show_native = true;
      } else {
         this.show_native = false;
      }
   }

   ngOnInit() {
      this.qService.searchCriteriaPres.onFiltersUpdated.set(this, () => { this.on_filters_updated(); });
      this.pos.valueChanges.subscribe((e: any) => {
         this.onPOSChanged(e);
      });
      this.vf.valueChanges.subscribe((e: any) => {
         this.onVFChanged(e);
      });
      
      this.on_filters_updated();
   }

   ngOnDestroy() {
      this.qService.searchCriteriaPres.onFiltersUpdated.delete(this);
   }

   onPOSChanged(e: Array<string>) {
      let idx = e.indexOf("any");
      if (idx != -1 && e.length > 1) {
         // We have 'any' with other options, so decide whether we want
         // just 'any' or the other 'options' before proceeding.
         let had_any = this.qService.searchCriteriaPres.cur_filter.cur_part_of_speech.indexOf("any") != -1;
         if (had_any) {
            // IF we had 'any', we want to now remove it because a new option was added.
            e.splice(idx, 1);
         } else {
            // IF we didn't, then we remove everything else because that was added
            e = [ "any" ];
         }
         this.pos.setValue(e);
         return;
      } else if (e.length == 0) {
         e = [ "any" ];
         this.pos.setValue(e);
         return;
      }
      this.qService.searchCriteriaPres.cur_filter.cur_part_of_speech = e;
      this.qService.searchCriteriaPres.filter_updated();
   }

   onVFChanged(e: Array<number>) {
      let idx = e.indexOf(0);
      if (idx != -1 && e.length > 1) {
         // We have 'any' with other options, so decide whether we want
         // just 'any' or the other 'options' before proceeding.
         let had_any = this.qService.searchCriteriaPres.cur_filter.cur_verb_form.indexOf(0) != -1;
         if (had_any) {
            // IF we had 'any', we want to now remove it because a new option was added.
            e.splice(idx, 1);
         } else {
            // IF we didn't, then we remove everything else because that was added
            e = [ 0 ];
         }
         this.vf.setValue(e);
         return;
      } else if (e.length == 0) {
         e = [ 0 ];
         this.vf.setValue(e);
         return;
      }

      this.qService.searchCriteriaPres.cur_filter.cur_verb_form = e;
      this.qService.searchCriteriaPres.filter_updated();
   }

   onWordOrderChanged() {
      this.qService.searchCriteriaPres.filter_updated();
   }

   onMatchTypeChanged() {
      this.qService.searchCriteriaPres.filter_updated();
   }

   onTashkeelOptChanged(e: MatSlideToggleChange) {
      this.qService.searchCriteriaPres.cur_filter.cur_with_tashkeel = e.checked;
      this.qService.searchCriteriaPres.filter_updated();
   }

   on_filters_updated() {
      this.pos.setValue(this.qService.searchCriteriaPres.cur_filter.cur_part_of_speech, { emitEvent: false });
      this.vf.setValue(this.qService.searchCriteriaPres.cur_filter.cur_verb_form, { emitEvent: false });
   }

   opts_ayah_order(): Array<any> {
      return opts_ayah_order;
   }

   opts_ayah_loc(): Array<any> {
      return opts_ayah_loc;
   }
}
