import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';


@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {



  firebaseService = inject(FirebaseService);
  utilService = inject(UtilsService);


  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let user = localStorage.getItem('user');
    return new Promise((resolve) => {
      this.firebaseService.getUserAuth().onAuthStateChanged((auth) => {
        if (auth) {
          if (user) resolve(true);
        } else {
          this.utilService.router2Page('/auth');
          resolve(false);
        }
      })
    })
  }
}