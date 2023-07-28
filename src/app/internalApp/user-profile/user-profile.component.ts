import { Component, OnInit, ViewChild } from '@angular/core';
import { LoginService } from "../login.service"
import { UserProfileDetail } from '../user'
import { UserService } from "../user.service";
import { AssingUser } from "../user";
import { AssetInfoService } from "../asset-info.service";
import { AssetInfo } from '../asset-info';
import { UserAllDetail } from '../user';
import { UsersDetail } from "../user";
import { Router } from '@angular/router';
import { MatRipple } from '@angular/material/core';
import { filter, isEmpty } from "lodash";
import { Role } from "../role";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  /** Reference to the directive instance of the ripple. */
  @ViewChild(MatRipple) rippleOne: MatRipple;

  userProfileDetail: UserProfileDetail;
  userProfileDetailOptimized: UserProfileDetail;
  assinedAssetUserInfo: AssingUser[] = [];
  assinedAssetsInfo: AssetInfo[] = [];
  userAllDetail: UserAllDetail[] = [];
  usersDetail: UsersDetail[] = [];
  isUserLoaded: boolean = false;

  userFullName = "";
  userEmails: string[] = [];
  roles: Role[];

  constructor(private loginService: LoginService, private userService: UserService, private assetInfoService: AssetInfoService,
    public router: Router) { }

  ngOnInit() {

    // localStorage.setItem('login-event', 'login' + Math.random());
    this.roles = [];
    if (this.loginService.getUserInformationFromLocalStorage() != null) {
      this.loginService.getUserInformationFromLocalStorage().userApplicationsAndRoles.forEach(element => {
        let newRole = new Role();
        newRole.application = element.substr(0, element.indexOf('-'));
        newRole.role = element.substr(element.indexOf('-') + 1, element.length - 1);
        this.roles.push(newRole);
      });
    }

    if (this.loginService.getUserInformationFromLocalStorage() != null) {

      if (this.roles.length === 1) {
        if (this.roles[0].role === "Report Viewer") {
          this.router.navigate(['/app/graphReport']);
        }
      }
      else {
        // this.router.navigate(['/app/userProfile']);
      }
    }
    else {
    }

    this.showInfo();
    this.showTeamMembersForGroup();
  }

  /** Shows a centered and persistent ripple. */
  launchRipple() {

    const rippleRef = this.rippleOne.launch({
      persistent: true,
      centered: true
    });

    // Fade out the ripple later.
    rippleRef.fadeOut();
  }

  showInfo(): void {
    this.userProfileDetail = this.loginService.getUserInformationFromLocalStorage();
    this.userProfileDetailOptimized = this.loginService.getUserInformationFromLocalStorage();
    this.getAllAssignedAssets();
    this.refactorUserData();

    // Modifing the user name to have first and last name in cappital letter
    let dotPos = this.userProfileDetail.userName.indexOf(".");
    let toChange = this.userProfileDetail.userName;
    let result = this.setCharAt(toChange, dotPos + 1, toChange.charAt(dotPos + 1).toUpperCase());
    result = result.replace(".", " ");
    result = result.replace(toChange.charAt(0), toChange.charAt(0).toUpperCase());
    this.userFullName = result;
  }

  setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substr(0, index) + chr + str.substr(index + 1);
  }

  getAllAssignedAssets(): void {
    this.userService.getAssignedAssetsForUser(this.userProfileDetail.userName).subscribe(userService => {
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

  showTeamMembersForGroup(): void {

    this.userService.getAllUsers("ALL").subscribe(userService => {
      this.usersDetail = userService;
    });
  }

  getUserDetailFor(name): void {
    this.isUserLoaded = true;
    this.userAllDetail = null;
    this.userService.getUserContactDetailForName(name).subscribe(userService => {
      this.userAllDetail = userService;
      this.isUserLoaded = false;

    });
  }

  generateArray(obj) {
    return Object.keys(obj).map((key) => { return { key: key, value: obj[key] } });
  }

  refactorUserData() {
    if (this.userProfileDetailOptimized.email != null) {
      this.userEmails = this.userProfileDetailOptimized.email.split(',');
      // console.log("## " + this.userEmails)
    }

  }

  canShowTestCaseMenu() {
    this.roles = [];
    if (this.loginService.getUserInformationFromLocalStorage() != null) {
      this.loginService.getUserInformationFromLocalStorage().userApplicationsAndRoles.forEach(element => {
        let newRole = new Role();
        newRole.application = element.substr(0, element.indexOf('-'));
        newRole.role = element.substr(element.indexOf('-') + 1, element.length - 1);
        this.roles.push(newRole);
      });
    }

    const roleObj = filter(this.roles, function (o) {
      return (
        (o.application == "Test Case Management" && o.role == "Admin") ||
        (o.application == "Test Case Management" && o.role == "Tester")
      );
    });
    if (!isEmpty(roleObj)) {
      return true;
    }
    return false;
  }

  canShowReportMenuForTesters() {
    this.roles = [];
    if (this.loginService.getUserInformationFromLocalStorage() != null) {
      this.loginService.getUserInformationFromLocalStorage().userApplicationsAndRoles.forEach(element => {
        let newRole = new Role();
        newRole.application = element.substr(0, element.indexOf('-'));
        newRole.role = element.substr(element.indexOf('-') + 1, element.length - 1);
        this.roles.push(newRole);
      });
    }

    const roleObj = filter(this.roles, function (o) {
      return (
        (o.application == "Test Case Management" && o.role == "Admin") ||
        (o.application == "Test Case Management" && o.role == "Tester") ||
        (o.application == "Test Case Management" && o.role == "Report Viewer")
      );
    });
    if (!isEmpty(roleObj)) {
      return true;
    }
    return false;
  }

}
