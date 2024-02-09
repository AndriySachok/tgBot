import { ConfigService } from './services/config.service';
import { Component, OnInit } from '@angular/core';
import { SafeHtmlPipe } from './random_stuff/safeHtml';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-root',
  template: `<div [innerHTML]="webPage | safeHtml"></div>`,
 // styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  constructor(private config: ConfigService, private readonly sanitizer: DomSanitizer) {}

  webPage: string = ''

  ngOnInit(): void {
    const intervalTime = 3000

    this.config.getConfig(intervalTime).subscribe({
      next: (data) => {
        this.webPage = data.replace(/"/g, '');
        this.webPage = this.webPage.replace(/\\/g, '"');
        console.log(this.webPage)
      },
      error: (error) => {
        console.error('Error while getting response', error)
      }
    })
  }

}
