import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Post } from 'src/app/models/post.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UserImagesComponent } from 'src/app/shared/components/user-images/user-images.component';
import { Router } from '@angular/router';
import { orderBy } from 'firebase/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  userName: string;
  currentDate: string;
  userAvatar: any;

  doRefresh(event) {
    setTimeout(() => {
      this.getPost();
      event.target.complete();
    }, 2000);
  }

  constructor(
    private firebaseService: FirebaseService,
    private utilsService: UtilsService,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.isFirstTimeLogin()) {
      this.router.navigateByUrl('/home', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/home']);
      });
      this.getPost();

    } else {
      this.getPost();
    }
  
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.userName = userData.name;
      this.userAvatar = userData.avatar;
    }
  }
  

  posts: Post[] = [];
  loading : boolean = false;

  user(): User {
    return this.utilsService.loadLocal('user');
  }

  async submit() {
    this.firebaseService.signOut();
  }
//
  async addUpdatePost(post?: Post) {
    let success = await this.utilsService.presentModal({
      component: UserImagesComponent,
      cssClass: 'user-images-modal',
      componentProps: { post }
    });

    if (success) {
      this.getPost();
    }
  }

  getPost() {
    let path = `users/${this.user().id}/posts`;
    console.log(this.user().email);
    let query =  (
      orderBy('timestamp', 'desc')
    )
    this.loading = true;
    let sub = this.firebaseService.getCollectionData(path, query).subscribe({
      next: (res: any) => {
        this.posts = res;

        this.loading = false;
        console.log(res);
        sub.unsubscribe();
      }
    })
  }

  reloadHomePage() {
    this.router.navigateByUrl('/home', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/home']);
    });
  }

  isFirstTimeLogin(): boolean {
    const user = this.user();
    return !user;
  }

  async deletePost(post: Post) {
    let path = `users/${this.user().id}/posts/${post.id}`;

    const loading = await this.utilsService.loading();
    await loading.present();

    let imagePath = await this.firebaseService.getFilePath(post.image);
    await this.firebaseService.deleteFile(imagePath);

    this.firebaseService.deleteDocument(path).then(async res => {

      this.posts = this.posts.filter(p => p.id !== post.id);

      this.utilsService.toastMessage({
        message: 'Post successfully delete',
        duration: 1000,
        color: 'success',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
      // Auto-reload the page or navigate back to the same page
      this.router.navigateByUrl('/home', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/home']);
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

  async presentAlertConfirm(post: Post) {
    this.utilsService.presentAlert({
      header: 'Post delete confirm!',
      message: 'Do you want to delete this post?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancel',
        }, {
          text: 'Okay',
          handler: () => {
            this.deletePost(post);
          }
        }
      ]
    });
  }
}
//2.23