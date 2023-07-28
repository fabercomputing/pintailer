import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoginService } from "../login.service"
import { HelpServiceService } from '../help-service.service'
import { HelpDetail } from '../help'

@Component({
  selector: 'app-help-popup',
  templateUrl: './help-popup.component.html',
  styleUrls: ['./help-popup.component.css']
})
export class HelpPopupComponent implements OnInit {

  description: string;
  organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string = this.organizations[0];

  helpDetailHtml: HelpDetail[] = [];

  constructor(
    private loginService: LoginService, @Inject(MAT_DIALOG_DATA) public data: any, private helpService: HelpServiceService,
    public dialogRef: MatDialogRef<HelpPopupComponent>) {

    this.description = "Help";

  }

  ngOnInit() {
    this.getHelpDetail();
  }

  getHelpDetail() {
    this.helpService.getHelpDetailForId(this.data.helpId).subscribe(result => {
      this.helpDetailHtml.push(result);
    });
  }

  close() {
    this.dialogRef.close("cancel");
  }

}
