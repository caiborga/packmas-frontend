import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth-service.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../../core/services/layout.service';
import { ToursService } from '../../core/services/tours.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [FormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
})
export class RegisterComponent {
    layoutService = inject(LayoutService);
    alertService = inject(AlertService);

    groupName: string = '';
    link: string = '';

    constructor(private authService: AuthService, private router: Router, private tourService: ToursService, private localStorage: LocalStorageService) {}

    ngOnInit() {
        this.layoutService.setTopbarState('hidden');
        this.layoutService.setFooterState('hidden');
        this.layoutService.setBackgroundBlurred(false);
    }

    registerGroup() {
        this.layoutService.setLoading(true);
        let data = {
            name: this.groupName,
        };
        this.tourService
            .post('register', data)
            .toPromise()
            .then((response: any) => {
                console.log('registerGroup - success', response.message);
                this.authService.login();
                this.localStorage.setItem('key', response.key);
                this.router.navigate(['/', 'tours']);
                this.layoutService.setLoading(false);
            })
            .catch((error) => {
                this.layoutService.setLoading(false);
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Das hat leider nicht geklappt',
                });
                console.error('registerGroup - error', error);
            });
    }
}
