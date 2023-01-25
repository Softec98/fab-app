import CryptoJS from 'crypto-js';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CriptografiaService {

  constructor() { }

  encryptData(data: string) {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), environment.encryptSecretKey).toString();
    } catch (e) {
      console.log(e);
    }
    return '';
  }

  decryptData(data: string) {
    try {
      const bytes = CryptoJS.AES.decrypt(data, environment.encryptSecretKey);
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
      return data;
    } catch (e) {
      console.log(e);
    }
  }
}