import { Component, inject, ElementRef, ViewChild } from '@angular/core';
import {
    FormGroup,
    FormControl,
    FormsModule,
    Validators,
} from '@angular/forms';
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
import { Member } from '../../core/models/member';
import { Pagination } from '../../core/models/pagination';
import { PaginatorComponent } from '../../shared/paginator/paginator.component';
import { tableRowAnimation } from '../../core/animations/layout';

@Component({
    selector: 'app-members',
    standalone: true,
    imports: [
        FormsModule,
        MatIconModule,
        NgClass,
        ReactiveFormsModule,
        PaginatorModule,
        TableModule,
        HeaderComponent,
        PaginatorComponent,
    ],
    templateUrl: './members.component.html',
    styleUrl: './members.component.scss',
    animations: [tableRowAnimation]
})
export class MembersComponent {
    @ViewChild('drawer') drawer!: ElementRef<HTMLInputElement>;
    @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

    alertService = inject(AlertService);
    layoutService = inject(LayoutService);
    tourService = inject(ToursService);

    avatars: Avatar[] = AVATAR_LIST;
    editMode: boolean = false;
    members: Member[] = [];
    memberToDelete: Member = { name: '', id: 0, avatar: '' };
    loadingData: boolean = false;
    selectedAvatar: Avatar = { fileName: 'default.jpg', id: '0' };
    showFilter: boolean = false;

    pagination: Pagination = { limit: 10, offset: 0, page: 1 };

    memberForm = new FormGroup({
        avatar: new FormControl(''),
        id: new FormControl(0),
        name: new FormControl('', Validators.required),
    });

    private searchSubject = new Subject<string>();

    constructor() {
        this.searchSubject
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe((searchTerm) => {
                this.loadingData = true;
                this.pagination.filter = searchTerm;
                this.getMembers();
            });
    }

    ngOnInit() {
        this.getMembers();
        this.layoutService.setTopbarState('visible');
        this.layoutService.setFooterState('visible');
        this.layoutService.setBackgroundBlurred(true);
    }

    getMembers() {
        this.loadingData = true;
        this.tourService
            .get('participants', this.pagination)
            .toPromise()
            .then((response) => {
                this.members = response.participants;
                this.loadingData = false;
                this.pagination = response.pagination;
                console.log('getMmembers - success', this.members);
            })
            .catch((error) => {
                this.loadingData = false;
                console.error('getMmembers - error', error);
            });
    }

    getErrorSummary(): string {
        if (!this.memberForm || this.memberForm.valid) return '';
    
        const errorMessages: string[] = [];
    
        if (this.memberForm.get('name')?.hasError('required')) {
            errorMessages.push('Name ist erforderlich.');
        }
    
        return errorMessages.length > 0 ? errorMessages.join(' | ') : 'Formular enthält Fehler.';
    }

    selectAvatar(avatar: Avatar): void {
        if (this.selectedAvatar.id === avatar.id) {
            this.selectedAvatar = { fileName: 'default.jpg', id: '0' };
        } else {
            this.selectedAvatar = avatar;
        }
    }

    isSelected(avatar: Avatar): boolean {
        return this.selectedAvatar.id === avatar.id;
    }

    onNewMember() {
        this.memberForm.reset();
        this.selectedAvatar = { fileName: 'default.jpg', id: '0' };
        this.editMode = false;
    }

    addMember() {
        this.memberForm.get('avatar')?.setValue(this.selectedAvatar.id);
        this.loadingData = true;
        this.tourService
            .post('participants', this.memberForm.value)
            .toPromise()
            .then((response) => {
                console.log('addParticipant - success', response);
                this.drawer.nativeElement.checked = false;
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Neuer Teilnehmer erfolgreich hinzugefügt',
                });
                this.getMembers();
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

    showDeleteModal(member: Member) {
        if (member) {
            this.memberToDelete = member;
            this.deleteModal.nativeElement.showModal();
        }
    }

    deleteMember(id: number) {
        this.tourService
            .delete('participants/' + id)
            .toPromise()
            .then((response) => {
                this.getMembers();
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Teilnehmer erfolgreich entfernt',
                });
                console.log('Delete member - success', response);
            })
            .catch((error) => {
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Teilnehmer konnte nicht entfernt werden',
                });
                console.error('Delete member - error', error);
            });
    }

    onEditMember(member: Member) {
        const avatar = AVATAR_LIST.find(
            (avatar) => avatar.id === member.avatar
        );
        this.editMode = true;
        this.memberForm.patchValue(member);
        if (avatar) {
            this.selectedAvatar = avatar;
        } else {
            this.selectedAvatar = { fileName: 'default.jpg', id: '0' };
        }
        this.drawer.nativeElement.checked = true;
    }

    editMember() {
        this.memberForm.get('avatar')?.setValue(this.selectedAvatar.id);
        console.log(this.memberForm);
        this.tourService
            .put(
                'participants/' + this.memberForm.get('id')!.value,
                this.memberForm.value
            )
            .toPromise()
            .then((response) => {
                this.drawer.nativeElement.checked = false;
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Änderung gespeichert',
                });
                this.getMembers();
                console.log('Edit member - success', response);
            })
            .catch((error) => {
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Änderung konnte nicht gespeichert werden',
                });
                console.error('Edit member - error', error);
            });
    }

    onSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchSubject.next(input.value);
    }
}
