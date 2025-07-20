import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OtpService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  sendOtp(phone: string): Observable<string> {
    const params = new HttpParams().set('phone', phone);
    return this.http.post(`${this.baseUrl}/otp/send/sms`, null, {
      params,
      responseType: 'text',
    });
  }

  verifyOtp(key: string, otp: string): Observable<any> {
    const params = new HttpParams().set('key', key).set('otp', otp);

    return this.http.post(`${this.baseUrl}/otp/verify`, null, {
      params,
      responseType: 'json',
    });
  }

  verifyOnlyOtp(key: string, otp: string): Observable<any> {
    const params = new HttpParams().set('key', key).set('otp', otp);

    return this.http.post(`${this.baseUrl}/otp/verifyotp`, null, {
      params,
      responseType: 'json',
    });
  }
}
