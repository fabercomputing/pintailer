import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Observable } from 'rxjs';

import { ModuleItemNode } from '../module'
import { ClientProject } from '../client-project'
import { ModuleService } from '../module.service'
import { LoginService } from "../login.service"
import { Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export class ModulePopupData {
  nodeName: string;
  nodeId: number
}

@Component({
  selector: 'app-module-selection',
  templateUrl: './module-selection.component.html',
  styleUrls: ['./module-selection.component.css']
})
export class ModuleSelectionComponent implements OnInit {

  moduleDataReceived: string;
  moduleProjectReceived: number;

  // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string = this.loginService.getUserInformationFromLocalStorage().defaultOrganization;
  clientProjects: ClientProject[] = [];
  clientProjectId: number;
  color: string;
  mode: string;
  value: number;
  bufferValue: number;
  showProgressBar: boolean;

  treeControl: NestedTreeControl<ModuleItemNode>;

  dataSource: ModuleItemNode[];
  isLoaded = true;

  constructor(
    public dialogRef: MatDialogRef<ModuleSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loginService: LoginService,
    private moduleService: ModuleService
  ) {
    this.moduleDataReceived = data.moduleDataReceived;
    this.moduleProjectReceived = data.moduleProjectReceived;
    this.treeControl = new NestedTreeControl<ModuleItemNode>(this.getChildren);
  }

  ngOnInit() {
    this.color = 'primary';
    this.mode = 'indeterminate';
    this.value = 50;
    this.bufferValue = 75;
    this.showProgressBar = false;
    // this.getProjectsByOrganizationName(this.organization);
    this.getModulesTreeByProjectId(this.moduleProjectReceived);
  }

  getChildren = (node: ModuleItemNode): Observable<ModuleItemNode[]> => node.children;

  hasNoContent = (_nodeData: ModuleItemNode) => { return _nodeData.item === ''; };


  getModulesTreeByProjectId(projectId: number) {
    this.showProgressBar = true;
    this.clientProjectId = projectId;
    this.moduleService.getModulesTree(projectId)
      .subscribe(
        result => {
          this.dataSource = this.moduleService.data;
          this.showProgressBar = false;
        });
  }

  filterModuleTree() {
    //TODO
  }

  selectModule(nodeName: string, nodeId: number) {
    let modulePopupData = new ModulePopupData();
    modulePopupData.nodeName = nodeName;
    modulePopupData.nodeId = nodeId;
    this.dialogRef.close(modulePopupData);
  }

  selectAllModules(){
    let modulePopupData = new ModulePopupData();
    modulePopupData.nodeName = "All Module Selected";
    modulePopupData.nodeId = 0;
    this.dialogRef.close(modulePopupData);
  }

}
