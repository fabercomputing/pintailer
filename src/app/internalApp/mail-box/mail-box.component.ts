import { Component, OnInit, ViewChild } from '@angular/core';
import { MailData } from '../mail-data';
import { HelpServiceService } from '../help-service.service'
import { MatTableDataSource } from '@angular/material';
import { MatPaginator, MatSort } from '@angular/material';

@Component({
  selector: 'app-mail-box',
  templateUrl: './mail-box.component.html',
  styleUrls: ['./mail-box.component.css']
})
export class MailBoxComponent implements OnInit {

  mailData: MailData[] = [];
  dataSource: MatTableDataSource<MailData>;
  displayedColumns: string[] = ['subject', 'message', 'createdDate'];

  @ViewChild("paginatorOne") paginatorOne: MatPaginator;
  @ViewChild("sortOne") sortOne: MatSort;

  constructor(private helpService: HelpServiceService) { }

  ngOnInit() {
    this.getAllNotifications();
  }

  getAllNotifications(): void {
    this.helpService.getAllNotifications().subscribe(result => {
      // this.mailData = result;
      this.dataSource = new MatTableDataSource(result);
      this.dataSource.paginator = this.paginatorOne;
      this.dataSource.sort = this.sortOne;
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
