import { Component, inject, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { JsonPipe, NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AutoComplete } from 'primeng/autocomplete';
import { DragDropModule } from 'primeng/dragdrop';

import { DragDropService, dragObject } from '../../../core/services/drag-drop.service';
import { Car, initializeCar, TourCar, TourCarMember } from '../../../core/models/car';
import { initializeTourAssignments, TourAssignments } from '../../../core/models/tour';
import { AlertService } from '../../../core/services/alert.service';
import { ToursService } from '../../../core/services/tours.service';
import { Pagination } from '../../../core/models/pagination';
import { Member } from '../../../core/models/member';
import { IconComponent } from '../../../shared/icon/icon.component';

@Component({
    selector: 'app-tour-cars',
    standalone: true,
    imports: [AutoComplete, DragDropModule, JsonPipe, MatIconModule, NgClass, IconComponent],
    templateUrl: './tour-cars.component.html',
    styleUrl: './tour-cars.component.scss',
})
export class TourCarsComponent {
    @Input() tourID: number = 0;
    @Output() tourCarsCount = new EventEmitter<number>()
    @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

    cars: Car[] = [];
    tourCars: TourCar[] = [];
    tourCarsData: Car[] = [];
    tourCarsMembers: TourCarMember[] = [];
    tourCarsMembersData = [];
    carToDelete: Car = initializeCar();
    droppedItems: string[] = [];
    loadingData: boolean = false;
    pagination: Pagination = { limit: 10, offset: 0, page: 1, filter: '' };
    searchedCars: Car[] = [];

    private searchSubject = new Subject<string>();

    alertService = inject(AlertService);
    dragDropService = inject(DragDropService);
    tourService = inject(ToursService);

    constructor() {
        this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((searchTerm) => {
            // this.loadingData = true;
            this.pagination.filter = searchTerm;
            this.getCars();
        });
    }

    ngOnInit() {
        this.getTourCars();
        this.getTourCarsMembers();
    }

    getCars() {
        // this.loadingData = true;
        this.tourService
            .get('cars', this.pagination)
            .toPromise()
            .then((response) => {
                this.cars = response.cars;
                // this.loadingData = false;
                this.pagination = response.pagination;
                console.log('getCars - success', this.cars);
            })
            .catch((error) => {
                // this.loadingData = false;
                console.error('getCars - error', error);
            });
    }

    getTourCars() {
        //  this.loadingData = true;
        const params = {
            ...this.pagination,
            tourId: this.tourID,
        };
        this.tourService
            .get('tourCars', params)
            .toPromise()
            .then((response) => {
                this.tourCars = response.tourCars;
                this.tourCarsData = response.data.cars;
                this.tourCarsCount.emit(this.tourCars.length)
                this.pagination = response.pagination;
                console.log('getTourCars - success', response);
            })
            .catch((error) => {
                // this.loadingData = false;
                console.error('getTourCars - error', error);
            });
    }

    getTourCarsMembers() {
        //  this.loadingData = true;
        const params = {
            ...this.pagination,
            tourId: this.tourID,
        };
        this.tourService
            .get(`tourCarMembers/${this.tourID}`)
            .toPromise()
            .then((response) => {
                this.tourCarsMembers = response.tourCarMembers;
                this.tourCarsMembersData = response.data.cars;
                console.log('getTourCarsMembers - success', response);
            })
            .catch((error) => {
                // this.loadingData = false;
                console.error('getTourCarsMembers - error', error);
            });
    }

    hasAssignments(car: TourCar) {
        // const check: dragObject = {
        //     id: id,
        //     type: 'CAR',
        // }
        // return this.dragDropService.hasAssignments(check)
        return false;
    }

    async onAddCar(car: Car, searchBox?: AutoComplete) {
        this.loadingData = true;

        if (searchBox) {
            searchBox.clear();
        }

        console.log('add Car', car.id);

        const data = {
            car_id: car.id,
            tour_id: this.tourID,
        };

        try {
            const response = await this.tourService.post('tourCars', data).toPromise();
            console.log('updateTourCars - success', response);

            await this.getTourCars();

            this.alertService.showAlertMessage({
                type: 'success',
                message: 'Auto erfolgreich hinzugefügt',
            });
        } catch (error) {
            console.error('updateTourCars - error', error);
            this.alertService.showAlertMessage({
                type: 'error',
                message: 'Das hat leider nicht geklappt',
            });
        } finally {
            this.loadingData = false;
        }
    }

    async onAddCarMember(car: Car, member: Member) {
        this.loadingData = true;

        console.log('add CarMember', car.id);

        const data = {
            car_id: car.id,
            tour_id: this.tourID,
            member_id: member.id
        };

        try {
            const response = await this.tourService.post('tourCarMembers', data).toPromise();
            console.log('updateTourCars - success', response);

            await this.getTourCarsMembers();

            this.alertService.showAlertMessage({
                type: 'success',
                message: 'Member erfolgreich hinzugefügt',
            });
        } catch (error) {
            console.error('updateTourCars - error', error);
            this.alertService.showAlertMessage({
                type: 'error',
                message: 'Das hat leider nicht geklappt',
            });
        } finally {
            this.loadingData = false;
        }
    }

    onDropElement(car: number) {
        this.dragDropService.target = {
            id: car,
            type: 'CAR',
        };
        this.dragDropService.newAssignment();
    }

    async onRemoveCar(carId: number) {

        console.log('remove Car', carId, 'from Tour', this.tourID);
        try {
            const response = await this.tourService.delete(`tourCars/${this.tourID}/${carId}`).toPromise();

            this.alertService.showAlertMessage({
                type: 'success',
                message: 'Auto erfolgreich entfernt',
            });
            console.log('removeCar - success', response);
            await this.getTourCars();

            return { success: true, response };
        } catch (error) {
            console.error('removeCar - error', error);
            return { success: false, error };
        }
    }

    onSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchSubject.next(input.value);
    }

    removeCarAssignment(passengerId: number) {
        this.dragDropService.unassignMemberFromCar(passengerId);
    }

    // renderPassengerArray(car: number) {
    //     const carData = this.tourAssignments.cars.get(car)
    //     let result: Member[] = [];
    //     if ( carData ) {
    //         for ( let passenger in carData.members ) {
    //             result.push(this.members.data[carData.members[passenger]])
    //         }
    //     }
    //     return result
    // }

    showDeleteModal(car: Car) {
        if (car) {
            this.carToDelete = car;
            this.deleteModal.nativeElement.showModal();
        }
    }

    onAssignToCar(carId: number) {
        const origin = this.dragDropService.origin;
    }
}
