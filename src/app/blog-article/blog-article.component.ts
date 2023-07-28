import { Component, OnInit } from '@angular/core';
import { BlogServiceService } from '../internalApp/blog-service.service'
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

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
  selector: 'app-blog-article',
  templateUrl: './blog-article.component.html',
  styleUrls: ['./blog-article.component.css', '../common-style/bootstrap-min.css', '../common-style/font-awesome.css']
})
export class BlogArticleComponent implements OnInit {
  page_name: string;
  constructor(
    public sanitizer: DomSanitizer,
    private blogServiceService: BlogServiceService,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {

    if (this.activatedRoute.snapshot.queryParamMap.get('name') != null) {
      this.page_name = this.activatedRoute.snapshot.queryParamMap.get('name');
    }

    // this.page_name = this.route.snapshot.params.page_name;

    if (this.page_name != undefined) {
      this.openContent();
    } else {
      window.location.href = "http://" + window.location.host;
    }
  }

  title: string;
  titleDes: string;
  titleImg: string;
  image: any;
  paraGraphArr: Para[] = [];

  openContent(): void {
    this.blogServiceService.getJSON(this.page_name).subscribe(data => {
      this.title = data.title;
      this.titleDes = data.titleDes;
      this.titleImg = data.titleImg;
      this.image = this._sanitizer.bypassSecurityTrustStyle(`linear-gradient(rgba(29, 29, 29, 0), rgba(16, 16, 23, 0.5)), url(/assets/img/${this.titleImg})`);
      data.paragraph.forEach(element => {
        this.paraGraphArr.push(element)
      });
    });
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(oldURL);
  }

}