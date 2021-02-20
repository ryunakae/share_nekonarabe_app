import Vue from 'vue';
import VueFire from 'vuefire';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/functions';
import {firebaseConfig} from './config';

Vue.use(VueFire)

const firebaseApp = firebase.initializeApp(firebaseConfig);
export const auth = firebaseApp.auth();
export const db = firebaseApp.firestore();
export const storage = firebaseApp.storage();
export const functions = firebaseApp.functions();
export const FirebaseTimestamp = firebase.firestore.Timestamp;
export const fv = firebase.firestore.FieldValue;