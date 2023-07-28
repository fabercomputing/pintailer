import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { ENTER, COMMA } from '@angular/cdk/keycodes';

import { AssetInfoService } from '../asset-info.service';

@Component({
  selector: 'app-edit-asset-info',
  templateUrl: './edit-asset-info.component.html',
  styleUrls: ['./edit-asset-info.component.css']
})
export class EditAssetInfoComponent implements OnInit {

  form: FormGroup;
  description: string;
  visible: boolean = true;
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = true;

  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];
  booleanEnum = [true, false];
  tags: string[] = [];

  deviceSelectableStatus = ['In Use', 'Lost', 'Damaged', 'In Storage', 'Depricated'];

  constructor(
    private fb: FormBuilder,
    private assetInfoService: AssetInfoService,
    public dialogRef: MatDialogRef<EditAssetInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.description = "Edit Asset";
    this.tags = data.row.tags;

    console.log(JSON.stringify(data.row))

    this.form = fb.group({
      assetInfoId: [data.row.assetInfoId, Validators.required],
      assetTypeId: [data.row.assetTypeId, Validators.required],
      status: [data.row.status, Validators.required],
      name: [data.row.name, Validators.required],
      brand: [data.row.brand, Validators.required],
      model: [data.row.model, Validators.required],
      serial: [data.row.serial],
      processor: [data.row.processor],
      ram: [data.row.ram],
      hd_type: [data.row.hd_type],
      hd_size: [data.row.hd_size],
      os_version: [data.row.os_version],
      os_type: [data.row.os_type],
      comments: [data.row.comments],
      imei: [data.row.imei],
      createdBy: [data.row.createdBy],
      modifiedBy: [data.modifiedBy]
    });
  }

  ngOnInit() {
  }

  save() {
    this.assetInfoService.updateAssetInfo(this.form.value)
      .subscribe(
        result => {
          this.dialogRef.close("Ok");
        });
  }

  close() {
    this.dialogRef.close();
  }

}
