import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { QuranService } from '../../../../services/quran.service';

@Component({
   selector: 'qinput-opts-buttons',
   templateUrl: './opts-buttons.component.html',
   styleUrls: ['./opts-buttons.component.css'],
   imports: [CommonModule, MatButtonModule, MatIconModule, MatBadgeModule]
})
export class OptsButtonsComponent {

   @Output()
   onOpenGlobOpts = new EventEmitter<void>();

   @Output()
   onOpenFilters = new EventEmitter<void>();

   qService = inject(QuranService);

   onOpenGlobOptsClicked() {
      this.onOpenGlobOpts.emit();
   }

   onOpenFiltersClicked() {
      this.onOpenFilters.emit();
   }

}
