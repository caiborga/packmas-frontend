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
import { Member, TourMember } from '../../../core/models/member';
import { initializeThing, Thing } from '../../../core/models/thing';
import { DragDropService, dragObject } from '../../../core/services/drag-drop.service';
import { Avatar, AVATAR_LIST } from '../../../core/avatars/avatars';
import { ToursService } from '../../../core/services/tours.service';
import { AlertService } from '../../../core/services/alert.service';
import { Pagination } from '../../../core/models/pagination';
import { initializeTourAssignments, TourAssignments } from '../../../core/models/tour';
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
    @Output() tourMembersCount = new EventEmitter<number>();
    @ViewChild('drawer') drawer!: ElementRef<HTMLInputElement>;
    @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

    avatars: Avatar[] = AVATAR_LIST;
    editMode: boolean = false;
    loadingData: boolean = false;
    pagination: Pagination = { limit: 10, offset: 0, page: 1 };

    searchedMembers: Member[] = [];
    selectedAvatar: Avatar = { fileName: 'default.jpg', id: '0' };
    memberToDelete: Member = { name: '', id: 0, avatar: '' };

    tourMembers: TourMember[] = [];
    tourMembersData: Member[] = [];

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
    }

    ngOnInit() {
        this.getTourMembers();
    }

    getMembers() {
        this.loadingData = true;
        this.tourService
            .get('members', this.pagination)
            .toPromise()
            .then((response) => {
                this.searchedMembers = response.participants;
                this.loadingData = false;
                this.pagination = response.pagination;
                // console.log('getMembers - success', this.members);
            })
            .catch((error) => {
                this.loadingData = false;
                console.error('getMmembers - error', error);
            });
    }

    getTourMembers() {
        //  this.loadingData = true;
        const params = {
            ...this.pagination,
            tourId: this.tourID,
        };
        this.tourService
            .get('tourMembers', params)
            .toPromise()
            .then((response) => {
                this.tourMembers = response.tourMembers;
                this.tourMembersData = response.data.members;
                this.tourMembersCount.emit(this.tourMembers.length)
                this.pagination = response.pagination;
                console.log('getTourMembers - success', response);
            })
            .catch((error) => {
                // this.loadingData = false;
                console.error('getTourMembers - error', error);
            });
    }

    onDropElement(member: TourMember) {
        // console.log('assignments', this.dragDropService.tourAssignmentObject);
        // console.log('tourId', this.dragDropService.tourId);
        // this.dragDropService.target = {
        //     id: member,
        //     type: 'MEMBER',
        // };
        // this.dragDropService.newAssignment();
    }

    onDragElement(member: TourMember) {
        // const drag: dragObject = {
        //     id: member,
        //     type: 'MEMBER',
        // };
        // this.dragDropService.origin = drag;
    }

    async onRemoveTourMember(memberId: number) {
        console.log('remove Member', memberId, 'from Tour', this.tourID);
        try {
            const response = await this.tourService.delete(`tourMembers/${this.tourID}/${memberId}`).toPromise();
            this.alertService.showAlertMessage({
                type: 'success',
                message: 'Teilnehmer erfolgreich entfernt',
            });
            console.log('onRemoveTourMember - success', response);
            await this.getTourMembers();
            return { success: true, response };
        } catch (error) {
            console.error('onRemoveTourMember - error', error);
            return { success: false, error };
        }
    }

    getBurdenNumber(member: number) {
        // const memberData = this.tourAssignments.members.get(member);
        // if (memberData && memberData.things) {
        //     return memberData.things.length;
        // } else {
        //     return 0;
        // }
    }

    showDeleteModal(member: Member) {
        if (member) {
            this.memberToDelete = member;
            this.deleteModal.nativeElement.showModal();
        }
    }

    async onAddMember(member: Member, searchBox?: AutoComplete) {
        this.loadingData = true;

        if (searchBox) {
            searchBox.clear();
        }

        console.log('add Member', member.id);

        const data = {
            member_id: member.id,
            tour_id: this.tourID,
        };

        try {
            const response = await this.tourService.post('tourMembers', data).toPromise();
            console.log('onAddMember - success', response);

            await this.getTourMembers();

            this.alertService.showAlertMessage({
                type: 'success',
                message: 'Auto erfolgreich hinzugefügt',
            });
        } catch (error) {
            console.error('onAddMember - error', error);
            this.alertService.showAlertMessage({
                type: 'error',
                message: 'Das hat leider nicht geklappt',
            });
        } finally {
            this.loadingData = false;
        }
    }

    onSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchSubject.next(input.value);
    }

    renderBurdenArray(member: number) {
        // const memberData = this.tourAssignments.members.get(member);
        // let result: { totalWeight: number; things: Thing[] } = {
        //     totalWeight: 0,
        //     things: [],
        // };

        // let totalWeight: number = 0;
        // if (memberData) {
        //     for (let thing in memberData.things) {
        //         // result.totalWeight += this.things.data[memberData.things[thing]].weight;
        //         // result.things.push(this.things.data[memberData.things[thing]]);
        //     }
        // }
        // return result;
    }

    removeThingAssignment(id: number, burden: number) {
        this.dragDropService.unassignThingFromMember(burden);
    }

    hasAssignments(id: number) {
        const check: dragObject = {
            id: id,
            type: 'MEMBER',
        };
        return this.dragDropService.hasAssignments(check);
    }
}
