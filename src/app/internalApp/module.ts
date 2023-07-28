import { BehaviorSubject } from 'rxjs';

export class Module {
  moduleId: number;
  name: string;
  moduleParentId: number;
  clientProjectsId: number;
  hierarchy: string;
  createdBy: string;
  modifiedBy: string;
  createdDate: number;
  modifiedDate: number;
  deleted: boolean;
  children: Module[];
}


/**
 * Node for to-do item
 */
export class ModuleItemNode {
  children: BehaviorSubject<ModuleItemNode[]>;
  constructor(public item: string, public itemId: number, public itemParentId: number, children?: ModuleItemNode[], public parent?: ModuleItemNode) {
    this.children = new BehaviorSubject(children === undefined ? [] : children);
  }
}

export class ModuleTreeInsert {
  userName: string
  parentModuleId: number;
  newModuleName: string;
  projectId: number;
  clientOrganization: string;
}
