import { ConfigService } from './services/config.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SafeHtmlPipe } from './random_stuff/safeHtml';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Location } from '@angular/common';


@Component({
  selector: 'app-root',
  template: `<div [innerHTML]="this.userData | safeHtml"></div>`,
 // styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  
  constructor(private route: ActivatedRoute,
              private config: ConfigService,
              private readonly sanitizer: DomSanitizer,
              private location: Location) {}

  userId: string | null = null;
  userData: string = '';

  ngOnInit(): void {
    const intervalTime = 3000

    const currentUrl = this.location.path();
    console.log('Current URL:', currentUrl);

    // Extract userId from the URL
    const parts = currentUrl.split('/');
    this.userId = parts[parts.length - 1];

      this.config.getConfig(intervalTime, this.userId).subscribe({
        next: (data) => {
          if(data !== null) this.userData = data
          console.log(this.userData)
        },
        error: (error) => {
          console.error('Error while getting response', error)
        }
      })
    
  }

}
