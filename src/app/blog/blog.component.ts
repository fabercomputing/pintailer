import { Component, OnInit } from '@angular/core';
import { BlogServiceService } from '../internalApp/blog-service.service'
import { Router } from '@angular/router';
import { listAnimation, EnterLeaveTop, EnterLeave } from '../internalApp/animations';

export class Para {
  paraTitle: string;
  paraContent: string;
  paraImg: string;
  imgHeight: string;
  imgWidth: string;
}

export class blogData {
  "fileName": string;
  "title": string;
  "titleDes": string;
  "titleImg": string;
}

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css', '../common-style/bootstrap-min.css', '../common-style/font-awesome.css'],
  animations: [
    listAnimation, EnterLeaveTop, EnterLeave
  ]
})
export class BlogComponent implements OnInit {

  constructor(private blogServiceService: BlogServiceService, private router: Router) { }

  ngOnInit() {
    this.laodBlogs();
  }

  blogContentArr = ["ManualToAutomated", "RetrofittingSoftwareTesting", "MessageToQa", "PintailerBlog", "FakeResults", "ExcelMangement"];

  blogArr = [new blogData()];

  laodBlogs(): void {
    this.blogArr.length = 0;
    this.blogContentArr.forEach(element => {
      let blog = new blogData();

      console.log('Calling for: ' + element)

      this.blogServiceService.getJSON(element).subscribe(data => {
        blog.fileName = element;
        blog.title = data.title;
        blog.titleDes = data.titleDes;
        blog.titleImg = data.titleImg;
        this.blogArr.push(blog)

      },
        err => console.error('Observer got an error: ' + err),
        () => console.log('Observer got a complete notification for: ' + element))
    });
  }

  openContent(name: string): void {

    this.router.navigate(['/content'], { queryParams: { name: name } });

  }

}
