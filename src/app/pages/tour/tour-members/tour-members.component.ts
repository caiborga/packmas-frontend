import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DragDropModule } from 'primeng/dragdrop';
import { AutoComplete } from 'primeng/autocomplete';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Member } from '../../../core/models/member';
import { initializeThing, Thing } from '../../../core/models/thing';
import { DragDropService, dragObject } from '../../../core/services/drag-drop.service';
import { Avatar, AVATAR_LIST } from '../../../core/avatars/avatars';
import { ToursService } from '../../../core/services/tours.service';
import { AlertService } from '../../../core/services/alert.service';
import { Pagination } from '../../../core/models/pagination';
import { initializeTourAssignments, TourAssignments, TourCarsObject, TourMembersObject, TourThingsObject } from '../../../core/models/tour';
import { IconComponent } from '../../../shared/icon/icon.component';
import { Car } from '../../../core/models/car';
import { WeightPipe } from '../../../core/pipes/customPipes';

@Component({
    selector: 'app-tour-members',
    standalone: true,
    imports: [AutoComplete, DragDropModule, InputGroup, InputGroupAddonModule, ReactiveFormsModule, MatIconModule, NgClass, IconComponent, WeightPipe],
    templateUrl: './tour-members.component.html',
    styleUrl: './tour-members.component.scss',
})
export class TourMembersComponent {
    @Input() tourID: Number = 0;
    @Input() cars: TourCarsObject = {
        ids: [],
        data: [],
    };
    @Input() members: TourMembersObject = {
        ids: [],
        data: [],
    };
    @Input() things: TourThingsObject = {
        ids: [],
        data: [],
        totalWeight: 0,
    };
    @Input() tourAssignments: TourAssignments = initializeTourAssignments();
    @Output() getData = new EventEmitter<boolean>();
    @ViewChild('drawer') drawer!: ElementRef<HTMLInputElement>;
    @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

    avatars: Avatar[] = AVATAR_LIST;
    editMode: boolean = false;
    loadingData: boolean = false;
    pagination: Pagination = { limit: 10, offset: 0, page: 1 };

    searchedMembers: Member[] = [];
    selectedAvatar: Avatar = { fileName: 'default.jpg', id: '0' };

    memberForm = new FormGroup({
        avatar: new FormControl(''),
        id: new FormControl(0),
        name: new FormControl('', Validators.required),
    });
    memberToDelete: Member = { name: '', id: 0, avatar: '' };

    private searchSubject = new Subject<string>();
    private assignmentData!: Subscription;

    dragDropService = inject(DragDropService);
    alertService = inject(AlertService);
    tourService = inject(ToursService);

    constructor() {
        this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((searchTerm) => {
            this.loadingData = true;
            this.pagination.filter = searchTerm;
            this.getMembers();
        });
        this.assignmentData = this.dragDropService.tourAssignmentsChange$.subscribe((data) => {
            this.tourAssignments = data;
        });
    }

    getMembers() {
        this.loadingData = true;
        this.tourService
            .get('participants', this.pagination)
            .toPromise()
            .then((response) => {
                this.searchedMembers = response.participants;
                this.loadingData = false;
                this.pagination = response.pagination;
                console.log('getMmembers - success', this.members);
            })
            .catch((error) => {
                this.loadingData = false;
                console.error('getMmembers - error', error);
            });
    }

    hasAssignments(id: number) {
        const check: dragObject = {
            id: id,
            type: 'MEMBER',
        };
        return this.dragDropService.hasAssignments(check);
    }

    isSelected(avatar: Avatar): boolean {
        return this.selectedAvatar.id === avatar.id;
    }

