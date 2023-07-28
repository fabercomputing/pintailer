import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TestcaseDefinitionService } from '../testcase-definition.service';
import { TestCaseDefinition } from '../testcase-definition';

@Component({
  selector: 'app-version-popup',
  templateUrl: './version-popup.component.html',
  styleUrls: ['./version-popup.component.css']
})
export class VersionPopupComponent implements OnInit {

  testCaseIdRecieved: number;
  testCaseDefinition: TestCaseDefinition[] = [];
  testCasesModifiedData: string[] = [];
  firstVersion: number;
  secondVersion: number;
  showDiff = false;
  selection = false;
  currentRow: TestCaseDefinition;

  constructor(
    private testcaseDefinitionService: TestcaseDefinitionService,
    public dialogRef: MatDialogRef<VersionPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.testCaseIdRecieved = data.row.testCaseSequenceId;
    this.selection = data.selection;
  }

  ngOnInit() {
    this.fetchVersionsInfoForTestCases();
  }

  fetchVersionsInfoForTestCases() {
    this.testcaseDefinitionService.getTestCaseVersionInfo(this.testCaseIdRecieved).subscribe(result => {

      result.forEach(function (part, index, theArray) {
        part.modulesNameHierarchy = part.modulesNameHierarchy.replace(/@#/g, '\n⇓\n');
        part.modulesNameHierarchy = part.modulesNameHierarchy.replace(/\\"/g, '"');
        theArray[index].modulesNameHierarchy = part.modulesNameHierarchy;
      });

      this.testCaseDefinition = result;
      this.testCaseDefinition.forEach(element => {
        let testCaseData = (JSON.stringify((element), undefined, 2));
        testCaseData = testCaseData.replace(/"/g, '');
        testCaseData = testCaseData.replace(/{/g, '');
        testCaseData = testCaseData.replace(/}/g, '');
        this.testCasesModifiedData.push(testCaseData);
      });
    });
  }

  selectRow(row: TestCaseDefinition) {
    this.dialogRef.close(row);
  }

}
