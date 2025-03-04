import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AuthService } from '../../core/services/auth-service.service';
import { Router, RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';

import { MatIconModule } from '@angular/material/icon';

import { LocalStorageService } from '../../core/services/local-storage.service';
import { ToursService } from '../../core/services/tours.service';
import { TourCardComponent } from './tour-card/tour-card.component';
import { LayoutService } from '../../core/services/layout.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { tourCardsSlideIn } from '../../core/animations/layout';
import { Tour, TourAssignments, initializeTour, initializeTourAssignments } from '../../core/models/tour';
import { Pagination } from '../../core/models/pagination';
import { Member } from '../../core/models/member';
import { AlertService } from '../../core/services/alert.service';

@Component({
    selector: 'app-tours',
    standalone: true,
    imports: [
        DatePicker,
        MatIconModule,
        MultiSelectModule,
        ReactiveFormsModule,
        HeaderComponent,
        RouterModule,
        TourCardComponent,
    ],
    templateUrl: './tours.component.html',
    styleUrl: './tours.component.scss',
    animations: [tourCardsSlideIn],
})
export class ToursComponent {
    @ViewChild('drawer') drawer!: ElementRef<HTMLInputElement>;
    @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

    layoutService = inject(LayoutService);
    authService = inject(AuthService);
    alertService = inject(AlertService);
    pagination: Pagination = { limit: 10, offset: 0, page: 1 };
    route = inject(ActivatedRoute);
    router = inject(Router);
    localStorageService = inject(LocalStorageService);
    tourService = inject(ToursService);

    groupIdFromLink: string = '';
    groupIdFromStorage: string | null = '';
    isMenuOpen: boolean = false;
    loadingData: boolean = true;
    newThings: Array<any> = [];
    tours: Array<Tour> = [];
    tourToDelete: Tour = initializeTour();

    allMembers: Number[] = [];

    tourForm = new FormGroup({
        destination: new FormControl(''),
        members: new FormControl<Member[]>([]),
        name: new FormControl('', Validators.required),
        start: new FormControl('', Validators.required),
        end: new FormControl('', Validators.required),
    });

    private searchSubject = new Subject<string>();
    
    constructor() {
        this.searchSubject
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe((searchTerm) => {
                this.loadingData = true;
                this.pagination.filter = searchTerm;
                this.getTours();
            });
    }

    private sub: any;

    async ngOnInit() {
        this.loadingData = true;
        let groupIsValid = false;
        this.layoutService.setTopbarState('visible');
        this.layoutService.setFooterState('visible');
        this.layoutService.setBackgroundBlurred(true);

        this.getMembers();

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
        this.tourService
            .get('participants')
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
                console.log('getTours raw - success:', this.tours);
                for (let tour in this.tours) {
                    let tourData = response.tours[tour].tour_data;
                    this.tours[tour].tour_data = tourData;
                }
                this.loadingData = false;
                console.log('getTours - success:', this.tours);
            })
            .catch((error) => {
                this.loadingData = false;
                console.error('getTours - error:', error);
            });
    }

    onNewTour() {
        this.loadingData = true;
        // Insert new members into assignments
        const tourAssignmentObject = initializeTourAssignments();
        const members = this.tourForm.value.members;
        let membersIds: number[] = [];
        if ( members && members.length !== 0) {
            for (let member of members) {
                tourAssignmentObject.members.set(member.id, { car: -1, things: [] });
            }
            membersIds = members.map((member: any) => member.id);
        }
        // Collect start / end from form
        let range = this.tourForm.value.start
        if ( range ) {
            this.tourForm.patchValue({
                start: range[0],
                end: range[1],
              }
            );
        }

        const data = {
            tourCars: JSON.stringify([]),
            tourData: JSON.stringify(this.tourForm.value),
            tourThings: JSON.stringify([]),
            tourMembers: JSON.stringify(membersIds),
            tourAssignments: JSON.stringify(this.convertTourAssignmentsToJson(tourAssignmentObject)),
        };

        this.tourService
            .post('tours', data)
            .toPromise()
            .then((response) => {
                this.drawer.nativeElement.checked = false;
                this.loadingData = false;
                this.getTours();
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Neuer Tour erfolgreich hinzugefügt',
                });
                console.log('newTour - success', response);
            })
            .catch((error) => {
                this.loadingData = false;
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Da hat was nicht geklappt',
                });
                console.error('newTour - error', error);
            });
    }

    convertTourAssignmentsToJson(assignments: TourAssignments) {
        return {
            members: Object.fromEntries(assignments.members),
            things: Object.fromEntries(assignments.things),
            cars: Object.fromEntries(assignments.cars),
        };
    }

    onSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchSubject.next(input.value);
    }

    showDeleteModal(tour: Tour) {
        if (tour) {
            this.tourToDelete = tour;
            this.deleteModal.nativeElement.showModal();
        }
    }

    deleteTour(tourID: number) {
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
}
