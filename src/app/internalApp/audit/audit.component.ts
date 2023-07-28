import { Component, OnInit } from '@angular/core';
import { AuditService } from '../audit.service';
import { AuditInfo } from '../audit';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css']
})
export class AuditComponent implements OnInit {

  auditInfo: AuditInfo[] = [];
  tableNames: string[] = [];
  operationType = ["UPDATE", "INSERT", "DELETE"];
  selectedTable: string;
  selectedoperationType = "UPDATE";
  showProgressBar = false;
  currentDate: Date;
  inputStartDate = new Date();

  selectedDateType = "StartDate";

  constructor(
    private auditService: AuditService
  ) { }

  ngOnInit() {
    this.currentDate = new Date();
    this.getSchemaTableNames();
    this.inputStartDate.setMonth(this.inputStartDate.getMonth() - 1);
  }

  custom_sort(a, b) {
    return b.actionTime - a.actionTime;
  }

  formatDate(date: Date) {
    var d = date;
    return [d.getFullYear(), (d.getMonth() + 1),
    d.getDate(),
    ].join('/') +
      ' ' +
      [d.getHours(),
      d.getMinutes(),
      d.getSeconds()].join(':');
  }

  getAuditInfo() {
    this.showProgressBar = true;
    this.auditService.getAuditInfo(this.selectedTable, this.formatDate(this.inputStartDate), this.selectedDateType === "StartDate" ? "greater" : "lesser", this.selectedoperationType)
      .subscribe(
        result => {

          result.sort(this.custom_sort);
          if (result.length > 100) {
            result.length = 100;
          }

          result.forEach(element => {

            if (element.oldVal === null) {
              element.oldVal = ""
            } else {
              element.oldVal = JSON.stringify(JSON.parse(element.oldVal), undefined, 2);
              element.oldVal = element.oldVal.replace(/"/g, '');
              element.oldVal = element.oldVal.replace(/{/g, '');
              element.oldVal = element.oldVal.replace(/}/g, '');
            }
            if (element.newVal === null) {
              element.newVal = ""
            } else {
              element.newVal = JSON.stringify(JSON.parse(element.newVal), undefined, 2);
              element.newVal = element.newVal.replace(/"/g, '');
              element.newVal = element.newVal.replace(/{/g, '');
              element.newVal = element.newVal.replace(/}/g, '');
            }
          });

          this.auditInfo = result;
          this.showProgressBar = false;
        })
  }

  getSchemaTableNames() {
    this.auditService.getSchemaTableNames()
      .subscribe(
        result => {
          this.tableNames = result;
          if (this.tableNames.length > 1) {
            this.selectedTable = this.tableNames[1];
            this.getAuditInfo();
          }
        })
  }

}
