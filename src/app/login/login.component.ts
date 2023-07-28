import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { LoginService } from "../internalApp/login.service"
import { UserProfileDetail } from '../internalApp/user'
import { MatDialog } from '@angular/material';
import { ChangePasswordComponent } from '../change-password/change-password.component'
import { ReCaptchaV3Service } from 'ngx-captcha';
import { fadeInOut, EnterLeaveTop } from '../internalApp/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../common-style/bootstrap2.css', './bootstrap2.css', '../common-style/bootstrap-min.css', '../common-style/font-awesome.css'],
  animations: [
    fadeInOut, EnterLeaveTop
  ]
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  returnUrl: string;
  userProfileDetail: UserProfileDetail;
  color: string;
  mode: string;
  value: number;
  bufferValue: number;
  showProgressBar: boolean;
  invalidLogin = false;

  constructor(
    public dialog: MatDialog, private reCaptchaV3Service: ReCaptchaV3Service,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private loginService: LoginService) {

    this.form = fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

  }


  ngOnInit() {
    // reset login status
    this.loginService.logout();

    localStorage.setItem('logout-event', 'logout' + Math.random());

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashBoard';
    if (this.returnUrl != "/dashboard") {
      this.returnUrl = decodeURIComponent(this.returnUrl);
    }
    this.color = 'primary';
    this.mode = 'indeterminate';
    this.value = 50;
    this.bufferValue = 75;
    this.showProgressBar = false;
  }

  login(): void {

    let gToken = "";
    this.showProgressBar = true;
    this.reCaptchaV3Service.execute("6LdpLY4UAAAAAAdxEoMWSDL-Xgd8w-y9crEWgtPh", 'login', (token) => {
      gToken = token;
      this.invalidLogin = false;
      this.loginService.doLogin(gToken, this.form.value)
        .subscribe(
          result => {
            this.showProgressBar = false;
            if (result != undefined) {
              let link = document.createElement('a');
              link.setAttribute('type', 'hidden');
              link.href = this.returnUrl;
              // link.download = result.toString();
              document.body.appendChild(link);
              link.click();
              link.remove();
              //  this.router.navigate([this.returnUrl]); 
            }
            else {
              this.invalidLogin = true;
            }

          },
          error => {
            this.showProgressBar = false;
          });

    }, {
        useGlobalDomain: false
      });
  }

  passChange() {
    // window.open("http://35.196.71.233/phpldapadmin/index.php", "_blank");
    this.changeUserPassword()
  }

  changeUserPassword() {
    let dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != "cancel") {

      }
    });
  }

}
