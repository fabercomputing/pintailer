import { Component, OnInit } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  constructor() { }

  ngOnInit() {
    const codeVerifier = this.generateCodeVerifier();
    const clientChallenge = this.generateCodeChallenge(codeVerifier);
    const clientState = this.generateRandomString(5);
    const nonce = this.generateRandomString(10);

    const authorizationUrl = `http://pintailer.com:9000/oauth2/authorize?client_id=oidc-client&redirect_uri=http://localhost:4200&scope=openid api.read api.write&response_type=code&response_mode=query&code_challenge_method=S256&code_challenge=${clientChallenge}&state=${clientState}&nonce=${nonce}`;

    location.href = authorizationUrl;
  }

  private generateCryptoRandomString(length: number): string {
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'; 
    let text = '';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private generateCodeVerifier(): string {
    return this.generateCryptoRandomString(128);
  }

  private generateCodeChallenge(codeVerifier: string): string {
    return this.base64URL(CryptoJS.SHA256(codeVerifier));
  }

  private base64URL(data: CryptoJS.lib.WordArray): string {
    return data.toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  private generateRandomString(len: number, charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let randomString = '';
    for (let i = 0; i < len; i++) {
      const randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
  }
}
