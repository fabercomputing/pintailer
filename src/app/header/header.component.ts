import { Component, OnInit } from "@angular/core";
import { filter, isEmpty } from "lodash";

import { LoginService } from "../internalApp/login.service";
import { TestMappingService } from "../internalApp/test-mapping.service";
import { Role } from "../internalApp/role";
import { Router } from '@angular/router';
import { NotificationComponent } from '../notification/notification.component';
import { MatDialog } from '@angular/material';
import { fadeInOut, EnterLeave } from '../internalApp/animations';

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
  animations: [
    fadeInOut, EnterLeave
  ]
})
export class HeaderComponent implements OnInit {
  roles: Role[];
  currentPageName: string;
  extraMenuName = "menu";

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private loginService: LoginService,
    private testMappingService: TestMappingService
  ) { }

  ngOnInit() {

    let routerVar = this.router;

    window.addEventListener('storage', function (event) {
      if (event.key == 'logout-event') {
        routerVar.navigate(['/login']);
      }
    });

    // window.addEventListener('storage', function (event) {
    //   if (event.key == 'login-event') {
    //     routerVar.navigate(['/app/userProfile']);
    //   }
    // });

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

  canShowTestCaseMenu() {
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
        (o.application == "Test Case Management" && o.role == "Admin") ||
        (o.application == "Test Case Management" && o.role == "Tester")
      );
    });
    if (!isEmpty(roleObj)) {
      return true;
    }
    return false;
  }

  canShowAssetMenu() {
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
        (o.application == "Asset Management" && o.role == "Admin") ||
        (o.application == "Asset Management" && o.role == "Report Viewer")
      );
    });
    if (!isEmpty(roleObj)) {
      return true;
    }
    return false;
  }

  canShowReportMenu() {
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
        (o.application == "Asset Management" && o.role == "Admin") ||
        (o.application == "Asset Management" && o.role == "Report Viewer")
      );
    });
    if (!isEmpty(roleObj)) {
      return true;
    }
    return false;
  }

  canShowReportMenuForTesters() {
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

  canShowonlyReports() {
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
          return false;
        } else {
          return true;
        }
      }
      else {
        return true;
      }
    }
    else {
      return false;
    }
  }

  canShowProfileMenu() {
    if (this.loginService.getUserInformationFromLocalStorage() != null) {
      return true;
    }
    return false;
  }

  // Temporary button for dummy data insert: For only rishi sir
  // canShowTempButton() {
  //   if (this.loginService.getUserInformationFromLocalStorage() != null) {
  //     if (
  //       this.loginService.getUserInformationFromLocalStorage().userName ===
  //       "rishi.singhal"
  //     ) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   }
  // }

  addDummyData() {
    // this.testMappingService.addDummyData().subscribe(result => { });
  }

  canShowLogoutMenu() {
    if (this.loginService.getUserInformationFromLocalStorage() != null) {
      return true;
    }
    return false;
  }

  userNotLogIn() {
    if (this.loginService.getUserInformationFromLocalStorage() != null) {
      return false;
    }
    return true;
  }

  getNavButtonClass(urlPath) {
    this.currentPageName = window.location.pathname;
    return window.location.pathname === urlPath ? "selectedTab" : "notSelectedTab";
  }

  getNavButtonParentClass(buttonName) {

    let reportTabs = ["/app/orgChart", "/app/graphReport", "/app/testcaseAdditionProgress", "/app/moduleTreeGraph", "/app/testStepAdditionProgress"];
    let testcaseTabs = ["/app/testCaseDefinition", "/app/testCaseMapping", "/app/releaseMapping", "/app/featureEdit"];
    let setupTabs = ["/app/moduleSetup", "/app/projectSetup", "/app/userSetup"];
    let profileTabs = ["/dashBoard"];
    let productHomeTabs = ["/"];
    let pricingTabs = ["/pricing"];
    // let featuresTabs = ["/features"];
    let blogTabs = ["/blog"];
    let knowledgeBaseTabs = ["/knowledgeBase"];
    let supportTabs = ["/support"];
    let resourceTabs = ["/pintailerDemo", "/requestDemo", "/certification"];

    if (buttonName === "report") {
      if (reportTabs.includes(this.currentPageName)) {
        return "selectedParentTab";
      } else {
        return "notSelectedTab";
      }
    } else if (buttonName === "setup") {
      if (setupTabs.includes(this.currentPageName)) {
        return "selectedParentTab";
      } else {
        return "notSelectedTab";
      }
    } else if (buttonName === "testcase") {
      if (testcaseTabs.includes(this.currentPageName)) {
        return "selectedParentTab";
      } else {
        return "notSelectedTab";
      }
    } else if (buttonName === "profile") {
      if (profileTabs.includes(this.currentPageName)) {
        return "selectedParentTab";
      } else {
        return "notSelectedTab";
      }
    } else if (buttonName === "productHome") {
      if (productHomeTabs.includes(this.currentPageName)) {
        return "selectedParentOuterTab";
      } else {
        return "notSelectedOuterTab";
      }
    } else if (buttonName === "pricing") {
      if (pricingTabs.includes(this.currentPageName)) {
        return "selectedParentOuterTab";
      } else {
        return "notSelectedOuterTab";
      }
    } else if (buttonName === "blog") {
      if (blogTabs.includes(this.currentPageName)) {
        return "selectedParentOuterTab";
      } else {
        return "notSelectedOuterTab";
      }
    } else if (buttonName === "knowledgeBase") {
      if (knowledgeBaseTabs.includes(this.currentPageName)) {
        return "selectedParentTab";
      } else {
        return "notSelectedTab";
      }
    } else if (buttonName === "support") {
      if (supportTabs.includes(this.currentPageName)) {
        return "selectedParentOuterTab";
      } else {
        return "notSelectedOuterTab";
      }
    }
    else if (buttonName === "resource") {
      if (resourceTabs.includes(this.currentPageName)) {
        return "selectedParentOuterTab";
      } else {
        return "notSelectedOuterTab";
      }
    }

  }

  getPageInfo() {
    var text = window.location.pathname;
    text = text.replace("/", "");

    if (text.includes("content")) {
      return "";
    }

    let notValidPageHeading = ["login", "pricing", "features", "support", "dashBoard", "about", "pintailerTerms", "blog", "pintailerDemo", "featureFileEditor", "app/graphReport", "error", "requestDemo", "certification"];

    if (!notValidPageHeading.includes(text)) {
      var result = text.replace("app/", "");
      result = result.replace(/([A-Z])/g, " $1");
      var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
      return finalResult;
    }

    // if (text === "app/graphReport") {
    //   return "Coverage & Execution Reports";
    // }
  }

  getDefaultOrg() {
    if (this.loginService.getUserInformationFromLocalStorage() != null) {
      return this.loginService.getUserInformationFromLocalStorage().defaultOrganization;
    }
  }

  logoutCheck() {
    this.openNotificationBar("Are you sure about logging out?", "warning", "logout");
  }

  startTutorial() {
    this.router.navigate(['/dashBoard'], { queryParams: { appWalkthroughIntro: "ProjectSetup" } });
  }

  openNotificationBar(message: string, type: string, action: string) {
    let dialogRef = this.dialog.open(NotificationComponent, {
      data: {
        notificaitonDataReceived: message,
        notificaitonTypeReceived: type,
        notificaitonActionReceived: action,
      },
      disableClose: true,
      panelClass: 'notificaiton-dialog-container'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === "ok") {
        this.loginService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

}
