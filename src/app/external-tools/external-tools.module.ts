import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppMaterialModule } from "../app-material/app-material.module";
import { CommonModule } from '@angular/common';

import { ExternalToolsRoutingModule } from './external-tools-routing.module';
import { BddEditorComponent } from './bdd-editor/bdd-editor.component';
import { DiffMatchPatchModule } from 'ng-diff-match-patch';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

@NgModule({
  declarations: [BddEditorComponent],
  imports: [
    CommonModule,
    ExternalToolsRoutingModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DiffMatchPatchModule,
    CodemirrorModule
  ]
})
export class ExternalToolsModule { }
