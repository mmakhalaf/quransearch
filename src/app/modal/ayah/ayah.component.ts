import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Ayah, Quran, QuranWord, Category } from '../../quran/quran';
import { ActivatedRoute, Params } from '@angular/router';
import { QuranService } from '../../services/quran.service';
import { NavService } from '../../services/nav-service.service';

@Component({
   selector: 'qmodal-ayah-dialog',
   templateUrl: './ayah.component.html',
   styleUrls: ['./ayah.component.css'],
   imports: [CommonModule, MatDialogModule, MatTabsModule, MatButtonModule, MatIconModule]
})
export class AyahDialogComponent implements OnInit {

   dialogRef = inject<MatDialogRef<AyahDialogComponent>>(MatDialogRef);
   private qService = inject(QuranService);
   private navService = inject(NavService);
   ayah = inject<Ayah>(MAT_DIALOG_DATA);

   ngOnInit() {
      if (this.ayah == null) {
         console.error('No Ayah Provided');
         this.dialogRef.close();
      }
   }

   onWordClicked(word: QuranWord) {
      this.qService.request_search_with_word_filter(word.imlaai, true);
      this.dialogRef.close();
   }

   onCategoryClicked(cat: Category) {
      this.qService.request_search_with_cat_filter(cat, true);
      this.dialogRef.close();
   }

   onNavAyahLink(ayah: Ayah) {
      this.navService.open_ayah_and_copy_link(ayah.id);
   }

   onCopyAyah(ayah: Ayah) {
      this.qService.copy_text(ayah.uthmani, 'تم نسخ الآية');
   }

   ///

   show_related(): boolean {
      return this.ayah.related_ayat.length > 0;
   }

   show_categories(): boolean {
      return this.ayah.categories.length > 0;
   }

   show_tabs(): boolean {
      return this.show_categories() && this.show_related();
   }
}

@Component({
   selector: 'qmodal-ayah',
   template: ''
})
export class AyahComponent implements OnInit, OnDestroy {

   id = NaN;
   private dialogRef: MatDialogRef<AyahDialogComponent, any> | null = null;

   private dialog = inject(MatDialog);
   private route = inject(ActivatedRoute);
   private qService = inject(QuranService);
   private navService = inject(NavService);

   constructor() {
      this.qService.quranLoaded$
         .pipe(takeUntilDestroyed())
         .subscribe((q: Quran) => this.on_quran_loaded(q));
   }

   ngOnInit() {
      this.route.params.subscribe((params: Params) => {
         this.id = +params['id'];
         setTimeout(() => {
            this.on_quran_loaded(this.qService.quran);
         });
      });

      setTimeout(() => {
         this.on_quran_loaded(this.qService.quran);
      });
   }

   ngOnDestroy() {
      if (this.dialogRef != null) {
         this.dialogRef.close();
      }
   }

   private on_quran_loaded(q: Quran) {
      if (q == null || isNaN(this.id)) {
         return;
      }

      let ayah = q.get_ayah(this.id);
      if (ayah == null) {
         this.destroy();
         return;
      }

      if (this.dialogRef == null) {
         this.dialogRef = this.dialog.open(AyahDialogComponent, {
            maxWidth: '95vw',
            maxHeight: '90vh',
            direction: "rtl",
            autoFocus: false,
            data: ayah
         });

         this.dialogRef.afterClosed().subscribe(() => {
            this.destroy();
         });
      } else {
         this.dialogRef.componentInstance.ayah = ayah;
      }
   }

   private destroy() {
      this.navService.close_ayah(this.route);
   }
}
