import { Component, OnInit, ViewChild } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Observable } from 'rxjs';

import { HelpItemNode, HelpDetail } from '../help'
import { ClientProject } from '../client-project'
import { ClientProjectService } from '../client-project.service'
import { HelpServiceService } from '../help-service.service'
import { LoginService } from "../login.service"
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  @ViewChild('sidenav') sidenav: MatSidenav;

  reason = '';

  close(reason: string) {
    this.reason = reason;
    this.sidenav.close();
  }

  shouldRun = true;

  organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string;
  clientProjects: ClientProject[] = [];
  clientProjectId: number;
  color: string;
  mode: string;
  value: number;
  bufferValue: number;
  showProgressBar: boolean;
  helpTopicOpen: string;

  treeControl: NestedTreeControl<HelpItemNode>;

  dataSource: HelpItemNode[];
  isLoaded = true;

  itr = 0;
  helpDetailHtml: HelpDetail[] = [];

  constructor(
    private loginService: LoginService,
    private clientProjectService: ClientProjectService,
    private helpService: HelpServiceService) {
    this.treeControl = new NestedTreeControl<HelpItemNode>(this.getChildren);
  }

  ngOnInit() {
    this.color = 'primary';
    this.mode = 'indeterminate';
    this.value = 50;
    this.bufferValue = 75;
    this.showProgressBar = false;
    this.getHelpTreeByProjectId();
    this.getHelpDetails();
  }

  // ngAfterViewInit() {
  //   this.tree.treeControl.expandAll();
  // }

  getChildren = (node: HelpItemNode): Observable<HelpItemNode[]> => node.children;

  hasNoContent = (_nodeData: HelpItemNode) => { return _nodeData.item === ''; };

  /** Select the category so we can insert the new item. */
  // addNewItem(node: HelpItemNode) {
  //   this.moduleService.insertNode(node, '');
  //   this.treeControl.expand(node);
  // }

  // /** Save the node to database */
  // saveNode(node: ModuleItemNode, itemValue: string, isRoot) {
  //   this.moduleService.updateModuleTree(node, itemValue, this.organization, this.clientProjectId, this.loginService.getUserInformationFromLocalStorage().userName)
  //     .subscribe(
  //       result => {
  //        if(isRoot) {this.getHelpTreeByProjectId(this.clientProjectId);}
  //       });
  // }

  // saveRootNode(){
  //   const value  = document.getElementById("newRootModule")["value"];
  //   document.getElementById("newRootModule")["value"] = "";
  //   const node = new ModuleItemNode(value);
  //   this.saveNode(node, value, true);
  // }

  getProjectsByOrganizationName(name: string) {
    this.organization = name;
    this.clientProjectService.getClientProjects()
      .subscribe(
        result => {
          if (result != undefined)
            this.clientProjects = result;
        });
  }

  getHelpTreeByProjectId() {
    this.showProgressBar = true;
    this.helpService.getHelpTree()
      .subscribe(
        result => {
          this.dataSource = this.helpService.data;
          this.showProgressBar = false;
          // console.log("^^ " + JSON.stringify(this.dataSource))

          // this.treeControl.expandDescendants(this.dataSource[0]);
          this.treeControl.expand(this.dataSource[0]);
          this.sidenav.open();
          setTimeout(function () {

            let divsToHide: any;
            divsToHide = document.getElementsByClassName("detailHelp"); //divsToHide is an array
            for (var i = 1; i < divsToHide.length; i++) {
              console.log("&&&&&&")
              divsToHide[i].style.display = "none"; // depending on what you're doing
            }
          }, 2000);

        });
  }

  getHelpDetails(): void {
    this.helpService.getHelpDetails().subscribe(result => {
      this.helpDetailHtml = result;
    });
  }

  scrollToDetail(topicId: number) {
    let divsToHide: any;
    divsToHide = document.getElementsByClassName("detailHelp"); //divsToHide is an array
    for (var i = 0; i < divsToHide.length; i++) {
      divsToHide[i].style.display = "none"; // depending on what you're doing
    }

    let elem = document.getElementById(topicId.toString())
    if (elem != null) {
      elem.style.display = "block";

      window.scroll({
        behavior: 'smooth',
        left: 0,
        top: document.getElementById(topicId.toString()).offsetTop
      });
    }
  }


  filterModuleTree() {
    //TODO
  }
}
