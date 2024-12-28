import { Component, inject, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';

import { LayoutService } from '../../core/services/layout.service';
import { PaginatorModule } from 'primeng/paginator';
import { Avatar, AVATAR_LIST } from '../../core/avatars/avatars';
import { TableModule } from 'primeng/table';
import { ToursService } from '../../core/services/tours.service';
import { HeaderComponent } from "../../shared/header/header.component";
import { AlertService } from '../../core/services/alert.service';

interface PageEvent {
    first: number;
    rows: number;
    page: number;
    pageCount: number;
}

@Component({
    selector: 'app-members',
    standalone: true,
    imports: [MatIconModule,ReactiveFormsModule, PaginatorModule, TableModule, HeaderComponent],
    templateUrl: './members.component.html',
    styleUrl: './members.component.scss',
})
export class MembersComponent {

    @ViewChild('drawer') drawer!: ElementRef<HTMLInputElement>;

    alertService = inject(AlertService)
    layoutService = inject(LayoutService);
    tourService = inject(ToursService)

    avatars: Avatar[] = AVATAR_LIST;
    members: String[] = [];
    loadingData: boolean = false;
    selectedAvatar: Avatar = { fileName: 'default.jpg', id: 0};

    memberForm = new FormGroup({
        avatar: new FormControl(0),
        id: new FormControl(''),
        name: new FormControl('', Validators.required),
    });

    ngOnInit() {
        this.getMembers();
        this.layoutService.setTopbarState('visible');
        this.layoutService.setFooterState('visible');
        this.layoutService.setBackgroundBlurred(true);
    }

    selectAvatar(avatar: Avatar): void {
        if (this.selectedAvatar.id === avatar.id) {
            // Wenn der Avatar bereits ausgewählt ist, abwählen
            this.selectedAvatar = { fileName: 'default.jpg', id: 0};
        } else {
            this.selectedAvatar = avatar;
        }
    }

    isSelected(avatar: Avatar): boolean {
        return this.selectedAvatar.id === avatar.id;
    }

    addMember() {
        this.memberForm.get('avatar')?.setValue(this.selectedAvatar.id) 
        this.loadingData = true;
        this.tourService.post('participants', this.memberForm.value)
        .toPromise()
        .then((response) => {
            console.log('addParticipant - success', response);
            this.drawer.nativeElement.checked = false;
            this.alertService.triggerAlertCall();
            this.getMembers();
        })
        .catch((error) => {
            this.loadingData = false;
            console.error('addParticipant - error', error);
        });
    }

    deleteMember(id: string) {
        this.tourService.delete('participants/' + id)
        .toPromise()
        .then((response) => {
            this.getMembers()
            console.log('Delete member - success', response);
        })
        .catch((error) => {
            console.error('Delete member - error', error);
        });
    }

    editMember() {
        console.log(this.memberForm)
        this.tourService.put('participants/' + this.memberForm.get('id')!.value, this.memberForm.value)
        .toPromise()
        .then((response) => {
            console.log('Edit member - success', response);
        })
        .catch((error) => {
            console.error('Edit member - error', error);
        });
    }

    getMembers() {
        this.loadingData = true;
        this.tourService.get('participants')
        .toPromise()
        .then((response) => {
            this.members = response.participants;
            this.loadingData = false;
            console.log('getMmembers - success', this.members);
        })
        .catch((error) => {
            this.loadingData = false;
            console.error('getMmembers - error', error);
        });
    }
}
