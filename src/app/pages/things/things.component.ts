import { Component, inject, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { LayoutService } from '../../core/services/layout.service';
import { PaginatorModule } from 'primeng/paginator';
import { Avatar, AVATAR_LIST } from '../../core/avatars/avatars';
import { TableModule } from 'primeng/table';
import { ToursService } from '../../core/services/tours.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { AlertService } from '../../core/services/alert.service';
import { Thing } from '../../core/models/thing';
import { Pagination } from '../../core/models/pagination';

interface PageEvent {
    first: number;
    rows: number;
    page: number;
    pageCount: number;
}

@Component({
  selector: 'app-things',
  standalone: true,
  imports: [
    MatIconModule,
    NgClass,
    ReactiveFormsModule,
    PaginatorModule,
    TableModule,
    HeaderComponent,
],  templateUrl: './things.component.html',
  styleUrl: './things.component.scss'
})
export class ThingsComponent {

    @ViewChild('drawer') drawer!: ElementRef<HTMLInputElement>;
    @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

    alertService = inject(AlertService);
    layoutService = inject(LayoutService);
    tourService = inject(ToursService);

    avatars: Avatar[] = AVATAR_LIST;
    editMode: boolean = false;
    things: Thing[] = [];
    thingToDelete: Thing = { category: '', name: '', id: 0, weight: 0 };
    loadingData: boolean = false;
    pagination: Pagination = { limit: 10, offset: 0, page: 1 };

    selectedAvatar: Avatar = { fileName: 'default.jpg', id: '0' };

    thingForm = new FormGroup({
        category: new FormControl<string>(''),
        name: new FormControl<string>('', Validators.required),
        unit: new FormControl<number>(1),
        weight: new FormControl<number>(0, Validators.required),
    });

    private searchSubject = new Subject<string>();


    constructor() {
            this.searchSubject
                .pipe(debounceTime(300), distinctUntilChanged())
                .subscribe((searchTerm) => {
                    this.loadingData = true;
                    this.pagination.filter = searchTerm;
                    this.getThings();
                });
        }

    ngOnInit() {
        this.getThings();
        this.layoutService.setTopbarState('visible');
        this.layoutService.setFooterState('visible');
        this.layoutService.setBackgroundBlurred(true);
    }

    getThings() {
        this.loadingData = true;
        this.tourService
            .get('things', this.pagination)
            .toPromise()
            .then((response) => {
                this.things = response.things;
                this.loadingData = false;
                console.log('getThings - success', this.things);
            })
            .catch((error) => {
                this.loadingData = false;
                console.error('getThings - error', error);
            });
    }

    onNewThing() {
        this.thingForm.reset();
        this.editMode = false;
    }

    onSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchSubject.next(input.value);
    }

    addThing() {
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

    showDeleteModal(thing: Thing) {
        if (thing) {
            this.thingToDelete = thing;
            this.deleteModal.nativeElement.showModal();
        }
    }

    deleteThing(id: number) {
        this.tourService
            .delete('things/' + id)
            .toPromise()
            .then((response) => {
                this.getThings();
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Gepäck erfolgreich entfernt',
                });
                console.log('Delete thing - success', response);
            })
            .catch((error) => {
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Gepäck konnte nicht entfernt werden',
                });
                console.error('Delete thing - error', error);
            });
    }

    onEditThing(thing: any) {
        this.editMode = true;
        this.thingForm.patchValue(thing);
        this.drawer.nativeElement.checked = true;
    }

    editThing() {
        console.log(this.thingForm);
        this.tourService
            .put(
                'things/' + this.thingForm.get('id')!.value,
                this.thingForm.value
            )
            .toPromise()
            .then((response) => {
                this.drawer.nativeElement.checked = false;
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Änderung gespeichert',
                });
                this.getThings();
                console.log('Edit thing - success', response);
            })
            .catch((error) => {
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Änderung konnte nicht gespeichert werden',
                });
                console.error('Edit thing - error', error);
            });
    }
}
