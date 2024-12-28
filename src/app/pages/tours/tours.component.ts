import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth-service.service';
import { Router, RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';

import { MatIconModule } from '@angular/material/icon';

import { LocalStorageService } from '../../core/services/local-storage.service';
import { ToursService } from '../../core/services/tours.service';
import { TourCardComponent } from './tour-card/tour-card.component';
import { LayoutService } from '../../core/services/layout.service';
import { HeaderComponent } from "../../shared/header/header.component";
import { tourCardsSlideIn } from '../../core/animations/layout';

@Component({
    selector: 'app-tours',
    standalone: true,
    imports: [DatePicker, MatIconModule, MultiSelectModule, ReactiveFormsModule, HeaderComponent, RouterModule, TourCardComponent],
    templateUrl: './tours.component.html',
    styleUrl: './tours.component.scss',
    animations: [tourCardsSlideIn]
})
export class ToursComponent {

    layoutService = inject(LayoutService);
    authService = inject(AuthService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    localStorageService = inject(LocalStorageService);
    tourService = inject(ToursService);

    groupIdFromLink: string = '';
    groupIdFromStorage: string | null = '';
    isMenuOpen: boolean = false;
    loadingData: boolean = false;
    newThings: Array<any> = [];
    tours: Array<any> = [];

    allMembers: Number[] = [];
    tourMembers: Number[] = [];

    tourForm = new FormGroup({
        destination: new FormControl(''),
        name: new FormControl('', Validators.required),
        start: new FormControl('', Validators.required),
        end: new FormControl('', Validators.required),
    });

    constructor() {}

    private sub: any;

    async ngOnInit() {
        this.loadingData = true;
        let groupIsValid = false;
        this.layoutService.setTopbarState('visible');
        this.layoutService.setFooterState('visible');
        this.layoutService.setBackgroundBlurred(true);

        this.getMembers()

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
                    this.localStorageService.setItem(
                        'key',
                        this.groupIdFromLink
                    );
                    this.authService.login();
                }
            } else if (this.groupIdFromStorage) {
                groupIsValid = await this.groupIsValid(this.groupIdFromStorage);
                if (groupIsValid) {
                    this.authService.login();
                }
            }
        }

        // Redirect and logout if group is not valid
        if (!groupIsValid) {
            this.router.navigate(['/', 'register']);
            this.authService.logout();
            return;
        }

        // Proceed with other actions if group is valid
        this.getTours();
    }

    async groupIsValid(groupId: string): Promise<boolean> {
        try {
            const response = await this.tourService
                .get('group/' + groupId)
                .toPromise();
            console.log('groupIsValid - success:', response);
            return response.existing;
        } catch (error) {
            console.log('groupIsValid - error:', error);
            return false;
        }
    }

    getMembers() {
        this.loadingData = true;
        this.tourService.get('participants')
        .toPromise()
        .then((response) => {
            this.allMembers = response.participants;
            this.loadingData = false;
            console.log('getMmembers - success', this.allMembers);
        })
        .catch((error) => {
            this.loadingData = false;
            console.error('getMmembers - error', error);
        });
    }

    getTours() {
        this.loadingData = true;
        this.tourService
            .get('tours')
            .toPromise()
            .then((response) => {
                this.tours = response.tours;
                // console.log('getTours - success:', this.tours);
                for (let tour in this.tours) {
                    let participants = JSON.parse(
                        this.tours[tour].tour_participants
                    );
                    let tourData = JSON.parse(this.tours[tour].tour_data);
                    this.tours[tour].participants = participants;
                    this.tours[tour].tourData = tourData;
                }
                this.loadingData = false;
                this.tours = [1, 2, 3, 4, 5, 5, 6,7,8,9];
                console.log('getTours - success:', this.tours);
            })
            .catch((error) => {
                this.loadingData = false;
                console.error('getTours - error:', error);
            });
    }

    deleteTour(tourID: string) {
        this.tourService
            .delete('tours/' + tourID)
            .toPromise()
            .then((response) => {
                this.getTours();
                console.log('Delete tour - success', response);
            })
            .catch((error) => {
                console.error('Delete tour - error', error);
            });
    }

    toggleMenu(event: Event): void {
        event.stopPropagation(); // Verhindert, dass das Klicken außerhalb die Kachel beeinflusst
        this.isMenuOpen = !this.isMenuOpen;
    }

    closeMenu(): void {
        this.isMenuOpen = false;
    }

    // addParticipant(participant: any){
    //     const index = this.newParticipants.indexOf(participant);
    //     if (index === -1) {
    //     console.log("index",index)
    //         let newParticipantObject: any = {};
    //         newParticipantObject = {
    //             id: participant.item.id,
    //             start: this.tourForm.get('start')!.value,
    //             end: this.tourForm.get('end')!.value,
    //         };
    //         this.newParticipants.push(newParticipantObject);
    //         console.log(this.newParticipants)
    //     }
    // }

    addTour() {
        const data = {
            tourCars: JSON.stringify([]),
            tourData: JSON.stringify(this.tourForm.value),
            tourThings: JSON.stringify([]),
            tourParticipants: JSON.stringify([]),
        };
        this.tourService.post('tours', data)
        .toPromise()
        .then((response) => {
            console.log('newTour - success', response);
        })
        .catch((error) => {
            console.error('newTour - error', error);
        });
    }
}
