import { Component, ElementRef, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { FormControl, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { catchError, Observable, of, Subscription, tap } from 'rxjs';
import { MultiSelectModule } from 'primeng/multiselect';

import { LayoutService } from '../../core/services/layout.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { ToursService } from '../../core/services/tours.service';
import { initializeTour, Tour } from '../../core/models/tour';
import { TourMembersComponent } from './tour-members/tour-members.component';
import { TourCarsComponent } from './tour-cars/tour-cars.component';
import { TourThingsComponent } from './tour-things/tour-things.component';
import { DragDropService, dragObjectType } from '../../core/services/drag-drop.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { WeightPipe } from '../../core/pipes/customPipes';
import { Member } from '../../core/models/member';
import { AlertService } from '../../core/services/alert.service';

@Component({
    selector: 'app-adit-tour',
    standalone: true,
    imports: [DatePicker, DatePipe, ReactiveFormsModule, FormsModule, HeaderComponent, MatIconModule, MultiSelectModule, NgClass, NgIf, TourCarsComponent, TourMembersComponent, TourThingsComponent, IconComponent, WeightPipe],
    templateUrl: './tour.component.html',
    styleUrl: './tour.component.scss',
})
export class AditTourComponent {
    @ViewChild('editTourDrawer') editTourDrawer!: ElementRef<HTMLInputElement>;

    dragDropService = inject(DragDropService);
    layoutService = inject(LayoutService);
    route = inject(ActivatedRoute);
    tourService = inject(ToursService);
    alertService = inject(AlertService);

    loading: boolean = false;
    name = new FormControl('');
    dates: Date | undefined;
    tourForm = new FormGroup({
        destination: new FormControl(''),
        members: new FormControl<Member[]>([]),
        start: new FormControl<Date | Date[]>(new Date(), Validators.required),
        end: new FormControl<Date>(new Date(), Validators.required),
    });
    tour: Tour = initializeTour();
    tourID: number = 0;

    allMembers: Number[] = [];
    tourMembersCount: number = 0;
    tourCarsCount: number = 0;
    tourThingsCount: number = 0;
    tourThingsWeight: number = 0;

    memberForm = new FormGroup({
        avatar: new FormControl(0),
        id: new FormControl(''),
        name: new FormControl('', Validators.required),
    });

    cards = [
        { title: 'Teilnehmer', icon: 'person' },
        { title: 'Gepäck', icon: 'backpack' },
        { title: 'Mitfahrzentrale', icon: 'directions_car' },
    ];
    collapsedCards = [true, true, true];

    dropType: dragObjectType = 'UNDEFINED';

    private sub: any;
    private assignmentsChanged!: Subscription;

    ngOnInit() {
        this.sub = this.route.params.subscribe((params) => {
            this.tourID = +params['id'];
        });
        this.getTourData(this.tourID);
        this.layoutService.setTopbarState('visible');
        this.layoutService.setFooterState('visible');
        this.layoutService.setBackgroundBlurred(true);

        this.dragDropService.dropType$.subscribe((type) => {
            this.dropType = type;

            const indexMap = {
                MEMBER: 2,
                THING: 0,
                CAR: 1,
                UNDEFINED: undefined
              };
              const index = indexMap[type];
              if (index !== undefined && this.collapsedCards[index]) {
                this.collapsedCards[index] = false;
              }

        });
    }

    getMembers(): Observable<any> {
        return this.tourService.get('members').pipe(
            tap((response) => {
                this.allMembers = response.members;
            }),
            catchError((error) => {
                console.error('Fehler beim Laden der Mitglieder', error);
                // Optional: Fallback, leeres Array setzen
                this.allMembers = [];
                // Gib ein leeres Observable zurück, damit subscribe nicht abstürzt
                return of(null);
            })
        );
    }

    getTourData(tourID: number) {
        this.loading = true;
        this.tourService
            .get('tours/' + tourID)
            .toPromise()
            .then((response) => {
                console.log('getTourData - success', response);

                const start = new Date(this.tour.tourData.start);
                const end = new Date(this.tour.tourData.end);

                this.tour = response;

                this.tourMembersCount = response.tourData.tourMembers.length;
                this.tourCarsCount = response.tourData.tourCars.length;
                this.tourThingsCount = response.tourData.tourThings.length;
                this.tourThingsWeight = response.tourData.tourThingsWeight;

                this.tourForm.controls.start.setValue(start);
                this.tourForm.controls.end.setValue(end);
                this.loading = false;
            })
            .catch((error) => {
                console.error('getTourData - error', error);
                this.loading = false;
            });
    }

    toggleCard(index: number) {
        this.collapsedCards[index] = !this.collapsedCards[index];
    }

    isAnyCardOpen(): boolean {
        return this.collapsedCards.some((state) => !state);
    }

    onEditTour() {
        const start = new Date(this.tour.tourData.start);
        const end = new Date(this.tour.tourData.end);

        this.getMembers().subscribe(() => {
            this.tourForm.patchValue({
                destination: this.tour.tourData.destination,
                members: this.tour.tourData.tourMembers,
                start: [start, end],
            });

            this.editTourDrawer.nativeElement.checked = true;
        });
    }

    onSaveTourData() {
        let range: Date[] = [];
        let data: any = {};

        data.destination = this.tourForm.value.destination;

        if (Array.isArray(this.tourForm.value.start) && this.tourForm.value.start.length === 2) {
            range = this.tourForm.value.start;
        }

        if (range) {
            data.start = range[0];
            data.end = range[1];
        }

        this.tourForm.value;

        this.tourService
            .put('tours/' + this.tourID, data)
            .toPromise()
            .then((response) => {
                this.editTourDrawer.nativeElement.checked = false;
                this.getTourData(this.tourID);
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Tour Daten erfolgreich gespeichert',
                });
                console.log('newTour - success', response);
            })
            .catch((error) => {
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Da hat was nicht geklappt',
                });
                console.error('newTour - error', error);
            });
    }

    onTourThingsCountChange(count: number) {
        this.tourThingsCount = count;
    }

    onTourThingsWeightChange(weight: number) {
        this.tourThingsWeight = weight;
    }

    onTourMembersCountChange(count: number) {
        this.tourMembersCount = count;
    }

    onTourCarsCountChange(count: number) {
        this.tourCarsCount = count;
    }
}
