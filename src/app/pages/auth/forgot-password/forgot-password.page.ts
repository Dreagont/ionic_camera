import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('',[Validators.required, Validators.email]),
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
        this.firebaseService.resetPassword(this.form.value.email).then((res) => {

          this.utilsService.toastMessage({
            message: "A reset password mail sent successfully, please check your mail!",
            duration: 2000,
            color: 'primary',
            position: 'middle',
            icon: 'mail-outline',
          });

          this.utilsService.router2Page("/auth");

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
