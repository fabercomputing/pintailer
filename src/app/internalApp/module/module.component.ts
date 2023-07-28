import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Observable } from 'rxjs';

import { ModuleItemNode } from '../module'
import { ClientProject } from '../client-project'
import { ClientProjectService } from '../client-project.service'
import { ModuleService } from '../module.service'
import { LoginService } from "../login.service"


@Component({
  selector: 'app-module',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.css']
})
export class ModuleComponent implements OnInit {

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
    private loginService: LoginService,
    private clientProjectService: ClientProjectService,
    private moduleService: ModuleService) {
    this.treeControl = new NestedTreeControl<ModuleItemNode>(this.getChildren);
  }

  ngOnInit() {
    this.color = 'primary';
    this.mode = 'indeterminate';
    this.value = 50;
    this.bufferValue = 75;
    this.showProgressBar = false;
    this.getProjectsByOrganizationName(this.organization);
  }

  getChildren = (node: ModuleItemNode): Observable<ModuleItemNode[]> => node.children;

  hasNoContent = (_nodeData: ModuleItemNode) => { return _nodeData.item === ''; };

  /** Select the category so we can insert the new item. */
  addNewItem(node: ModuleItemNode) {
    this.moduleService.insertNode(node, '');
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: ModuleItemNode, itemValue: string, isRoot) {
    this.moduleService.updateModuleTree(node, itemValue, this.organization, this.clientProjectId, this.loginService.getUserInformationFromLocalStorage().userName)
      .subscribe(
        result => {
          this.dataSource = this.moduleService.data;
          this.showProgressBar = false;
          // this.getModulesTreeByProjectId(this.clientProjectId);
          //  if(isRoot) {this.getModulesTreeByProjectId(this.clientProjectId);}
        });
  }

  /** update Node Information */
  updateNode(node: ModuleItemNode, itemValue: string) {
    this.moduleService.updateModuleDetail(node, itemValue, this.organization, this.clientProjectId, this.loginService.getUserInformationFromLocalStorage().userName)
      .subscribe(
        result => {
          // this.dataSource = this.moduleService.data;
          // this.showProgressBar = false;
          this.getModulesTreeByProjectId(this.clientProjectId);
        });
  }

  saveRootNode() {
    const value = document.getElementById("newRootModule")["value"];
    document.getElementById("newRootModule")["value"] = "";
    const node = new ModuleItemNode(value, 0, 0);
    this.saveNode(node, value, true);
  }

  getProjectsByOrganizationName(name: string) {
    this.organization = name;
    this.clientProjectService.getClientProjects()
      .subscribe(
        result => {
          if (result != undefined)
            this.clientProjects = result;
        });
  }

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

}
