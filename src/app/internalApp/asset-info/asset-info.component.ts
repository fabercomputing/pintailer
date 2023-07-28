import { Component, OnInit, ViewChild } from "@angular/core";

import { find, filter } from 'lodash';

import { AssetType } from "../asset-type";
import { AssetInfo } from "../asset-info";
import { AssetInfoService } from "../asset-info.service";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { UserService } from "../user.service";
import { UsersDetail } from "../user";
import { AssingUser } from "../user";
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { CommonService } from '../common.service'
import { MatDialog } from '@angular/material';
import { EditAssetInfoComponent } from '../edit-asset-info/edit-asset-info.component'
import { LoginService } from "../login.service"
import { UserProfileDetail } from '../user'

@Component({
  selector: "app-asset-info",
  templateUrl: "./asset-info.component.html",
  styleUrls: ["./asset-info.component.css"]
})
export class AssetInfoComponent implements OnInit {

  form: FormGroup;
  description: string;
  events: string[] = [];
  panelOpenState2: boolean = false;
  panelOpenState1: boolean = false;
  panelOpenState: boolean = false;
  assets: AssetType[] = [];
  usersDetail: UsersDetail[] = [];
  assetInfoData: AssetInfo[] = [];
  allAssetUsers: AssingUser[] = [];
  assetType: string;
  assetTypeID: number;
  assignedAssetType: number;
  assignedUserID: string;
  startTime: Date;
  endTime: Date;
  userProfileDetail: UserProfileDetail = this.loginService.getUserInformationFromLocalStorage();

  allAssetInfoTable: MatTableDataSource<AssetInfo>;

  displayedColumns = ['Asset Type', 'name', 'brand', 'model', 'serial', 'processor', 'ram', 'hd_type', 'hd_size', 'os_version', 'os_type', 'comments', 'imei', 'status', 'User', 'Previous Users', 'actions'];
  deviceSelectableStatus = ['In Use', 'Lost', 'Damaged', 'In Storage', 'Depricated'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private assetInfoService: AssetInfoService,
    private fb: FormBuilder,
    private userService: UserService,
    private commonService: CommonService,
    public dialog: MatDialog,
    private loginService: LoginService
  ) {
    this.description = "Asset Info";

    this.form = fb.group({
      assetTypeId: ["", Validators.required],
      status: ["", Validators.required],
      name: ["", Validators.required],
      brand: ["", Validators.required],
      model: ["", Validators.required],
      serial: [""],
      processor: [""],
      ram: [""],
      hd_type: [""],
      hd_size: [""],
      os_version: [""],
      os_type: [""],
      comments: [""],
      imei: [""],
      createdBy: [this.userProfileDetail.userName],
      modifiedBy: [this.userProfileDetail.userName]
    });
  }

  ngOnInit() {
    this.getAssetTypeDefinitions();
    this.showUsers();
    this.getAllAssets();
    this.getAllAssetUsers();
    this.startTime = new Date();
    this.endTime = null;
  }


  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.allAssetInfoTable.filter = filterValue;
    if (this.allAssetInfoTable.paginator) {
      this.allAssetInfoTable.paginator.firstPage();
    }
  }

  saveAsset(): void {
    const assetType = this.assetType;
    var result = typeof assetType != 'undefined' && filter(this.assets, function (o) { return o.assetTypeName.toLowerCase() == assetType.toLowerCase(); }).length == 0;
    if (result) {
      let assetType = new AssetType();
      assetType.assetTypeName = this.assetType;
      assetType.createdBy = this.userProfileDetail.userName;
      assetType.modifiedBy = this.userProfileDetail.userName;
      this.assetInfoService.addAssetType(assetType).subscribe(result => {
        this.commonService.openNotificationBar("Asset Type is now saved", "notification_important", "normal");
        this.getAssetTypeDefinitions();
      });
    } else {
      this.commonService.openNotificationBar("Already exist or invalid asset type", "error", "normal");
    }
  }

  getAssetTypeDefinitions(): void {
    this.assetInfoService.getAssetTypeDefinitions().subscribe(assetInfoService => {
      this.assets = assetInfoService;
    });
  }

  saveAssetInfo(): void {
    this.assetInfoService.addAssetInfo(this.form.value).subscribe(result => {
      this.form.reset();
      this.getAllAssetUsers();
      this.getAllAssets();
      this.commonService.openNotificationBar("Asset Information is now saved", "notification_important", "normal");
    });
  }

  showUsers(): void {
    this.userService.getAllUsers("ALL").subscribe(userService => {
      this.usersDetail = userService;
      this.usersDetail.forEach((item, index) => {
      });
    });
  }

  getAllAssets(): void {
    this.assetInfoService.getAllAssetInfo().subscribe(assetInfoService => {
      this.assetInfoData = assetInfoService;
      this.allAssetInfoTable = new MatTableDataSource(assetInfoService);
      this.allAssetInfoTable.paginator = this.paginator;
      this.allAssetInfoTable.sort = this.sort;
    });
  }

  getAllAssetUsers(): void {
    this.userService.getAllAssetUsers().subscribe(userService => {
      this.allAssetUsers = userService;

    });
  }

  assignUser(): void {
    let assetType = new AssingUser();
    assetType.assetInfoId = this.assignedAssetType;
    assetType.assetUserId = this.assignedUserID;
    assetType.startDate = this.startTime.valueOf();
    if (this.endTime) {
      assetType.endDate = this.endTime.valueOf();
    }
    assetType.createdBy = this.userProfileDetail.userName;
    assetType.modifiedBy = this.userProfileDetail.userName;
    this.userService.assingAssetToUser(assetType).subscribe(result => {
      this.commonService.openNotificationBar(`Asset is now assigned to ${this.assignedUserID}`, "notification_important", "normal");
      this.getAllAssetUsers();
      this.getAllAssets();
    });
  }

  editAssetInfo(row) {

    let dialogRef = this.dialog.open(EditAssetInfoComponent, {
      width: '700px',
      data: { row, modifiedBy: this.loginService.getUserInformationFromLocalStorage().userName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == "Ok") {
        this.getAllAssetUsers();
        this.getAllAssets();
      }
    });
  }

  updateAssetUser(userName: string, assetInfoId: number, startTime: number) {

    if (window.confirm('Are sure you want to un assign this item ?')) {
      let assetUser = new AssingUser();
      assetUser.assetInfoId = assetInfoId;
      assetUser.startDate = startTime;
      assetUser.assetUserId = userName;
      assetUser.endDate = new Date().valueOf();

      this.assetInfoService.updateAssetUser(assetUser)
        .subscribe(
          result => {
            this.commonService.openNotificationBar(`Asset is now not assigned to ${userName} `, "notification_important", "normal");
            this.getAllAssetUsers();
            this.getAllAssets();
          });
    }

  }

}