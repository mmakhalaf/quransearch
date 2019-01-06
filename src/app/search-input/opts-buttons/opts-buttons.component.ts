import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { QuranService } from 'src/app/services/quran.service';

@Component({
   selector: 'qinput-opts-buttons',
   templateUrl: './opts-buttons.component.html',
   styleUrls: ['./opts-buttons.component.css']
})
export class OptsButtonsComponent {
   
   @Output()
   onOpenGlobOpts = new EventEmitter<void>();

   @Output()
   onOpenFilters = new EventEmitter<void>();

   constructor(public qService: QuranService) {

   }

   onOpenGlobOptsClicked() {
      this.onOpenGlobOpts.emit();
   }

   onOpenFiltersClicked() {
      this.onOpenFilters.emit();
   }

}
