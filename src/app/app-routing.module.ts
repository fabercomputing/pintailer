import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './authentication';

import { LoginComponent } from './login/login.component';
// import { TestcaseDefinitionComponent } from './testcase-definition/testcase-definition.component'
// import { AssetInfoComponent } from './asset-info/asset-info.component'
// import { ClientProjectComponent } from './client-project/client-project.component'
// import { UserProfileComponent } from './user-profile/user-profile.component'
// import { TestMappingComponent } from './test-mapping/test-mapping.component'
// import { OrgChartComponent } from './org-chart/org-chart.component'
// import { ModuleComponent } from './module/module.component'
// import { GraphReportComponent } from './graph-report/graph-report.component'
// import { ReleaseMappingComponent } from './release-mapping/release-mapping.component'
// import { ProgressChartComponent } from './progress-chart/progress-chart.component'
// import { ModuleGraphComponent } from './module-graph/module-graph.component'
import { AboutComponent } from './about/about.component'
import { LandingPageComponent } from './landing-page/landing-page.component'
import { KnowledgeBaseComponent } from './knowledge-base/knowledge-base.component'
import { SupportComponent } from './support/support.component'
import { PricingComponent } from './pricing/pricing.component'
// import { HelpComponent } from './help/help.component'
// import { FeatureEditComponent } from './feature-edit/feature-edit.component'
import { TermsComponent } from './terms/terms.component'
import { PaymentComponent } from './payment/payment.component'
import { PintailerVideoComponent } from './pintailer-video/pintailer-video.component'
import { RequestDemoComponent } from './request-demo/request-demo.component'
import { CertificationComponent } from './certification/certification.component'
// import { MailBoxComponent } from './mail-box/mail-box.component'
// import { StepAdditionProgressComponent } from './step-addition-progress/step-addition-progress.component'
// import { DashboardComponent } from './dashboard/dashboard.component'
// import { SettingsComponent } from './settings/settings.component'
import { ErrorPageComponent } from './error-page/error-page.component'
import { BlogComponent } from './blog/blog.component';
import { BlogArticleComponent } from './blog-article/blog-article.component';
import { ProductFeatureComponent } from './product-feature/product-feature.component';
import { AuthComponent } from './auth/auth.component';
import { LandingComponent } from './landing/landing.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'auth', component: AuthComponent },
  // { path: 'testCaseDefinition', component: TestcaseDefinitionComponent, canActivate: [AuthGuard] },
  // { path: 'assetInfo', component: AssetInfoComponent, canActivate: [AuthGuard] },
  // { path: 'app/projectSetup', component: ClientProjectComponent, canActivate: [AuthGuard] },
  // { path: 'app/userProfile', component: UserProfileComponent, canActivate: [AuthGuard] },
  // { path: 'app/testCaseMapping', component: TestMappingComponent, canActivate: [AuthGuard] },
  // { path: 'app/orgChart', component: OrgChartComponent, canActivate: [AuthGuard] },
  // { path: 'app/moduleSetup', component: ModuleComponent, canActivate: [AuthGuard] },
  // { path: 'app/graphReport', component: GraphReportComponent, canActivate: [AuthGuard] },
  // { path: 'app/testcaseAdditionProgress', component: ProgressChartComponent, canActivate: [AuthGuard] },
  // { path: 'app/moduleTreeGraph', component: ModuleGraphComponent, canActivate: [AuthGuard] },
  // { path: 'app/releaseMapping', component: ReleaseMappingComponent, canActivate: [AuthGuard] },
  { path: 'about', component: AboutComponent },
  { path: '', component: ProductFeatureComponent },
  { path: 'knowledgeBase', component: KnowledgeBaseComponent, canActivate: [AuthGuard] },
  { path: 'support', component: SupportComponent },
  { path: 'pricing', component: PricingComponent },
  // { path: 'help', component: HelpComponent },
  // { path: 'app/featureEdit', component: FeatureEditComponent, canActivate: [AuthGuard] },
  { path: 'pintailerTerms', component: TermsComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'pintailerDemo', component: PintailerVideoComponent },
  { path: 'requestDemo', component: RequestDemoComponent },
  { path: 'certification', component: CertificationComponent },
  { path: 'features', component: ProductFeatureComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'content', component: BlogArticleComponent },
  {
    path: 'dashBoard',
    loadChildren: './dashboard-module/dashboard-module.module#DashboardModuleModule',
    canActivate: [AuthGuard]
  },
  // { path: 'app/mailBox', component: MailBoxComponent, canActivate: [AuthGuard] },
  // { path: 'app/testStepAdditionProgress', component: StepAdditionProgressComponent, canActivate: [AuthGuard] },
  // { path: 'dashBoard', component: DashboardComponent, canActivate: [AuthGuard] },
  // { path: 'settings', component: SettingsComponent },
  {
    path: 'app',
    loadChildren: './internal-app/internal-app.module#InternalAppModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'featureFileEditor',
    loadChildren: './external-tools/external-tools.module#ExternalToolsModule'
  },
  { path: "error", component: ErrorPageComponent },
  { path: "**", redirectTo: "/error", pathMatch: 'full' }
]

export const routing = RouterModule.forRoot(routes);

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [
    RouterModule
  ],
  declarations: [],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
