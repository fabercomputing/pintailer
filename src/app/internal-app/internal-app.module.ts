
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppMaterialModule } from "../app-material/app-material.module";
import { CommonModule } from '@angular/common';

import { InternalAppRoutingModule } from './internal-app-routing.module';
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
// import { DashboardComponent } from '../internalApp/dashboard/dashboard.component'
import { TestcaseDefinitionDetailDialogComponent } from '../internalApp/testcase-definition-detail-dialog/testcase-definition-detail-dialog.component';
import { TestcaseDefinitionImportDialogComponent } from '../internalApp/testcase-definition-import-dialog/testcase-definition-import-dialog.component';
import { TestcaseDefinitionAddDialogComponent } from '../internalApp/testcase-definition-add-dialog/testcase-definition-add-dialog.component';
import { TestcaseExecutionAddDialogComponent } from '../internalApp/testcase-execution-add-dialog/testcase-execution-add-dialog.component';
import { ClientProjectAddComponent } from '../internalApp/client-project-add/client-project-add.component';
import { ClientProjectEditComponent } from '../internalApp/client-project-edit/client-project-edit.component';
import { ClientProjectDeleteComponent } from '../internalApp/client-project-delete/client-project-delete.component';
import { EditAssetInfoComponent } from '../internalApp/edit-asset-info/edit-asset-info.component';
import { TestExecutionImportComponent } from '../internalApp/test-execution-import/test-execution-import.component';
import { ExistingMappingComponent } from '../internalApp/existing-mapping/existing-mapping.component';
import { HelpPopupComponent } from '../internalApp/help-popup/help-popup.component';
import { JwtInterceptor, ErrorInterceptor } from '../interceptor';
import { UserSetupComponent } from '../internalApp/user-setup/user-setup.component';
import { ContextMenuComponent } from '../internalApp/context-menu/context-menu.component';
import { ModuleSelectionComponent } from '../internalApp/module-selection/module-selection.component';
import { AuditComponent } from '../internalApp/audit/audit.component';
import { DiffMatchPatchModule } from 'ng-diff-match-patch';
import { VersionPopupComponent } from '../internalApp/version-popup/version-popup.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ShowTestCaseComponent } from '../internalApp/show-test-case/show-test-case.component';
import { AttachBugComponent } from '../internalApp/attach-bug/attach-bug.component';
import { BugInfoBoxComponent } from '../internalApp/bug-info-box/bug-info-box.component';
import { FileDropModule } from 'ngx-file-drop';

@NgModule({
  declarations: [
    SampleCompComponent,
    GraphReportComponent,
    TestcaseDefinitionComponent,
    TestcaseDefinitionDetailDialogComponent,
    TestcaseDefinitionImportDialogComponent,
    TestcaseDefinitionAddDialogComponent,
    TestcaseExecutionAddDialogComponent,
    ClientProjectComponent,
    AssetInfoComponent,
    UserProfileComponent,
    ClientProjectAddComponent,
    ClientProjectEditComponent,
    ClientProjectDeleteComponent,
    TestMappingComponent,
    OrgChartComponent,
    ModuleComponent,
    EditAssetInfoComponent,
    TestExecutionImportComponent,
    ReleaseMappingComponent,
    ProgressChartComponent,
    ModuleGraphComponent,
    HelpComponent,
    FeatureEditComponent,
    SettingsComponent,
    ExistingMappingComponent,
    MailBoxComponent,
    HelpPopupComponent,
    StepAdditionProgressComponent,
    UserSetupComponent,
    ContextMenuComponent,
    ModuleSelectionComponent,
    AuditComponent,
    VersionPopupComponent,
    ShowTestCaseComponent,
    AttachBugComponent,
    BugInfoBoxComponent
    // DashboardComponent,
  ],
  imports: [
    CommonModule,
    InternalAppRoutingModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DiffMatchPatchModule,
    CodemirrorModule,
    FileDropModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  entryComponents:
    [
      TestcaseDefinitionDetailDialogComponent,
      TestcaseDefinitionAddDialogComponent,
      TestcaseDefinitionImportDialogComponent,
      TestcaseExecutionAddDialogComponent,
      ClientProjectEditComponent,
      ClientProjectDeleteComponent,
      ClientProjectAddComponent,
      EditAssetInfoComponent,
      TestExecutionImportComponent,
      ExistingMappingComponent,
      HelpPopupComponent,
      ModuleSelectionComponent,
      VersionPopupComponent,
      ShowTestCaseComponent,
      AttachBugComponent,
      BugInfoBoxComponent
    ]
})
export class InternalAppModule { }
