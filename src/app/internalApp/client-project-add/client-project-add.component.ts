import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { ClientProjectService } from '../client-project.service'
import { LoginService } from "../login.service"

@Component({
  selector: 'app-client-project-add',
  templateUrl: './client-project-add.component.html',
  styleUrls: ['./client-project-add.component.css']
})
export class ClientProjectAddComponent implements OnInit {

  form: FormGroup;
  description: string;
  organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string = this.organizations[0];

  constructor(
    private fb: FormBuilder,
    private clientProjectService: ClientProjectService,
    private loginService: LoginService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ClientProjectAddComponent>) {

    this.description = "Add Client Project";

    this.form = fb.group({
      clientOrganization: [data.clientOrganization],
      name: ['', Validators.required],
      createdBy: [data.createdBy],
      modifiedBy: [data.createdBy]
    });
  }

  ngOnInit() {

  }

  save() {
    this.clientProjectService.addClientProject(this.form.value)
      .subscribe(
        result => {
          this.dialogRef.close("Ok");
        });
  }

  close() {
    this.dialogRef.close("cancel");
  }

}
