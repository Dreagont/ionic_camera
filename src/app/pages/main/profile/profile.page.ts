import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  user(): User {
    return this.utilsService.loadLocal('user');
  }

  ngOnInit() {
  }

  async takeImage() {
    let user = this.user();
    let path = `users/${user.id}`;

    const dataUrl = (await this.utilsService.takePicture('Take profile picture')).dataUrl;
    let imagePath = `${user.id}/profilePicture`;
    user.avatar = await this.firebaseService.uploadImage(imagePath, dataUrl);

    const loading = await this.utilsService.loading();
    await loading.present();
    this.firebaseService.updateDocument(path, {avatar : user.avatar}).then(async res => {
      this.utilsService.saveLocal('user',user);
      this.utilsService.toastMessage({
        message: 'Profile picture successfully update',
        duration: 1000,
        color: 'success',
        position: 'middle',
        icon: 'alert-circle-outline',
      });     
    }).catch(error => {
      console.error(error); // Log the error object to the console for inspection
      const errorMessage = (error && error.message) ? error.message : 'An error occurred';
      this.utilsService.toastMessage({
        message: errorMessage,
        duration: 2000,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
    }).finally(() => {
      loading.dismiss();
    });
  }
//2.56
}
