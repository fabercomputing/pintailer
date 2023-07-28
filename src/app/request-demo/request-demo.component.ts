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
  selector: 'app-request-demo',
  templateUrl: './request-demo.component.html',
  styleUrls: ['./request-demo.component.css'],
  animations: [
    fadeInOut, EnterLeaveTop, EnterLeave
  ]
})
export class RequestDemoComponent implements OnInit {

  dataProcessing = false;
  selectedOption = "Pintailer - Request Demo";
  selected = 'option2';

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
      // phnum: ["", Validators.required],
      inquiry: ["", Validators.required],
      subject: ["Pintailer - Request Demo", Validators.required]
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
      mailData.readBy = "";
      mailData.readFlg = false;

      this.helpService.saveSupportMailNew(gToken, mailData)
        .subscribe(
          result => {
            this.commonService.openNotificationBar("Your Request have been successfully received. Thank You!", "notification_important", "normal");
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

      // this.helpService.sendSupportMail(mailTxt, mailSubject)
      //   .subscribe(
      //     result => {
      //     })
    }, {
        useGlobalDomain: false
      });
  }

}
