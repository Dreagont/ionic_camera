import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-change-username',
  templateUrl: './change-username.component.html',
  styleUrls: ['./change-username.component.scss'],
})
export class ChangeUsernameComponent  implements OnInit {

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);
  router = inject(Router); 

  user = {} as User;
  currentDate: string;

  ngOnInit() {
    this.user = this.utilsService.loadLocal('user');
  }


  async submit() {

    if (this.form.valid) {
      await this.firebaseService.updateName(this.form.value.name);
      let path = `users/${this.user.id}`;
      const loading = await this.utilsService.loading();
      await loading.present();

      this.firebaseService.updateDocument(path, this.form.value).then(async res => {
        this.utilsService.dismissModal({ success: true });
        this.user.name = this.form.value.name;
        this.utilsService.saveLocal('user', this.user)
        this.utilsService.toastMessage({
          message: 'Username successfully update',
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

  }
}
