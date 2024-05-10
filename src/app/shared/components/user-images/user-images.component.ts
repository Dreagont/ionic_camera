import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Router } from '@angular/router'; // Import Router
import { Post } from 'src/app/models/post.model';

@Component({
  selector: 'app-user-images',
  templateUrl: './user-images.component.html',
  styleUrls: ['./user-images.component.scss'],
})
export class UserImagesComponent implements OnInit {
  @Input() post: Post;

  form = new FormGroup({
    id: new FormControl(''),
    description: new FormControl('', [Validators.required, Validators.minLength(6)]),
    privacy: new FormControl('public'),
    image: new FormControl('', [Validators.required]),
    like: new FormControl(0),
    timestamp: new FormControl(''),
    likedBy: new FormControl,
  });

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);
  router = inject(Router); // Inject Router

  user = {} as User;
  currentDate: string;

  ngOnInit() {
    this.user = this.utilsService.loadLocal('user');
    if (this.post) this.form.setValue(this.post);
  }

  async takeImage() {
    const dataUrl = (await this.utilsService.takePicture('Take picture')).dataUrl;
    this.form.controls.image.setValue(dataUrl);
  }

  async submit() {
    if (this.form.valid) {
      if (this.post) {
        this.updatePost();
      } else {
        this.addPost();
      }
    }
  }

  async addPost() {
    if (this.form.valid) {
      let path = `users/${this.user.id}/posts`
      let dataUrl = this.form.value.image;
      let imagePath = `${this.user.id}/${Date.now()}`;
      let imageUrl = await this.firebaseService.uploadImage(imagePath, dataUrl);
      this.form.controls.image.setValue(imageUrl);
      const date = new Date();
      this.currentDate = date.toLocaleString();
      this.form.controls.timestamp.setValue(this.currentDate);
      const loading = await this.utilsService.loading();
      await loading.present();
      console.log(this.form.value);
      this.firebaseService.addPost(path, this.form.value).then(async res => {
        this.utilsService.dismissModal({ success: true });
        this.utilsService.toastMessage({
          message: 'Post successfully uploaded',
          duration: 1000,
          color: 'success',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
        // Auto-reload the page or navigate back to the same page
        
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

  async updatePost() {
    if (this.form.valid) {
      let path = `users/${this.user.id}/posts/${this.post.id}`;

      const loading = await this.utilsService.loading();
      await loading.present();

      if (this.form.value.image !== this.post.image) {
        let dataUrl = this.form.value.image;
        let imagePath = await this.firebaseService.getFilePath(this.post.image);
        let imageUrl = await this.firebaseService.uploadImage(imagePath, dataUrl);
        this.form.controls.image.setValue(imageUrl);
        const date = new Date();
        this.currentDate = date.toLocaleString();
        this.form.controls.timestamp.setValue(this.currentDate);
      }

      const date = new Date();
      this.currentDate = date.toLocaleString();
      this.form.controls.timestamp.setValue(this.currentDate);

      this.firebaseService.updateDocument(path, this.form.value).then(async res => {
        this.utilsService.dismissModal({ success: true });
        this.utilsService.toastMessage({
          message: 'Post successfully update',
          duration: 1000,
          color: 'success',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
        // Auto-reload the page or navigate back to the same page
       
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
