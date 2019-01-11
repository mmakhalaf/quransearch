import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavService } from '../services/nav-service.service';

@Component({
   selector: 'app-home',
   templateUrl: './home.component.html',
   styleUrls: ['./home.component.css']
})
export class HomeComponent {

   constructor(private navService: NavService) {

   }
   
   onSearch() {
      this.navService.search();
   }

}
