import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Ayah } from '../quran/quran';
import { QuranService } from './quran.service';

@Injectable({
   providedIn: 'root'
})
export class NavService {

   constructor(private router: Router, private qService: QuranService) {

   }

   close_ayah(route: ActivatedRoute) {
      if (route.outlet == 'modal') {
         this.router.navigate([{ outlets: { 'modal': null }}]);
      } else {
         this.router.navigate([{ outlets: { 'primary': null, 'modal': null }}]);
      }
   }

   open_ayah(ayah_id: number) {
      this.router.navigate(
         [{ outlets: {'modal': `ayah/${ayah_id}` }}], { 
            // replaceUrl: true,
            // skipLocationChange: false
         });
   }

   open_ayah_and_copy_link(ayah_id: number) {
      let url = this.ayah_url(ayah_id);
      this.qService.copy_text(url, 'تم نسخ رابط الآية');
      this.open_ayah(ayah_id);
   }

   ayah_url(ayah_id: number): string {
      return `${location.origin}/ayah/${ayah_id}`;
   }
}