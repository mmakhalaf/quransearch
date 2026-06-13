import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavService } from '../services/nav-service.service';

@Component({
   selector: 'app-home',
   templateUrl: './home.component.html',
   styleUrls: ['./home.component.css'],
   imports: [MatButtonModule, MatIconModule]
})
export class HomeComponent {

   private navService = inject(NavService);

   onSearch() {
      this.navService.search();
   }

}
