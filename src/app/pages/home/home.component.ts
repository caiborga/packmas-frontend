import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { AuthService } from '../../core/services/auth-service.service';
import { ToursService } from '../../core/services/tours.service';
import { LayoutService } from '../../core/services/layout.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [FormsModule, RouterLink],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent {
    groupIdFromLink: string = '';
    groupIdFromStorage: string | null = '';
    groupName: string = '';
    loadingData: boolean = false;

    private sub: any;

    alertService = inject(AlertService);
    authService = inject(AuthService);
    layoutService = inject(LayoutService);
    localStorageService = inject(LocalStorageService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    tourService = inject(ToursService);

    async ngOnInit() {
        this.layoutService.setTopbarState('hidden');
        this.layoutService.setFooterState('hidden');
        this.layoutService.setBackgroundBlurred(false);

        this.loadingData = true;
        let groupIsValid = false;

        // Get group ID from route params
        this.sub = this.route.params.subscribe((params) => {
            this.groupIdFromLink = params['id'];
        });

        // Get group ID from storage
        this.groupIdFromStorage = this.localStorageService.getItem('key');

        // Validate group ID
        if (this.groupIdFromLink || this.groupIdFromStorage) {
            if (this.groupIdFromLink) {
                groupIsValid = await this.groupIsValid(this.groupIdFromLink);
                if (groupIsValid) {
                    // Set group ID in storage if valid
                    this.localStorageService.setItem('key', this.groupIdFromLink);
                    this.authService.login();
                    this.router.navigate(['/', 'tours']);
                    this.alertService.showAlertMessage({
                        type: 'success',
                        message: 'Login erfolgreich - Willkommen zurück!',
                    });
                } else { 
                    this.alertService.showAlertMessage({
                        type: 'error',
                        message: 'Gruppe existiert nicht - vielleicht vertippt?',
                    });
                }
            } else if (this.groupIdFromStorage) {
                groupIsValid = await this.groupIsValid(this.groupIdFromStorage);
                if (groupIsValid) {
                    this.authService.login();
                    this.router.navigate(['/', 'tours']);
                    this.alertService.showAlertMessage({
                        type: 'success',
                        message: 'Login erfolgreich - Willkommen zurück!',
                    });
                }
            }
        }

        // Redirect and logout if group is not valid
        if (!groupIsValid) {
            this.router.navigate(['/', 'register']);
            this.authService.logout();
            return;
        }
    }

    async groupIsValid(groupId: string): Promise<boolean> {
        try {
            const response = await this.tourService.get('group/' + groupId).toPromise();
            console.log('groupIsValid - success:', response);
            return response.existing;
        } catch (error) {
            console.log('groupIsValid - error:', error);
            return false;
        }
    }

    registerGroup() {
        let data = {
            name: this.groupName,
        };
        this.tourService
            .post('register', data)
            .toPromise()
            .then((response: any) => {
                console.log('registerGroup - success', response.message);
                this.authService.login();
                this.localStorageService.setItem('key', response.key);
                // this.link = `https://caiborga.github.io/mtc-frontend/browser/#/home/${response.key}/`
                // this.layoutService.setBackgroundSuccess();
                this.router.navigate(['/', 'tours']); //,response.key
            })
            .catch((error) => {
                console.error('registerGroup - error', error);
            });
    }
}
