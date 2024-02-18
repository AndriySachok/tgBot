import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, timer, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor(private httpClient: HttpClient) {  }
  private host = 'backend';
  private configUrl = `http://localhost:3000/api/page/`;

  getConfig(intervalTime: number, userId: string | null): Observable<string> {
   
    const headers = new HttpHeaders({
      'Content-Security-Policy': "default-src 'self'; script-src 'self' http://ec2-51-20-249-219.eu-north-1.compute.amazonaws.com; style-src 'self' http://ec2-51-20-249-219.eu-north-1.compute.amazonaws.com; connect-src 'self' http://ec2-51-20-249-219.eu-north-1.compute.amazonaws.com; img-src 'self' data: http://ec2-51-20-249-219.eu-north-1.compute.amazonaws.com;",
      'Content-Type': 'text/html; charset=UTF-8'
    })

    return timer(0, intervalTime).pipe(
        switchMap(() => this.httpClient.get<string>( `${this.configUrl}${userId}`, {headers} )),
    )
  }
}
