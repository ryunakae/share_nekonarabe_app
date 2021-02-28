import Vue from 'vue';
import VueFire from 'vuefire';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/functions';
import {firebaseConfig} from './config';

Vue.use(VueFire)

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const functions = firebase.functions();
export const ft = firebase.firestore.Timestamp;
export const fv = firebase.firestore.FieldValue;