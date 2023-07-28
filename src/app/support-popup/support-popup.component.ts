import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { EnterLeave, EnterLeaveTop, fadeInOut } from '../internalApp/animations';
import { CommonService } from '../internalApp/common.service';
import { HelpServiceService } from '../internalApp/help-service.service';
import { MailData } from '../internalApp/mail-data';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-support-popup',
  templateUrl: './support-popup.component.html',
  styleUrls: ['./support-popup.component.css'],
  animations: [
    fadeInOut, EnterLeaveTop, EnterLeave
  ]
})
export class SupportPopupComponent implements OnInit {

  dataProcessing = false;

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  phoneFormControl = new FormControl("", [
    Validators.required,
    Validators.min(1000000000)
  ]);

  matcher = new MyErrorStateMatcher();
  form: FormGroup;
  constructor(private fb: FormBuilder, private reCaptchaV3Service: ReCaptchaV3Service,
    private commonService: CommonService,
    private helpService: HelpServiceService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<SupportPopupComponent>) {
    this.form = fb.group({
      name: ["", Validators.required],
      // email: ["", Validators.email],
      company: ["", Validators.required],
      // phnum: [0, Validators.required],
      inquiry: ["", Validators.required],
      subject: ["Pintailer - Inquiry Mail", Validators.required],
      // recaptcha: ['', Validators.required]
    });
  }

  ngOnInit() { }

  save() {
    let gToken = "";
    this.reCaptchaV3Service.execute("6LdpLY4UAAAAAAdxEoMWSDL-Xgd8w-y9crEWgtPh", 'homepage', (token) => {
      gToken = token;
      this.dataProcessing = true;
      let mailTxt: string;
      let mailSubject: string;
      mailTxt = "Sender Details => Name:" + this.form.value.name + ", Email: " + this.emailFormControl.value + ", Company: " + this.form.value.company + ", Phone Number: "
        + this.phoneFormControl.value + ", Inquiry: " + this.form.value.inquiry;
      mailSubject = this.form.value.subject;

      let mailData = new MailData();

      // console.log(JSON.stringify(mailData) + " ## " + this.form.value.name)
      mailData.username = this.form.value.name;
      mailData.userEmailId = this.emailFormControl.value;
      mailData.subject = mailSubject;
      mailData.message = mailTxt;
      mailData.userEmailId = this.emailFormControl.value;
      mailData.createdDate = new Date();
      mailData.attachmentPath = "";
      mailData.modifiedDate = new Date();
      mailData.notificationId = 0;
      mailData.readBy = "visitor";
      mailData.readFlg = false;

      this.helpService.saveSupportMailNew(gToken, mailData)
        .subscribe(
          result => {
            this.commonService.openNotificationBar("Support request has been successfully send. Thank You!", "notification_important", "normal");
            this.reCaptchaV3Service.execute("6LdpLY4UAAAAAAdxEoMWSDL-Xgd8w-y9crEWgtPh", 'homepage', (token) => {
              gToken = token;
              this.helpService.sendSupportMail(this.form.value.subject, this.form.value.name, this.emailFormControl.value, this.form.value.company, this.phoneFormControl.value, this.form.value.inquiry, gToken)
                .subscribe(
                  result => {
                  })

              this.form.reset();
              this.emailFormControl.reset();
              this.phoneFormControl.reset();
              {
                useGlobalDomain: false
              }
            })

            this.dataProcessing = false;
          })


    }, {
      useGlobalDomain: false
    });

  }

  sendEmail() {
    setTimeout(() => {
      window.location.href = `mailto:support@pintailer.com?subject=Pintailer-Support`;
    }, 200);
  }


}
