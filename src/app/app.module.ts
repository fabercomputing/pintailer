import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from "./app-material/app-material.module";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { LoginComponent } from './login/login.component';
// import { TestcaseDefinitionComponent } from './testcase-definition/testcase-definition.component';
// import { TestcaseDefinitionDetailDialogComponent } from './testcase-definition-detail-dialog/testcase-definition-detail-dialog.component';
// import { TestcaseDefinitionImportDialogComponent } from './testcase-definition-import-dialog/testcase-definition-import-dialog.component';
// import { TestcaseDefinitionAddDialogComponent } from './testcase-definition-add-dialog/testcase-definition-add-dialog.component';
// import { TestcaseExecutionAddDialogComponent } from './testcase-execution-add-dialog/testcase-execution-add-dialog.component';

// import { ClientProjectComponent } from './client-project/client-project.component';

// import { AssetInfoComponent } from './asset-info/asset-info.component';

import { JwtInterceptor, ErrorInterceptor } from './interceptor';
// import { UserProfileComponent } from './user-profile/user-profile.component';
// import { ClientProjectAddComponent } from './client-project-add/client-project-add.component';
// import { ClientProjectEditComponent } from './client-project-edit/client-project-edit.component';
// import { ClientProjectDeleteComponent } from './client-project-delete/client-project-delete.component';
import { HeaderComponent } from './header/header.component';
// import { TestMappingComponent } from './test-mapping/test-mapping.component';
// import { OrgChartComponent } from './org-chart/org-chart.component';
// import { ModuleComponent } from './module/module.component';
// import { GraphReportComponent } from './graph-report/graph-report.component';
// import { EditAssetInfoComponent } from './edit-asset-info/edit-asset-info.component';
// import { TestExecutionImportComponent } from './test-execution-import/test-execution-import.component';
// import { ReleaseMappingComponent } from './release-mapping/release-mapping.component';
// import { ProgressChartComponent } from './progress-chart/progress-chart.component';
// import { ModuleGraphComponent } from './module-graph/module-graph.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AboutComponent } from './about/about.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { PricingComponent } from './pricing/pricing.component';
import { KnowledgeBaseComponent } from './knowledge-base/knowledge-base.component';
import { SupportComponent } from './support/support.component';
// import { HelpComponent } from './help/help.component';
// import { FeatureEditComponent } from './feature-edit/feature-edit.component';
import { TermsComponent } from './terms/terms.component';
import { PaymentComponent } from './payment/payment.component';
import { PintailerVideoComponent } from './pintailer-video/pintailer-video.component';
import { FooterComponent } from './footer/footer.component';
import { RequestDemoComponent } from './request-demo/request-demo.component';
import { CertificationComponent } from './certification/certification.component';
// import { ExistingMappingComponent } from './existing-mapping/existing-mapping.component';
// import { MailBoxComponent } from './mail-box/mail-box.component';
// import { HelpPopupComponent } from './help-popup/help-popup.component';
// import { StepAdditionProgressComponent } from './step-addition-progress/step-addition-progress.component';
// import { DashboardComponent } from './dashboard/dashboard.component';
// import { SettingsComponent } from './settings/settings.component';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ErrorPageComponent } from './error-page/error-page.component';
import { NotificationComponent } from './notification/notification.component';
import { BlogComponent } from './blog/blog.component';
import { BlogArticleComponent } from './blog-article/blog-article.component';
import { ProductFeatureComponent } from './product-feature/product-feature.component';
import { SupportPopupComponent } from './support-popup/support-popup.component';
import { AuthComponent } from './auth/auth.component';
import { LandingComponent } from './landing/landing.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    // TestcaseDefinitionComponent,
    // TestcaseDefinitionDetailDialogComponent,
    // TestcaseDefinitionImportDialogComponent,
    // TestcaseDefinitionAddDialogComponent,
    // TestcaseExecutionAddDialogComponent,
    // ClientProjectComponent,
    // AssetInfoComponent,
    // UserProfileComponent,
    // ClientProjectAddComponent,
    // ClientProjectEditComponent,
    // ClientProjectDeleteComponent,
    HeaderComponent,
    // TestMappingComponent,
    // OrgChartComponent,
    // ModuleComponent,
    // GraphReportComponent,
    // EditAssetInfoComponent,
    // TestExecutionImportComponent,
    // ReleaseMappingComponent,
    // ProgressChartComponent,
    // ModuleGraphComponent,
    ChangePasswordComponent,
    AboutComponent,
    LandingPageComponent,
    PricingComponent,
    KnowledgeBaseComponent,
    SupportComponent,
    // HelpComponent,
    // FeatureEditComponent,
    TermsComponent,
    PaymentComponent,
    PintailerVideoComponent,
    FooterComponent,
    RequestDemoComponent,
    CertificationComponent,
    ErrorPageComponent,
    NotificationComponent,
    BlogComponent,
    BlogArticleComponent,
    ProductFeatureComponent,
    SupportPopupComponent,
    AuthComponent,
    LandingComponent
    // ExistingMappingComponent,
    // MailBoxComponent,
    // HelpPopupComponent,
    // StepAdditionProgressComponent,
    // DashboardComponent,
    // SettingsComponent

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxCaptchaModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  entryComponents: [ChangePasswordComponent, NotificationComponent, SupportPopupComponent]
  // entryComponents: [TestcaseDefinitionDetailDialogComponent, TestcaseDefinitionAddDialogComponent, TestcaseDefinitionImportDialogComponent, TestcaseExecutionAddDialogComponent, ClientProjectEditComponent, ClientProjectDeleteComponent, ClientProjectAddComponent, EditAssetInfoComponent, TestExecutionImportComponent, ChangePasswordComponent, ExistingMappingComponent, HelpPopupComponent]
})
export class AppModule { }
