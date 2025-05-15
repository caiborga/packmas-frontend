import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ToursService } from './tours.service';

export type dragObjectType = 'CAR' | 'THING' | 'MEMBER' | 'UNDEFINED';

export interface dragObject {
    id: number;
    type: dragObjectType;
}

@Injectable({
    providedIn: 'root',
})
export class DragDropService {
    tourService = inject(ToursService);

    public origin: dragObject = {
        id: -1,
        type: 'UNDEFINED',
    };

    public target: dragObject = {
        id: -1,
        type: 'UNDEFINED',
    };

    private callGetTourCarData = new Subject<void>();
    callGetTourCarData$ = this.callGetTourCarData.asObservable();

    private callGetTourMemberData = new Subject<void>();
    callGetTourMemberData$ = this.callGetTourMemberData.asObservable();

    private callGetTourThingData = new Subject<void>();
    callGetTourThingData$ = this.callGetTourThingData.asObservable();

    private dropType = new BehaviorSubject<dragObjectType>('UNDEFINED');
    public dropType$ = this.dropType.asObservable();


    reloadData(dataType: 'CARS' | 'MEMBERS' | 'THINGS') {
        switch (dataType) {
            case 'CARS':
                this.callGetTourCarData.next();
                break;
            case 'MEMBERS':
                this.callGetTourMemberData.next();
                break;
            case 'THINGS':
                this.callGetTourThingData.next();
                break;
            default:
                console.log('tourMembers -> reloadData() - type unknown')
        } 
    }

    setDropType(type: dragObjectType) {
        this.dropType.next(type);
    }
}
