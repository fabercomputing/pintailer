import { Component, OnInit } from '@angular/core';
import { LoginService } from "../login.service"
import { SettingsService } from "../settings.service"
import { UserProfileDetail } from '../user';
import { FormControl } from '@angular/forms';
import { OrganizationInfo } from '../user';
import { UserService } from "../user.service";
import { UsersDetail } from '../user';
import { ClientProjectService } from '../client-project.service'
import { ClientProject } from '../client-project'
import { CommonService } from '../common.service'
import { Router } from '@angular/router';
import { Role } from "../role";
import { filter, isEmpty } from "lodash";

@Component({
  selector: 'app-user-setup',
  templateUrl: './user-setup.component.html',
  styleUrls: ['./user-setup.component.css']
})
export class UserSetupComponent implements OnInit {

  // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  // organization: string = this.organizations[0];
  usersDetail: UsersDetail[] = [];
  clientProjects: ClientProject[] = [];
  clientProjectId: number;

  organizations: OrganizationInfo[] = [];
  organization: string = "";
  userList = new FormControl();
  projectList = new FormControl();
  roles: Role[];
  dataLoading = false;

  currentOpenSettings = "assignUserOrgSection"
  screenHeight = "0";

  constructor(
    private loginService: LoginService, private commonService: CommonService, private router: Router,
    private settingsService: SettingsService,
    private userService: UserService,
    private clientProjectService: ClientProjectService
  ) { }

  ngOnInit() {
    this.getAllAssignedOrg();
    // this.screenHeight = screen.height - 200 + "px";
  }

  setDefaultOrg() {
    if (window.confirm("After setting default Organization, you have to Re-Login into Pintailer.")) {
      let userProfileDetail = new UserProfileDetail();
      userProfileDetail = this.loginService.getUserInformationFromLocalStorage();

      if (this.organization != "") {
        this.settingsService.setDefaultOrg(userProfileDetail, this.organization).subscribe(result => {
          this.commonService.openNotificationBar("Please Log in again.", "notification_important", "normal");
          this.loginService.logout();
          this.router.navigate(['/login']);
        });
      } else {
        this.commonService.openNotificationBar("Choose a Organization first", "error", "normal");
      }
    }
  }

  getAllAssignedOrg() {
    let userName = this.loginService.getUserInformationFromLocalStorage().userName;
    this.settingsService.getAllAssignedOrg(userName).subscribe(result => {
      this.organizations = result;
      if (this.organizations.length === 1) {
        this.organization = this.organizations[0].orgName;
        if (this.canShowProjectMenu()) {
          this.getAllUsersForOrg();
          this.getProjectsByOrganizationName();
        }
      }
    });

  }

  assignUserToProject() {
    if (this.organization != "") {
      if (this.projectList.value != null && this.projectList.value != "") {
        if (this.userList.value && this.userList.value != "") {
          this.settingsService.assignUserToProject(this.organization, this.projectList.value, this.userList.value).subscribe(userService => {
            this.commonService.openNotificationBar("User Assigned, All Users need to Re-Login again to see the changes.", "notification_important", "normal");
          });
        } else {
          this.commonService.openNotificationBar("Please choose Users", "error", "normal");
        }
      } else {
        this.commonService.openNotificationBar("Please choose Projects", "error", "normal");
      }
    } else {
      this.commonService.openNotificationBar("Choose a Organization first", "error", "normal");
    }
  }

  getAllUsersForOrg(): void {
    this.dataLoading = true;
    if (this.organization != "") {
      this.userService.getAllUsers(this.organization).subscribe(userService => {
        this.usersDetail = userService;
        // console.log("***** " + JSON.stringify(this.usersDetail))
        this.dataLoading = false;
      });
    }
  }

  getProjectsByOrganizationName() {
    if (this.organization != "") {
      this.clientProjectService.getAllClientProjectsForGivenOrg(this.organization)
        .subscribe(
          result => {
            this.clientProjects = result;
            if (this.clientProjects.length === 0) {
              this.clientProjectId = 0;
            } else {
              this.clientProjectId = this.clientProjects[0].clientProjectId;
            }
            // this.loadDynamicData(this.clientProjectId);
          });
      // this.getTestCaseDefinitions(this.clientProjectId);
    }
  }

  getDefaultOrg() {
    if (this.loginService.getUserInformationFromLocalStorage() != null) {
      return this.loginService.getUserInformationFromLocalStorage().defaultOrganization;
    }
  }

  canShowProjectMenu() {
    // this.roles =
    //   this.loginService.getUserInformationFromLocalStorage() != null
    //     ? this.loginService.getUserInformationFromLocalStorage().userApplicationsAndRoles
    //     : [];
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
        (o.application == "Test Case Management" && o.role == "Admin")
      );
    });
    if (!isEmpty(roleObj)) {
      return true;
    }
    return false;
  }

  refreshUserAndProjectData() {
    if (this.canShowProjectMenu()) {
      this.getAllUsersForOrg();
      this.getProjectsByOrganizationName();
    }
  }

}
