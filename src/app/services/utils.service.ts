import { Injectable, inject } from '@angular/core';
import { LoadingController, ToastController, ToastOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  loadingControl = inject(LoadingController);
  toastControl = inject(ToastController);

  loading() {
    return this.loadingControl.create({spinner: 'crescent'});
  }

  async toastMessage(opt?: ToastOptions) {
    const toast = await this.toastControl.create(opt);
    toast.present();
  }
}
