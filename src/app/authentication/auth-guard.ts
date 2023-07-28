import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { filter, isEmpty } from 'lodash';
import { LoginService } from '../internalApp/login.service'
import { Role } from '../internalApp/role'

@Injectable()
export class AuthGuard implements CanActivate {

    softwareTesterValidRoutes: string[] = ['/dashBoard', '/app/settings', '/app/help', '/app/testCaseDefinition', '/app/testCaseMapping', '/app/userProfile', '/about', '/contact', '/login', '/app/graphReport', '/app/testStepAdditionProgress', '/app/testcaseAdditionProgress', '/app/moduleTreeGraph', '/app/releaseMapping', "/app/featureEdit"];
    adminValidRoutes: string[] = ['/app/pintailerAudit', '/dashBoard', '/app/moduleSetup', '/app/mailBox', '/app/projectSetup', '/app/userSetup', '/app/settings', '/app/help', '/app/moduleSetup', '/app/testCaseDefinition', '/app/testCaseMapping', '/app/userProfile', '/about', '/contact', '/login', '/app/graphReport', '/app/testStepAdditionProgress', '/app/testcaseAdditionProgress', '/app/moduleTreeGraph', '/app/releaseMapping', "/app/featureEdit"];
    humanResourceValidRoutes: string[] = ['/app/assetInfo', '/app/orgChart', '/app/settings', '/app/help', '/app/userProfile', '/about', '/contact', '/login', '/app/mailBox', '/dashBoard'];
    reportViewerValidRoutes: string[] = ['/app/graphReport', '/app/testStepAdditionProgress', '/app/settings', '/app/help', '/app/testcaseAdditionProgress', '/app/userProfile', '/about', '/contact', '/login', '/dashBoard'];

    constructor(
        private router: Router,
        private loginService: LoginService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        //    let stateUrl =  state.url.substring( state.url.indexOf())
        if (this.loginService.getUserInformationFromLocalStorage() != null) {
            const roles: Role[] = [];

            this.loginService.getUserInformationFromLocalStorage().userApplicationsAndRoles.forEach(element => {
                let newRole = new Role();
                newRole.application = element.substr(0, element.indexOf('-'));
                newRole.role = element.substr(element.indexOf('-') + 1, element.length - 1);
                roles.push(newRole);
            });

            const testerRoleObj = filter(roles, function (o) { return (o.application == 'Test Case Management' && o.role == 'Tester') });
            const adminRoleObj = filter(roles, function (o) { return (o.application == 'Test Case Management' && o.role == 'Admin') });
            // const humanResourceRoleObj = filter(roles, function (o) { return (o.application == 'Asset Management' && o.role == 'Admin') || (o.application == 'Asset Management' && o.role == 'Report Viewer') });
            const reportViewerRoleObj = filter(roles, function (o) { return (o.application == 'Test Case Management' && o.role == 'Report Viewer') });

            // console.log("########testerRoleObj : " + isEmpty(testerRoleObj));
            // console.log("########adminRoleObj : " + isEmpty(adminRoleObj));
            // console.log("########humanResourceRoleObj : " + isEmpty(humanResourceRoleObj));
            // console.log("########reportViewerRoleObj : " + isEmpty(reportViewerRoleObj));

            if (!isEmpty(adminRoleObj)) {
                let toReturn = false;
                this.adminValidRoutes.forEach(element => {
                    if (state.url.includes(element)) {
                        toReturn = true;
                    }
                });
                // if (this.softwareTesterValidRoutes.indexOf(state.url) > -1) {
                //     return true;
                // }
                return toReturn;
            }
            if (!isEmpty(testerRoleObj)) {
                let toReturn = false;
                this.softwareTesterValidRoutes.forEach(element => {
                    if (state.url.includes(element)) {
                        toReturn = true;
                    }
                });
                // if (this.softwareTesterValidRoutes.indexOf(state.url) > -1) {
                //     return true;
                // }
                return toReturn;
            }
            // if (!isEmpty(humanResourceRoleObj)) {
            //     let toReturn = false;
            //     this.humanResourceValidRoutes.forEach(element => {
            //         if (state.url.includes(element)) {
            //             toReturn = true;
            //         }
            //     });
            //     return toReturn;
            // }
            if (!isEmpty(reportViewerRoleObj)) {
                let toReturn = false;
                this.reportViewerValidRoutes.forEach(element => {
                    if (state.url.includes(element)) {
                        toReturn = true;
                    }
                });
                return toReturn;
            }
        }
        // not logged in so redirect to login page with the return url
        this.loginService.logout();
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }

}
