import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  form = new FormGroup({
    id: new FormControl(''),
    email: new FormControl('',[Validators.required, Validators.email]),
    password: new FormControl('',[Validators.required]),
    name: new FormControl('',[Validators.required, Validators.minLength(6)]),
    avatar : new FormControl('https://firebasestorage.googleapis.com/v0/b/ionic-web-app-e0eaf.appspot.com/o/default.png?alt=media&token=1487b529-d187-40a0-9b31-f273230a6458')
  });

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  ngOnInit() {
  }

  async submit() {

    if (this.form.valid) {
      const loading = await this.utilsService.loading();
      await loading.present();

      console.log(this.form.value);
      this.firebaseService.signUp(this.form.value as User).then(async res => {
        await this.firebaseService.updateName(this.form.value.name);

        let id = res.user.uid;
        this.form.controls.id.setValue(id);

        this.setUserName(id);

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
      })
      .finally(() => {
        loading.dismiss();
      });
    } 
  }

  async setUserName(id : string) {

    if (this.form.valid) {
      const loading = await this.utilsService.loading();
      await loading.present();

      let path = `users/${id}`;
      delete this.form.value.password;

      console.log(this.form.value);
      this.firebaseService.setDocument(path, this.form.value).then(async res => {
        this.utilsService.saveLocal('user',this.form.value)
        this.form.reset();
        this.utilsService.router2Page('/auth')
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
      })
      .finally(() => {
        loading.dismiss();
      });
    } 
  }
}

