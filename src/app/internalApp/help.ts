import { BehaviorSubject } from 'rxjs';

export class Help {
    topicParentId: number;
    topicId: number;
    title: string;
    hierarchy: string;
    createdBy: string;
    modifiedBy: string;
    createdDate: number;
    modifiedDate: number;
    children: Help[];
}

export class HelpDetail {
    detailId: number;
    helpText: string;
    topicId: number;
    createdBy: string;
    modifiedBy: string;
    createdDate: number;
    modifiedDate: number;
}


/**
 * Node for to-do item
 */
export class HelpItemNode {
    children: BehaviorSubject<HelpItemNode[]>;
    constructor(public item: string, public itemNum: number, children?: HelpItemNode[], public parent?: HelpItemNode) {
        this.children = new BehaviorSubject(children === undefined ? [] : children);
    }
}