    onCreateMember() {
        this.memberForm.get('avatar')?.setValue(this.selectedAvatar.id);
        this.loadingData = true;
        this.tourService
            .post('participants', this.memberForm.value)
            .toPromise()
            .then((response: any) => {
                console.log('addParticipant - success', response);
                this.drawer.nativeElement.checked = false;
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Neuer Teilnehmer erfolgreich hinzugefügt',
                });
                this.onAddMember(response);
            })
            .catch((error) => {
                this.loadingData = false;
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Teilnehmer konnte nicht hinzugefügt werden',
                });
                console.error('addParticipant - error', error);
            });
    }

    onDropElement(member: number) {
        console.log('assignments', this.dragDropService.tourAssignmentObject);
        console.log('tourId', this.dragDropService.tourId);

        this.dragDropService.target = {
            id: member,
            type: 'MEMBER',
        };
        this.dragDropService.newAssignment();
    }

    onDragElement(member: number) {
        const drag: dragObject = {
            id: member,
            type: 'MEMBER',
        };
        this.dragDropService.origin = drag;
    }

    async onAddMember(member: number, searchBox?: AutoComplete) {
        try {
            searchBox?.clear();
            console.log('add Member', member);
            this.members.ids.push(member);

            // Insert new members into assignments
            for (const id of this.members.ids) {
                this.tourAssignments.members.set(id, { car: -1, things: [] });
            }

            // Beide Updates parallel ausführen
            const [assignmentsResult, membersResult] = await Promise.allSettled([this.updateTourAssignments(), this.updateTourMembers()]);

            // Verarbeite die Ergebnisse
            this.handleResult(assignmentsResult, 'Fehler beim Aktualisieren der Zuweisungen');
            this.handleResult(membersResult, 'Fehler beim Hinzufügen des Teilnehmers');
        } catch (error) {
            console.error('Unexpected error in onAddMember', error);
            this.alertService.showAlertMessage({
                type: 'error',
                message: 'Ein unerwarteter Fehler ist aufgetreten.',
            });
        }
    }

    private handleResult(result: PromiseSettledResult<any>, errorMessage: string) {
        if (result.status === 'fulfilled' && result.value?.success) {
            this.alertService.showAlertMessage({
                type: 'success',
                message: 'Teilnehmer erfolgreich hinzugefügt',
            });
        } else {
            console.error(errorMessage, result);
            this.alertService.showAlertMessage({
                type: 'error',
                message: errorMessage,
            });
        }
    }

    onRemoveMember(member: Member) {
        console.log('remove Member', member);
        this.members.ids = this.members.ids.filter((id) => id !== member.id);
        this.updateTourMembers()
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

    renderBurdenArray(member: number) {
        const memberData = this.tourAssignments.members.get(member);
        let result: { totalWeight: number; things: Thing[] } = {
            totalWeight: 0,
            things: [],
        };

        let totalWeight: number = 0;
        if (memberData) {
            for (let thing in memberData.things) {
                result.totalWeight += this.things.data[memberData.things[thing]].weight;
                result.things.push(this.things.data[memberData.things[thing]]);
            }
        }
        return result;
    }

    removeThingAssignment(id: number, burden: number) {
        this.dragDropService.unassignThingFromMember(burden);
    }

    getBurdenNumber(member: number) {
        const memberData = this.tourAssignments.members.get(member);
        if (memberData && memberData.things) {
            return memberData.things.length;
        } else {
            return 0;
        }
    }

    selectAvatar(avatar: Avatar): void {
        if (this.selectedAvatar.id === avatar.id) {
            this.selectedAvatar = { fileName: 'default.jpg', id: '0' };
        } else {
            this.selectedAvatar = avatar;
        }
    }

    updateTourAssignments() {
        const data = {
            tourAssignments: JSON.stringify(this.convertTourAssignmentsToJson(this.tourAssignments)),
        };

        return this.tourService
            .put('tour/' + this.tourID + '/assignments', data)
            .toPromise()
            .then((response) => {
                console.log('updateTourAssignments - success', response);
                return { success: true, response };
            })
            .catch((error) => {
                console.error('updateTourAssignments - error', error);
                return { success: false, error };
            });
    }

    convertTourAssignmentsToJson(assignments: TourAssignments) {
        return {
            members: Object.fromEntries(assignments.members),
            things: Object.fromEntries(assignments.things),
            cars: Object.fromEntries(assignments.cars),
        };
    }

    updateTourMembers() {
        const data = {
            tourMembers: JSON.stringify(this.members.ids),
        };

        return this.tourService
            .put('tour/' + this.tourID + '/participants', data)
            .toPromise()
            .then((response) => {
                this.getData.emit();
                console.log('editTourParticipants - success', response);
                return { success: true, response }; // Erfolg zurückgeben
            })
            .catch((error) => {
                console.error('editTourParticipants - error', error);
                return { success: false, error }; // Fehler zurückgeben
            });
    }

    showDeleteModal(member: Member) {
        if (member) {
            this.memberToDelete = member;
            this.deleteModal.nativeElement.showModal();
        }
    }

    onSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchSubject.next(input.value);
    }
}
