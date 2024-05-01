import { Injectable, inject } from '@angular/core';
import { AlertController, AlertOptions, LoadingController, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(
    private router: Router,
    private loadingControl: LoadingController,
    private toastControl: ToastController,
    private modalControl: ModalController,
    private alertControl: AlertController
  ) { }


  async takePicture(promptLabelHeader: string) {
    return await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      promptLabelHeader,
      promptLabelPhoto: 'Select Image...',
      promptLabelPicture: 'Take Photo'
    });
  };

  loading() {
    return this.loadingControl.create({ spinner: 'crescent' });
  }

  async toastMessage(opt?: ToastOptions) {
    const toast = await this.toastControl.create(opt);
    toast.present();
  }

  saveLocal(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  loadLocal(key: string) {
    return JSON.parse(localStorage.getItem(key));
  }

  router2Page(link: string) {
    this.router.navigate([link]);
  }

  async presentModal(opt: ModalOptions) {
    const modal = await this.modalControl.create(opt);
  
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) return data;
  
  }

  dismissModal(data?: any) { 
    return this.modalControl.dismiss(data); 
    
  }

  async presentAlert(opt? : AlertOptions) {
    const alert = await this.alertControl.create(opt);
  
    await alert.present();
  }

} 
