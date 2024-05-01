import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail} from 'firebase/auth';
import { User } from '../models/user.model';
import { UtilsService } from './utils.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {getFirestore, setDoc, doc, getDoc, addDoc, collection, collectionData} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {getStorage, uploadString, ref, getDownloadURL, deleteObject} from 'firebase/storage';
import { deleteDoc, query, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  auth = inject(AngularFireAuth);
  utilsServices = inject(UtilsService);
  storage = inject(AngularFireStorage);
  signIn(user : User) {
    return signInWithEmailAndPassword(getAuth(),user.email,user.password);
  }

  signUp(user : User) {
    return createUserWithEmailAndPassword(getAuth(),user.email,user.password);
  }

  updateName(displayName : string) {
    return updateProfile(getAuth().currentUser, {displayName});
  }

  resetPassword(email : string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  signOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsServices.router2Page("/auth");
  }

  getCollectionData(path: string, collectionQuery?: any) {
    const ref = collection(getFirestore(), path)
    return collectionData(query(ref,collectionQuery), {idField: 'id'});
  }

  setDocument(path : string, data: any) {
    return setDoc(doc(getFirestore(), path),data);
  }

  updateDocument(path : string, data: any) {
    return updateDoc(doc(getFirestore(), path),data);
  }

  deleteDocument(path : string) {
    return deleteDoc(doc(getFirestore(), path));
  }

  async getDocument(path : string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  getUserAuth() {
    return getAuth();
  }

  addPost(path : string, data : any) {
    return addDoc(collection(getFirestore(), path) ,data);
  }

  async uploadImage(path : string, data_url : string) {
    return uploadString(ref(getStorage(),path),data_url, 'data_url').then(() =>{
      return getDownloadURL(ref(getStorage(),path));
    });
  }

  async getFilePath(url: string) {
    return ref(getStorage(), url).fullPath;
  }

  deleteFile(path : string) {
    return deleteObject(ref(getStorage(),path));
  }
}
