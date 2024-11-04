import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';


@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private isAuthenticatedSubject: BehaviorSubject<boolean>;
    public isAuthenticated$: Observable<boolean>;

    constructor(
        private localStorageService: LocalStorageService,
        private routerService: Router
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
        this.routerService.navigate(['/', 'register']);
    }

}
