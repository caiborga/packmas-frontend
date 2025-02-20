import {
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DragDropModule } from 'primeng/dragdrop';
import { AutoComplete } from 'primeng/autocomplete';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Member } from '../../../core/models/member';
import { Thing } from '../../../core/models/thing';
import { DragDropService } from '../../../core/services/drag-drop.service';
import { Avatar, AVATAR_LIST } from '../../../core/avatars/avatars';
import { ToursService } from '../../../core/services/tours.service';
import { AlertService } from '../../../core/services/alert.service';
import { Pagination } from '../../../core/models/pagination';
import { TourMembersObject, TourThingsObject } from '../../../core/models/tour';

@Component({
    selector: 'app-tour-members',
    standalone: true,
    imports: [
        AutoComplete,
        DragDropModule,
        InputGroup,
        InputGroupAddonModule,
        ReactiveFormsModule,
        MatIconModule,
        NgClass,
    ],
    templateUrl: './tour-members.component.html',
    styleUrl: './tour-members.component.scss',
})
export class TourMembersComponent {
    @Input() tourID: Number = 0;
    @Input() members: TourMembersObject = {
        ids: [],
        data: []
    };
    @Input() things: TourThingsObject = {
        ids: [],
        data: []
    };
    @Output() getData = new EventEmitter<boolean>();
    @ViewChild('drawer') drawer!: ElementRef<HTMLInputElement>;
    @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

    avatars: Avatar[] = AVATAR_LIST;
    dragDropService = inject(DragDropService);
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

    alertService = inject(AlertService);
    tourService = inject(ToursService);

    constructor() {
        this.searchSubject
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe((searchTerm) => {
                this.loadingData = true;
                this.pagination.filter = searchTerm;
                this.getMembers();
            });
    }

    addMember() {}

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

    onDropElement(member: Member) {

        const memberId = member.id;
        const burden = this.dragDropService.sharedData;

        if(burden.bearer){
            return
        }

        const memberToChange = this.members.ids.find(
            (id) => id === memberId
        );

        const memberToChangeData = this.members.data

        if (memberToChange) {
            // if (memberToChangeData[memberToChange].burden) {
            //     memberToChangeData[memberToChange].burden?.push(burden);
            //     console.log('Member burden changed:', memberToChange);
            // } else {
            //     memberToChangeData[memberToChange].burden = [];
            //     memberToChangeData[memberToChange].burden?.push(burden);
            //     console.log('Member burden changed:', memberToChange);
            // }

            this.updateTourMembers();
            this.updateTourThings(memberToChange, burden.id);
        } else {
            console.log('Member not found!');
        }
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

    isSelected(avatar: Avatar): boolean {
        return this.selectedAvatar.id === avatar.id;
    }

    selectAvatar(avatar: Avatar): void {
        if (this.selectedAvatar.id === avatar.id) {
            this.selectedAvatar = { fileName: 'default.jpg', id: '0' };
        } else {
            this.selectedAvatar = avatar;
        }
    }

    onAddMember(member: number, searchBox?: AutoComplete) {
        searchBox ? searchBox.clear() : '';
        console.log('add Member', member);
        this.members.ids.push(member);
        this.updateTourMembers()
            .then((result) => {
                if (result.success) {
                    this.alertService.showAlertMessage({
                        type: 'success',
                        message: 'Teilnehmer erfolgreich hinzugefügt',
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

    updateTourThings(member: number, tourThingId: number) {
        const burdenToChange = this.things.ids.find(
            (id) => id === tourThingId
        );


        if (burdenToChange) {
            this.things.data[burdenToChange].bearer = member;
            console.log('Burden changed:', burdenToChange);
        } else {
            console.log('Burden not found!');
        }

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

    onEditMember(member: Member) {}

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
