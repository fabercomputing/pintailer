import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { CommonService } from '../internalApp/common.service';
import { LoginService } from '../internalApp/login.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  form: FormGroup;
  showProgressBar = false;

  constructor(
    private commonService: CommonService,
    public dialog: MatDialog,
    private reCaptchaV3Service: ReCaptchaV3Service,
    public fb: FormBuilder,
    private loginService: LoginService,
    public dialogRef: MatDialogRef<ChangePasswordComponent>
  ) {

    this.form = fb.group({
      username: ['', Validators.required],
      oldPass: ['', Validators.required],
      newPass: ['', Validators.required],
      newPassConfirm: ['', Validators.required]
    });

  }

  ngOnInit() {
  }

  changePassword(): void {

    let gToken = '';
    this.showProgressBar = true;
    this.reCaptchaV3Service.execute('6LdpLY4UAAAAAAdxEoMWSDL-Xgd8w-y9crEWgtPh', 'login', (token) => {
      gToken = token;

      if (this.form.value.newPassConfirm === this.form.value.newPass) {
        this.loginService.updateUserPassword(this.form.value.username, this.form.value.oldPass, this.form.value.newPassConfirm, gToken)
          .subscribe(
            result => {
              this.showProgressBar = false;
              if (result === 'Password updated successfully') {
                this.commonService.openNotificationBar(result, 'notification_important', 'normal');
                this.dialogRef.close('Ok');
              } else {
                this.commonService.openNotificationBar(result, 'warning', 'normal');
              }
            },
            error => {
              this.showProgressBar = false;
              this.commonService.openNotificationBar(JSON.parse(error), 'error', 'normal');
            });
      } else {
        this.showProgressBar = false;
        this.commonService.openNotificationBar('New Password do not matches', 'error', 'normal');
      }
    }, {
        useGlobalDomain: false
      });

  }

}
