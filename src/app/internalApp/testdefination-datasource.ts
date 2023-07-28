import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { TestCaseDefinition } from './testcase-definition';
import { TestcaseDefinitionService } from './testcase-definition.service';

export class TestCaseDataSource implements DataSource<TestCaseDefinition> {

    private lessonsSubject = new BehaviorSubject<TestCaseDefinition[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    public dataLength = false;

    constructor(private testcaseDefinitionService: TestcaseDefinitionService, ) { }

    connect(collectionViewer: CollectionViewer): Observable<TestCaseDefinition[]> {
        return this.lessonsSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.lessonsSubject.complete();
        this.loadingSubject.complete();
    }

    loadCases(clientOrganization: string, clientProjectId: number, applicableCon: string, columnName: string, filter = '',
        sortDirection = 'asc', pageIndex = 0, pageSize = 3) {

        this.dataLength = true;

        this.loadingSubject.next(true);

        this.testcaseDefinitionService.getTestCaseDefinitions(clientOrganization, clientProjectId, applicableCon, columnName, filter, sortDirection,
            pageIndex, pageSize).subscribe(
                testCaseDefinitions => {
                    testCaseDefinitions.forEach(function (part, index, theArray) {
                        part.modulesNameHierarchy = part.modulesNameHierarchy.replace(/@#/g, '\n⇓\n');
                        part.modulesNameHierarchy = part.modulesNameHierarchy.replace(/\\"/g, '"');
                        theArray[index].modulesNameHierarchy = part.modulesNameHierarchy;

                        let allTags: string = part.tags + '';
                        part.tags = [];
                        if (allTags != "") {
                            let tagArray = allTags.split(',');
                            tagArray.forEach(element => {
                                part.tags.push(element);
                            });
                        }

                    });

                    this.lessonsSubject.next(testCaseDefinitions);
                    this.dataLength = false;
                });
    }
}
