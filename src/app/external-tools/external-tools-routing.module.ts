import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BddEditorComponent } from './bdd-editor/bdd-editor.component';

const routes: Routes = [
  {
    path: '',
    component: BddEditorComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExternalToolsRoutingModule { }
