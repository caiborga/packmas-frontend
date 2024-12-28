import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backendUrl } from '../../../../environment';

@Injectable({
    providedIn: 'root',
})
export class ToursService {
    private apiUrl: string = backendUrl + '/api';

    constructor(private httpClient: HttpClient) {}

    post(endpoint: string, data: any) {
        const url = `${this.apiUrl}/${endpoint}`;
        return this.httpClient.post(url, data);
    }

    get(endpoint: string): Observable<any> {
        const url = `${this.apiUrl}/${endpoint}`;
        return this.httpClient.get(url);
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
