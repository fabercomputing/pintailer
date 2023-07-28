import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ClientProjectService } from '../client-project.service'

@Component({
  selector: 'app-client-project-delete',
  templateUrl: './client-project-delete.component.html',
  styleUrls: ['./client-project-delete.component.css']
})
export class ClientProjectDeleteComponent implements OnInit {

  constructor(
    private clientProjectService: ClientProjectService,
    public dialogRef: MatDialogRef<ClientProjectDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  ngOnInit() {
  }

  delete() {
    this.clientProjectService.deleteClientProject(this.data.row.clientProjectId)
      .subscribe(
        result => {
          this.dialogRef.close("Ok");
        });

  }

  close() {
    this.dialogRef.close();
  }

}
