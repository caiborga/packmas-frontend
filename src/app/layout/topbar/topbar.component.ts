import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth-service.service';
import { ToursService } from '../../core/services/tours.service';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { AlertService } from '../../core/services/alert.service';
import { frontendUrl } from '../../../../environment';

interface Group {
    key: string,
    name: string
}

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [ClipboardModule, MatIconModule, RouterModule],
    templateUrl: './topbar.component.html',
    styleUrl: './topbar.component.scss',
})
export class TopbarComponent {

    group: Group = {
        key: '',
        name: ''
    }
    isAuthenticated: boolean = false;
    link: string = ''

    private authSubscription: Subscription;

    authService = inject(AuthService)
    alertService = inject(AlertService)
    clipboardService =  inject(ClipboardModule)
    localStorageService = inject(LocalStorageService)
    tourService = inject(ToursService)

    constructor() {
        this.authSubscription = this.authService.isAuthenticated$.subscribe(
            isAuthenticated => {
                this.isAuthenticated = isAuthenticated;
                if (this.isAuthenticated) {
                    this.group.key = this.localStorageService.getItem('key')!
                    this.getGroupName()
                }
            }
        );
    }

    ngOnInit() {
        this.group.key = this.localStorageService.getItem('key')!
        if (this.group.key) {
            this.isAuthenticated = true
            this.link = `${frontendUrl}${this.group.key}/`
            this.getGroupName()
        }
    }

    copyToClipboard() {
        this.alertService.showAlertMessage({
            type: 'success',
            message: 'Link wurde in die Zwischenablage kopiert!',
        });
    }

    getGroupName() {
        this.tourService.get('group/' + this.group.key)
            .toPromise()
            .then((response) => {
                this.group.name = response.name
                console.log('getGroupName - success:', response);
            })
            .catch((error) => {
                console.error('getGroupName - error:', error);
            });
    }

    logout() {
        this.authService.logout();
        this.alertService.showAlertMessage({
            type: 'success',
            message: 'Log Out erfolgreich - Bis bald!',
        });
    }
}
