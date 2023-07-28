import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import {ClientProjectService} from '../client-project.service'
import { LoginService } from "../login.service"

@Component({
  selector: 'app-client-project-edit',
  templateUrl: './client-project-edit.component.html',
  styleUrls: ['./client-project-edit.component.css']
})
export class ClientProjectEditComponent implements OnInit {

  form: FormGroup;
  description: string;
  organization: string;

  constructor(
    private fb: FormBuilder,
    private clientProjectService: ClientProjectService,
    private loginService: LoginService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ClientProjectEditComponent>) {

    this.description = "Edit Client Project";
    this.organization = data.row.clientOrganization;

    this.form = fb.group({
      clientProjectId: [data.row.clientProjectId, Validators.required],
      clientOrganization: [data.row.clientOrganization, Validators.required],
      name: [data.row.name, Validators.required],
      modifiedBy: [data.modifiedBy, Validators.required]
    });
  }

  ngOnInit() {
  }

  update() {
    this.clientProjectService.updateClientProject(this.form.value)
        .subscribe(
          result=> {
            this.dialogRef.close("Ok");
          });
  }

  close() {
      this.dialogRef.close();
  }

}
