import { HttpClient, HttpParams } from '@angular/common/http';import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ToursService {
    private apiUrl: string = environment.backendUrl + '/api';

    constructor(private httpClient: HttpClient) {}

    post(endpoint: string, data: any) {
        const url = `${this.apiUrl}/${endpoint}`;
        return this.httpClient.post(url, data);
    }

    get(endpoint: string, params?: { [key: string]: any }): Observable<any> {
        const url = `${this.apiUrl}/${endpoint}`;

        let httpParams = new HttpParams();
        if (params) {
            Object.keys(params).forEach((key) => {
                httpParams = httpParams.set(key, params[key]);
            });
        }

        return this.httpClient.get(url, { params: httpParams });
    }

    put(endpoint: string, data: any): Observable<any> {
        const url = `${this.apiUrl}/${endpoint}`;
        return this.httpClient.put(url, data);
    }

    delete(endpoint: string): Observable<any> {
        const url = `${this.apiUrl}/${endpoint}`;
        return this.httpClient.delete(url);
    }
}
