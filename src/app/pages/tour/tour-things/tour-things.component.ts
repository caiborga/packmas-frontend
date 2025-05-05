import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DragDropService, dragObject } from '../../../core/services/drag-drop.service';
import { DragDropModule } from 'primeng/dragdrop';
import { AutoComplete } from 'primeng/autocomplete';

import { Pagination } from '../../../core/models/pagination';
import { AlertService } from '../../../core/services/alert.service';
import { ToursService } from '../../../core/services/tours.service';
import { initializeThing, Thing, TourThing } from '../../../core/models/thing';
import { Member } from '../../../core/models/member';
import { initializeTourAssignments, TourAssignments } from '../../../core/models/tour';
import { IconComponent } from '../../../shared/icon/icon.component';
import { WeightPipe } from '../../../core/pipes/customPipes';
import { Setting } from '../../../core/models/setting';

@Component({
    selector: 'app-tour-things',
    standalone: true,
    imports: [AutoComplete, DragDropModule, MatIconModule, NgClass, NgIf, ReactiveFormsModule, IconComponent, WeightPipe],
    templateUrl: './tour-things.component.html',
    styleUrl: './tour-things.component.scss',
})
export class TourThingsComponent {
    @Input() tourID: number = 0;
    @Output() tourThingsCount = new EventEmitter<number>();
    @ViewChild('drawer') drawer!: ElementRef<HTMLInputElement>;
    @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

    editMode: boolean = false;
    loadingData: boolean = false;
    pagination: Pagination = { limit: 10, offset: 0, page: 1 };
    things: Thing[] = [];
    tourThings: TourThing[] = [];
    tourThingsData: Thing[] = [];
    tourThingsCategories: Setting[] = [];
    thingToDelete: Thing = initializeThing();

    thingForm = new FormGroup({
        category: new FormControl(''),
        id: new FormControl(0),
        name: new FormControl('', Validators.required),
        weight: new FormControl(0),
    });

    private searchSubject = new Subject<string>();

    alertService = inject(AlertService);
    dragDropService = inject(DragDropService);
    tourService = inject(ToursService);

    constructor() {
        this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((searchTerm) => {
            // this.loadingData = true;
            this.pagination.filter = searchTerm;
            this.getThings();
        });
    }

    ngOnInit() {
        this.getTourThings();
    }

    hasAssignments(thing: TourThing) {
        const check: dragObject = {
            id: thing.id,
            type: 'THING',
        };
        return this.dragDropService.hasAssignments(check);
    }

    getBearerAvatar(thing: number) {
        // const thingData = this.tourAssignments.things.get(thing)
        let result = '';
        // if (thingData) {
        //     const memberId = thingData.member
        //     result = this.members.data[memberId].avatar
        // }
        return result;
    }

    getBearerName(thing: number) {
        // const thingData = this.tourAssignments.things.get(thing);
        let result = 'Nicht zugewiesen';
        // if (thingData) {
        //     const memberId = thingData.member;
        //     result = this.members.data[memberId].name;
        // }
        return result;
    }

    getThings() {
        // this.loadingData = true;
        this.tourService
            .get('things', this.pagination)
            .toPromise()
            .then((response) => {
                this.things = response.things;
                this.pagination = response.pagination;
                console.log('getThings - success', this.things);
            })
            .catch((error) => {
                // this.loadingData = false;
                console.error('getThings - error', error);
            });
    }

    getTourThings() {
        //  this.loadingData = true;
        const params = {
            ...this.pagination,
            tourId: this.tourID,
        };
        this.tourService
            .get('tourThings', params)
            .toPromise()
            .then((response) => {
                this.tourThings = response.tourThings;
                this.tourThingsData = response.data.things;
                this.tourThingsCategories = response.data.categories;
                this.tourThingsCount.emit(this.tourThings.length);
                this.pagination = response.pagination;
                console.log('getTourThings - success', response);
            })
            .catch((error) => {
                // this.loadingData = false;
                console.error('getTourThings - error', error);
            });
    }

    async onAddThing(thing: Thing, searchBox?: AutoComplete) {
        this.loadingData = true;

        if (searchBox) {
            searchBox.clear();
        }

        console.log('add Thing', thing.id);

        const data = {
            thing_id: thing.id,
            tour_id: this.tourID,
        };

        try {
            const response = await this.tourService.post('tourThings', data).toPromise();
            console.log('onAddThing - success', response);

            await this.getTourThings();

            this.alertService.showAlertMessage({
                type: 'success',
                message: 'Gepäck erfolgreich hinzugefügt',
            });
        } catch (error) {
            console.error('onAddThing - error', error);
            this.alertService.showAlertMessage({
                type: 'error',
                message: 'Das hat leider nicht geklappt',
            });
        } finally {
            this.loadingData = false;
        }
    }

    onCreateThing() {
        this.loadingData = true;
        this.tourService
            .post('things', this.thingForm.value)
            .toPromise()
            .then((response) => {
                console.log('addThing - success', response);
                this.drawer.nativeElement.checked = false;
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Neues Gepäck erfolgreich hinzugefügt',
                });
                this.getThings();
            })
            .catch((error) => {
                this.loadingData = false;
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Gepäck konnte nicht hinzugefügt werden',
                });
                console.error('addThing - error', error);
            });
    }

    onDragElement(thing: TourThing) {
        const drag: dragObject = {
            id: thing.thing_id,
            type: 'THING',
        };
        this.dragDropService.origin = drag;
    }

    async onDeleteTourThing(thing: Thing) {
        console.log('remove Thing', thing.id, 'from Tour', this.tourID);
        try {
            const response = await this.tourService.delete(`tourThings/${this.tourID}/${thing.id}`).toPromise();

            this.alertService.showAlertMessage({
                type: 'success',
                message: 'Gepäck erfolgreich entfernt',
            });
            await this.getTourThings();
            return { success: true, response };
        } catch (error) {
            this.alertService.showAlertMessage({
                type: 'error',
                message: 'Das hat nicht geklappt',
            });
            console.error('onRemoveThing - error', error);
            return { success: false, error };
        }
    }

    onSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchSubject.next(input.value);
    }

    onShowDeleteModal(thing: Thing) {
        if (thing) {
            this.thingToDelete = thing;
            this.deleteModal.nativeElement.showModal();
        }
    }
}
