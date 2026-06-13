import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css'],
   imports: [RouterOutlet]
})
export class AppComponent {
   constructor() {
      // Use the Material Symbols Outlined font for all <mat-icon> elements.
      inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
   }
}
