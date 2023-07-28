import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { HelpServiceService } from '../internalApp/help-service.service'
import { CommonService } from '../internalApp/common.service'
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MailData } from '../internalApp/mail-data';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { fadeInOut, EnterLeaveTop, EnterLeave } from '../internalApp/animations';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: "app-support",
  templateUrl: "./support.component.html",
  styleUrls: ["./support.component.css"],
  animations: [
    fadeInOut, EnterLeaveTop, EnterLeave
  ]
})
export class SupportComponent implements OnInit {

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
    private helpService: HelpServiceService) {
    this.form = fb.group({
      name: ["", Validators.required],
      // email: ["", Validators.email],
      company: ["", Validators.required],
      empNum: ["", Validators.required],
      inquiry: ["", Validators.required],
      subject: ["Pintailer - User Request Mail", Validators.required],
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
      if (this.form.value.subject == 'Pintailer - User Request Mail') {
        mailTxt += ", User Required: " + this.form.value.empNum;
      }

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

              let mailMessage = this.form.value.inquiry;
              if (this.form.value.subject == 'Pintailer - User Request Mail') {
                mailMessage += ", User Required: " + this.form.value.empNum;
              }

              this.helpService.sendSupportMail(this.form.value.subject, this.form.value.name, this.emailFormControl.value, this.form.value.company, this.phoneFormControl.value, mailMessage, gToken)
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
