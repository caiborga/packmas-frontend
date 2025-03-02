import { Component, inject, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AutoComplete } from 'primeng/autocomplete';
import { DragDropModule } from 'primeng/dragdrop';

import { DragDropService, dragObject } from '../../../core/services/drag-drop.service';
import { Car, initializeCar } from '../../../core/models/car';
import { initializeTourAssignments, TourAssignments, TourCarsObject, TourMembersObject } from '../../../core/models/tour';
import { AlertService } from '../../../core/services/alert.service';
import { ToursService } from '../../../core/services/tours.service';
import { Pagination } from '../../../core/models/pagination';
import { Member } from '../../../core/models/member';
import { IconComponent } from "../../../shared/icon/icon.component";

@Component({
    selector: 'app-tour-cars',
    standalone: true,
    imports: [AutoComplete, DragDropModule, MatIconModule, NgClass, IconComponent],
    templateUrl: './tour-cars.component.html',
    styleUrl: './tour-cars.component.scss',
})
export class TourCarsComponent {
    @Input() tourID: number = 0;
    @Input() members: TourMembersObject = {
        ids: [],
        data: [],
    };
    @Input() cars: TourCarsObject = {
        ids: [],
        data: [],
    };
    @Input () tourAssignments: TourAssignments = initializeTourAssignments();
    
    @Output() getData = new EventEmitter<boolean>();

    @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;
    

    carToDelete: Car = initializeCar();
    droppedItems: string[] = [];
    loadingData: boolean = false;
    pagination: Pagination = { limit: 10, offset: 0, page: 1 };
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
    getCars() {
        // this.loadingData = true;
        this.tourService
            .get('cars', this.pagination)
            .toPromise()
            .then((response) => {
                this.searchedCars = response.cars;
                // this.loadingData = false;
                this.pagination = response.pagination;
                console.log('getCars - success', this.cars.ids);
            })
            .catch((error) => {
                // this.loadingData = false;
                console.error('getCars - error', error);
            });
    }

    hasAssignments(id: number){
        const check: dragObject = {
            id: id,
            type: 'CAR',
        }
        return this.dragDropService.hasAssignments(check)
    }

    onAddCar(car: Car, searchBox?: AutoComplete) {
        this.loadingData = true;
        searchBox ? searchBox.clear() : '';
        console.log('add Car', car.id);
        this.cars.ids.push(car.id);
        this.updateTourCars()
            .then((result) => {
                if (result.success) {
                    this.loadingData = false;
                    this.alertService.showAlertMessage({
                        type: 'success',
                        message: 'Auto erfolgreich hinzugefügt',
                    });
                } else {
                    this.loadingData = false;
                    this.alertService.showAlertMessage({
                        type: 'error',
                        message: 'Das hat leider nicht geklappt',
                    });
                }
            })
            .catch((error) => {
                console.error('Unexpected error in onAddCar', error);
            });
    }

    onDropElement(car: number) {
        console.log('assignments', this.dragDropService.tourAssignmentObject);
        console.log('tourId', this.dragDropService.tourId);

        this.dragDropService.target = {
            id: car,
            type: 'CAR',
        }
        this.dragDropService.newAssignment();
    }

    onRemoveCar(carId: number) {
        console.log('remove Car', carId);
        this.cars.ids = this.cars.ids.filter((id) => id !== carId);
        this.updateTourCars()
            .then((result) => {
                if (result.success) {
                    this.alertService.showAlertMessage({
                        type: 'success',
                        message: 'Teilnehmer erfolgreich entfernt',
                    });
                } else {
                    this.alertService.showAlertMessage({
                        type: 'error',
                        message: 'Das hat leider nicht geklappt',
                    });
                }
            })
            .catch((error) => {
                console.error('Unexpected error in onAddMember', error);
            });
    }

    onSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchSubject.next(input.value);
    }

    renderPassengerArray(car: number) {
        const carData = this.tourAssignments.cars.get(car)
        let result: Member[] = [];
        if ( carData ) {
            for ( let passenger in carData.members ) {
                result.push(this.members.data[carData.members[passenger]])
            }
        }
        return result
    }

    showDeleteModal(car: Car) {
            if (car) {
                this.carToDelete = car;
                this.deleteModal.nativeElement.showModal();
            }
        }

    updateTourCars() {
        const data = {
            tourCars: JSON.stringify(this.cars.ids),
        };

        return this.tourService
            .put('tour/' + this.tourID + '/cars', data)
            .toPromise()
            .then((response) => {
                this.getData.emit();
                console.log('updateTourCars - success', response);
                return { success: true, response }; // Erfolg zurückgeben
            })
            .catch((error) => {
                console.error('updateTourCars - error', error);
                return { success: false, error }; // Fehler zurückgeben
            });
    }

    onDrop() {
        // const item = this.dragDropService.sharedData;
        // if (item) {
        //     this.droppedItems.push(item);
        //     this.dragDropService.sharedData = null;
        // }
    }
}
