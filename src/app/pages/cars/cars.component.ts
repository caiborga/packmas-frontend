import { Component, ElementRef, inject, model, ViewChild } from '@angular/core';
import {
    FormGroup,
    FormControl,
    FormsModule,
    Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { HeaderComponent } from '../../shared/header/header.component';
import { Car, initializeCar } from '../../core/models/car';
import { Member } from '../../core/models/member';
import { LayoutService } from '../../core/services/layout.service';
import { Pagination } from '../../core/models/pagination';
import { Subject } from 'rxjs';

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ColorPickerModule } from 'primeng/colorpicker';
import { Select, SelectChangeEvent } from 'primeng/select';
import { ToursService } from '../../core/services/tours.service';
import { AlertService } from '../../core/services/alert.service';

import { tableRowAnimation } from '../../core/animations/layout';
import { Setting } from '../../core/models/setting';

@Component({
    selector: 'app-cars',
    standalone: true,
    imports: [
        AsyncPipe,
        ColorPickerModule,
        FormsModule,
        HeaderComponent,
        MatIconModule,
        NgClass,
        PaginatorModule,
        ReactiveFormsModule,
        RouterModule,
        Select,
        TableModule,
    ],
    templateUrl: './cars.component.html',
    styleUrl: './cars.component.scss',
    animations: [tableRowAnimation],
})
export class CarsComponent {
    @ViewChild('drawer') drawer!: ElementRef<HTMLInputElement>;
    @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

    alertService = inject(AlertService);
    layoutService = inject(LayoutService);
    tourService = inject(ToursService);

    brands: Setting[] = [];
    cars: Car[] = [];
    carToDelete: Car = initializeCar();
    drivers: Member[] = [];
    serverDrivers: Member[] =[];
    serverBrands: Setting[] = [];
    editMode: boolean = false;
    loadingData: boolean = false;

    brandPagination: Pagination = { limit: 10, offset: 0, page: 1, filter: '' };
    carsPagination: Pagination = { limit: 10, offset: 0, page: 1 };
    driverPagination: Pagination = { limit: 10, offset: 0, page: 1 };

    carForm = new FormGroup({
        id: new FormControl(),
        brand: new FormControl(),
        color: new FormControl('4a00ff  '),
        driver: new FormControl(),
        model: new FormControl(''),
        name: new FormControl('', Validators.required),
        passengers: new FormControl<number[]>([]),
        seats: new FormControl(5),
    });

    private searchCarSubject = new Subject<string>();
    private searchDriverSubject = new Subject<string>();
    private searchBrandSubject = new Subject<string>();

    constructor() {
        this.searchCarSubject
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe((searchTerm) => {
                this.loadingData = true;
                this.carsPagination.filter = searchTerm;
                this.getCars();
            });

        this.searchDriverSubject
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe((searchTerm) => {
                this.driverPagination.filter = searchTerm;
                this.getMembers();
            });

        this.searchBrandSubject
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe((searchTerm) => {
                this.brandPagination.filter = searchTerm;
                this.getBrands();
            });
    }

    ngOnInit() {
        this.layoutService.setTopbarState('visible');
        this.layoutService.setFooterState('visible');
        this.layoutService.setBackgroundBlurred(true);
        this.getBrands();
        this.getCars();
        this.getMembers();
    }

    getBrands() {
        this.tourService
            .get('settings/CAR_BRANDS', this.brandPagination)
            .toPromise()
            .then((response) => {
                this.brands = response.data;
                console.log('getBrands - success', response);
            })
            .catch((error) => {
                console.error('getBrands - error', error);
            });
    }

    getCars() {
        this.loadingData = true;
        this.tourService
            .get('cars', this.carsPagination)
            .toPromise()
            .then((response) => {
                this.cars = response.cars;
                this.serverBrands = response.data.brands;
                this.serverDrivers = response.data.drivers;
                this.loadingData = false;
                console.log('getCars - success', response);
            })
            .catch((error) => {
                this.loadingData = false;
                console.error('getCars - error', error);
            });
    }

    getErrorSummary(): string {
        if (!this.carForm || this.carForm.valid) return '';

        const errorMessages: string[] = [];

        if (this.carForm.get('name')?.hasError('required')) {
            errorMessages.push('Name ist erforderlich.');
        }

        return errorMessages.length > 0
            ? errorMessages.join(' | ')
            : 'Formular enthält Fehler.';
    }

    getMembers() {
        this.tourService
            .get('participants', this.driverPagination)
            .toPromise()
            .then((response) => {
                this.drivers = response.participants;
                this.driverPagination = response.pagination;
                console.log('getMembers(drivers) - success', this.drivers);
            })
            .catch((error) => {
                this.loadingData = false;
                console.error('getMembers(drivers) - error', error);
            });
    }

    onAddCar() {
        this.loadingData = true;
        this.tourService
            .post('cars', this.carForm.value)
            .toPromise()
            .then((response) => {
                console.log('addCar - success', response);
                this.closeModal();
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Neues Auto erfolgreich hinzugefügt',
                });
                this.getCars();
            })
            .catch((error) => {
                this.loadingData = false;
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Auto konnte nicht hinzugefügt werden',
                });
                console.error('addThing - error', error);
            });
    }

    onDeleteCar() {
        this.loadingData = true;
        this.tourService
            .delete('cars/' + this.carToDelete.id)
            .toPromise()
            .then((response) => {
                this.getCars();
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Auto erfolgreich entfernt',
                });
                console.log('onDeleteCar - success', response);
            })
            .catch((error) => {
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Auto konnte nicht entfernt werden',
                });
                console.error('onDeleteCar - error', error);
            });
    }

    onEditCar() {
        this.tourService
            .put('cars/' + this.carForm.get('id')!.value, this.carForm.value)
            .toPromise()
            .then((response) => {
                this.closeModal();
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Änderung gespeichert',
                });
                this.getCars();
                console.log('Edit car - success', response);
            })
            .catch((error) => {
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Änderung konnte nicht gespeichert werden',
                });
                console.error('Edit car - error', error);
            });
    }

    editCar(car: Car) {
        this.editMode = true;
        this.carForm.patchValue(car);
        this.drawer.nativeElement.checked = true;
    }

    onSearchBrandChange(event: SelectChangeEvent): void {
        const input = event.value;
        this.searchBrandSubject.next(input.value);
    }

    onSearchDriverChange(event: SelectChangeEvent): void {
        const input = event.value;
        this.searchDriverSubject.next(input);
    }

    onSearchCarChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchCarSubject.next(input.value);
    }

    showDeleteModal(car: Car) {
        if (car) {
            this.carToDelete = car;
            this.deleteModal.nativeElement.showModal();
        }
    }

    closeModal() {
        this.drawer.nativeElement.checked = false;
        this.resetForm();
    }

    resetForm() {
        this.editMode = false;
        this.carForm.reset({
            seats: 5,
            color: '4a00ff',
        });
    }
}
