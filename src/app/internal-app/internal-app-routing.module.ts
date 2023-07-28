import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../authentication';
import { SampleCompComponent } from '../internalApp/sample-comp/sample-comp.component';
import { GraphReportComponent } from '../internalApp/graph-report/graph-report.component';
import { TestcaseDefinitionComponent } from '../internalApp/testcase-definition/testcase-definition.component'
import { AssetInfoComponent } from '../internalApp/asset-info/asset-info.component'
import { ClientProjectComponent } from '../internalApp/client-project/client-project.component'
import { UserProfileComponent } from '../internalApp/user-profile/user-profile.component'
import { TestMappingComponent } from '../internalApp/test-mapping/test-mapping.component'
import { OrgChartComponent } from '../internalApp/org-chart/org-chart.component'
import { ModuleComponent } from '../internalApp/module/module.component'
import { ReleaseMappingComponent } from '../internalApp/release-mapping/release-mapping.component'
import { ProgressChartComponent } from '../internalApp/progress-chart/progress-chart.component'
import { ModuleGraphComponent } from '../internalApp/module-graph/module-graph.component'
import { HelpComponent } from '../internalApp/help/help.component'
import { FeatureEditComponent } from '../internalApp/feature-edit/feature-edit.component'
import { SettingsComponent } from '../internalApp/settings/settings.component'
import { MailBoxComponent } from '../internalApp/mail-box/mail-box.component'
import { StepAdditionProgressComponent } from '../internalApp/step-addition-progress/step-addition-progress.component'
import { UserSetupComponent } from '../internalApp/user-setup/user-setup.component';
// import { DashboardComponent } from '../internalApp/dashboard/dashboard.component'
import { AuditComponent } from '../internalApp/audit/audit.component';

const routes: Routes = [
  {
    path: '',
    component: SampleCompComponent
  },
  { path: 'graphReport', component: GraphReportComponent, canActivate: [AuthGuard] },
  { path: 'testCaseDefinition', component: TestcaseDefinitionComponent, canActivate: [AuthGuard] },
  { path: 'assetInfo', component: AssetInfoComponent, canActivate: [AuthGuard] },
  { path: 'projectSetup', component: ClientProjectComponent, canActivate: [AuthGuard] },
  { path: 'userProfile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'testCaseMapping', component: TestMappingComponent, canActivate: [AuthGuard] },
  { path: 'orgChart', component: OrgChartComponent, canActivate: [AuthGuard] },
  { path: 'moduleSetup', component: ModuleComponent, canActivate: [AuthGuard] },
  { path: 'testcaseAdditionProgress', component: ProgressChartComponent, canActivate: [AuthGuard] },
  { path: 'moduleTreeGraph', component: ModuleGraphComponent, canActivate: [AuthGuard] },
  { path: 'releaseMapping', component: ReleaseMappingComponent, canActivate: [AuthGuard] },
  { path: 'help', component: HelpComponent },
  { path: 'featureEdit', component: FeatureEditComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'mailBox', component: MailBoxComponent, canActivate: [AuthGuard] },
  { path: 'testStepAdditionProgress', component: StepAdditionProgressComponent, canActivate: [AuthGuard] },
  { path: 'userSetup', component: UserSetupComponent, canActivate: [AuthGuard] },
  // { path: 'dashBoard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'pintailerAudit', component: AuditComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InternalAppRoutingModule { }
