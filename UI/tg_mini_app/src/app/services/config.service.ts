import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, interval, timer, filter,switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor(private httpClient: HttpClient) {  }

  previousValue: string | null = null
  private configUrl = 'http://localhost:3000/api/page';

  getConfig(intervalTime: number): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Security-Policy': "default-src 'self'; script-src 'self' http://localhost:3000; style-src 'self' http://localhost:3000; connect-src 'self' http://localhost:3000; img-src 'self' data: http://localhost:3000;"
  })

    return timer(0, intervalTime).pipe(
        switchMap(() => this.httpClient.get(this.configUrl, { headers, responseType: 'text'})),
        filter(data => {
          if (data !== this.previousValue) {
            this.previousValue = data;
            return true
          }
          return false
        })  
    )
  }
}
