import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../app-material/app-material.module';
import { ErrorInterceptor, JwtInterceptor } from '../interceptor';
import { AppWalkthroughComponent } from './app-walkthrough/app-walkthrough.component';
import { DashboardModuleRoutingModule } from './dashboard-module-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [DashboardComponent, AppWalkthroughComponent],
  imports: [
    CommonModule,
    DashboardModuleRoutingModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
})
export class DashboardModuleModule { }
