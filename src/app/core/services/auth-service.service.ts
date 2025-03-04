import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';
import { ToursService } from './tours.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private isAuthenticatedSubject: BehaviorSubject<boolean>;
    public isAuthenticated$: Observable<boolean>;

    constructor(
        private localStorageService: LocalStorageService,
        private routerService: Router,
        private tourService: ToursService
    ) {
        this.isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
        this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
    }

    login() {
        this.isAuthenticatedSubject.next(true);
    }

    logout() {
        this.isAuthenticatedSubject.next(false);
        this.localStorageService.removeItem('key')
        this.routerService.navigate(['/', 'home']);
    }

    getGroupName() {
        let key = this.localStorageService.getItem('key')
        const data = {
            key: key
        }

        // this.loadingData = true;
        this.tourService
            .get('group', data)
            .toPromise()
            .then((response) => {
                console.log('getGroupName - success', response);
            })
            .catch((error) => {
                // this.loadingData = false;
                console.error('getGroupName - error', error);
            });
    }
}
