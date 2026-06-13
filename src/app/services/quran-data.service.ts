import { Injectable, inject } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Ayah, Quran } from '../quran/quran';
import { QuranLoader } from '../quran/quran-loader';

/**
 * Owns loading of the Quran dataset and exposes the loaded model. Split out of
 * the former monolithic QuranService so data-loading is independent of search.
 */
@Injectable({
   providedIn: 'root'
})
export class QuranDataService {

   quran!: Quran;
   isOpPending = true;

   /** Global ayah-id -> Ayah index, for mapping worker search results back. */
   readonly ayahById = new Map<number, Ayah>();

   /** Emits the loaded Quran once; late subscribers get the last value. */
   readonly quranLoaded$ = new ReplaySubject<Quran>(1);

   private snackBar = inject(MatSnackBar);

   constructor() {
      QuranLoader.create().then((quran: Quran) => this.on_quran_loaded(quran));
   }

   private on_quran_loaded(quran: Quran) {
      this.quran = quran;
      this.isOpPending = false;

      if (quran.error) {
         this.snackBar.open('لقد حدثت مشكله أثناء تحميل القران، نرجو إعادة تحميل الصفحة. إذا استمرت المشكله، نرجو إبلاغنا', 'أغلق', {
            duration: 0,
            direction: 'rtl'
         });
         return;
      }

      quran.for_each_ayah((a: Ayah) => this.ayahById.set(a.id, a));
      this.quranLoaded$.next(quran);
   }
}
