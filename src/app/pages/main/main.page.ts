import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  constructor(
    private firebaseService: FirebaseService,
    private utilsService: UtilsService,
    private router: Router
  ) { }

  pages = [
    {title : 'Home', icon : 'home-outline', url : '/main/home'},
    {title : 'Profile', icon : 'person-outline', url : '/main/profile'}
  ]

  route = inject(Router);
  currentPage: String = "";

  ngOnInit() {
    this.route.events.subscribe((event: any) => {
      if (event?.url) this.currentPage = event.url;
    })
  }

  signOut() {
    this.firebaseService.signOut();
  }

}
