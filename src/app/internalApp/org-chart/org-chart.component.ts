import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import { UserService } from "../user.service";
import { UsersDetail } from "../user";
import { AllGroupsInfo } from '../all-group';
import { UserAllDetail } from '../user';
import { AssetInfo } from '../asset-info';
import { AssingUser } from "../user";
import { AssetInfoService } from "../asset-info.service";

@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.css']
})
export class OrgChartComponent implements OnInit {

  usersDetail: UsersDetail[] = [];
  allGroupInfo: AllGroupsInfo[] = [];
  userAllDetail: UserAllDetail[] = [];
  grpNameArr: string[] = [];
  isLoaded: boolean = false;
  isUserLoaded: boolean = false;

  assinedAssetsInfo: AssetInfo[] = [];
  assinedAssetUserInfo: AssingUser[] = [];

  constructor(private userService: UserService, private assetInfoService: AssetInfoService) { }

  ngOnInit() {

    this.getAllGroups();

  }

  onLinkClick(event: MatTabChangeEvent) {
    this.allGroupInfo.forEach((item, index) => {
      if (item.des === event.tab.textLabel) {

        this.grpNameArr = item.names.split(',');

      }
    });

  }

  getAllGroups(): void {
    this.userService.getAllGroups().subscribe(userService => {
      this.allGroupInfo = userService;

    });
  }

  showTeamMembersForGroup(name): void {
    this.usersDetail = null;
    this.isLoaded = true;
    this.userService.getAllUsers(name).subscribe(userService => {
      this.usersDetail = userService;
      this.isLoaded = false;
    });
  }

  getUserDetailFor(name): void {
    this.userAllDetail = null;
    this.isUserLoaded = true;
    this.userService.getUserDetailForName(name).subscribe(userService => {
      this.userAllDetail = userService;
      this.isUserLoaded = false;
    });
  }

  generateArray(obj) {
    return Object.keys(obj).map((key) => { return { key: key, value: obj[key] } });
  }

  getAllAssignedAssets(name): void {
    this.assinedAssetsInfo.length = 0;
    this.userService.getAssignedAssetsForUser(name).subscribe(userService => {
      this.assinedAssetUserInfo = userService;

      this.getParticularAssetInfo();
    })

  }

  getParticularAssetInfo(): void {
    this.assinedAssetUserInfo.forEach((item, index) => {

      this.assetInfoService.getAssetInfoForID(item.assetInfoId).subscribe(userService => {
        this.assinedAssetsInfo.push(userService);

      })
    });

  }

}