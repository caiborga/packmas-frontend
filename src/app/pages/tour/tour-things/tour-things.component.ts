import {
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DragDropService } from '../../../core/services/drag-drop.service';
import { DragDropModule } from 'primeng/dragdrop';
import { AutoComplete } from 'primeng/autocomplete';

import { Pagination } from '../../../core/models/pagination';
import { AlertService } from '../../../core/services/alert.service';
import { ToursService } from '../../../core/services/tours.service';
import { initializeThing, Thing } from '../../../core/models/thing';
import { Member } from '../../../core/models/member';
import { TourMembersObject, TourThingsObject } from '../../../core/models/tour';

@Component({
    selector: 'app-tour-things',
    standalone: true,
    imports: [
        AutoComplete,
        DragDropModule,
        MatIconModule,
        ReactiveFormsModule,
        NgIf,
    ],
    templateUrl: './tour-things.component.html',
    styleUrl: './tour-things.component.scss',
})
export class TourThingsComponent {
    @Input() tourID: number = 0;
    @Input() members: TourMembersObject = {
        ids: [],
        data: []
    }
    @Input() things: TourThingsObject =  {
        ids: [],
        data: []
    }
    @Output() getData = new EventEmitter<boolean>();

    @ViewChild('drawer') drawer!: ElementRef<HTMLInputElement>;
    @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

    editMode: boolean = false;
    loadingData: boolean = false;
    pagination: Pagination = { limit: 10, offset: 0, page: 1 };
    searchedThings: Thing[] = [];
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
        this.searchSubject
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe((searchTerm) => {
                // this.loadingData = true;
                this.pagination.filter = searchTerm;
                this.getThings();
            });
    }

    getBearerAvatar(thing: Thing) {
        if (thing && thing.bearer) {
            const member = this.members.ids.find(
                (id) => id === thing.bearer
            )
            if (member) {
                return 'assets/images/avatars/' + this.members.data[member].avatar + 'thumbnail.jpg'
            } else {
                return 'assets/images/avatars/default.jpg'
            }
        } else { 
            return 'assets/images/avatars/default.jpg'
        }
        
    }

    getBearerName(thing: Thing) {
        let result = 'Nicht zugewiesen'
        if (thing.bearer) {
            const member = this.members.ids.find(
                (id) => id === thing.bearer
            )
            return result
        } else { 
            return result
        }
        
    }

    getThings() {
        // this.loadingData = true;
        this.tourService
            .get('things', this.pagination)
            .toPromise()
            .then((response) => {
                this.searchedThings = response.things;
                // this.loadingData = false;
                this.pagination = response.pagination;
                console.log('getThings - success', this.things.ids);
            })
            .catch((error) => {
                // this.loadingData = false;
                console.error('getThings - error', error);
            });
    }

    onAddThing(thing: Thing, searchBox?: AutoComplete) {
        this.loadingData = true;
        searchBox ? searchBox.clear() : '';
        console.log('add Thing', thing.id);
        this.things.ids.push(thing.id);
        this.updateTourThings()
            .then((result) => {
                if (result.success) {
                    this.loadingData = false;
                    this.alertService.showAlertMessage({
                        type: 'success',
                        message: 'Gepäck erfolgreich hinzugefügt',
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
                console.error('Unexpected error in onAddMember', error);
            });
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

    onDragElement(thing: Thing) {
        this.dragDropService.sharedData = thing;
    }

    onRemoveThing(thingId: number) {
        console.log('remove Member', thingId);
        this.things.ids = this.things.ids.filter((id) => id !== thingId);
        this.updateTourThings()
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

    showDeleteModal(thing: Thing) {
        if (thing) {
            this.thingToDelete = thing;
            this.deleteModal.nativeElement.showModal();
        }
    }

    updateTourThings() {
        const data = {
            tourThings: JSON.stringify(this.things.ids),
        };

        return this.tourService
            .put('tour/' + this.tourID + '/things', data)
            .toPromise()
            .then((response) => {
                this.getData.emit();
                console.log('updateTourThings - success', response);
                return { success: true, response }; // Erfolg zurückgeben
            })
            .catch((error) => {
                console.error('updateTourThings - error', error);
                return { success: false, error }; // Fehler zurückgeben
            });
    }
}
