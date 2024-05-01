import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  ngOnInit() {
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsService.loading();
      await loading.present();

      try {
        const { email, password } = this.form.value;
        const res = await this.firebaseService.signIn({ email, password } as User);
        this.utilsService.router2Page("/home");
        this.getUserName(res.user.uid);
      } catch (error) {
        console.error(error);
        const errorMessage = (error && error.message) ? error.message : 'An error occurred';
        this.utilsService.toastMessage({
          message: errorMessage,
          duration: 2000,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      } finally {
        loading.dismiss();
      }
    }
  }

  async getUserName(id: string) {
    if (this.form.valid) {
      const loading = await this.utilsService.loading();
      await loading.present();

      try {
        const user = await this.firebaseService.getDocument(`users/${id}`);
        this.utilsService.saveLocal('user', user);
        this.form.reset();
        this.utilsService.router2Page('/home');
      } catch (error) {
        console.error(error);
        const errorMessage = (error && error.message) ? error.message : 'An error occurred';
        this.utilsService.toastMessage({
          message: errorMessage,
          duration: 2000,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      } finally {
        loading.dismiss();
      }
    }
  }
}
