import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { initializeTourAssignments, TourAssignments } from '../models/tour';
import { ToursService } from './tours.service';

type dragObjectType = 'CAR' | 'THING' | 'MEMBER' | 'UNDEFINED';

export interface dragObject {
    id: number;
    type: dragObjectType;
}

@Injectable({
    providedIn: 'root',
})
export class DragDropService {
    public origin: dragObject = {
        id: -1,
        type: 'UNDEFINED',
    };

    public target: dragObject = {
        id: -1,
        type: 'UNDEFINED',
    };

    tourAssignmentObject: TourAssignments = initializeTourAssignments();

    public tourId: number = -1;

    tourService = inject(ToursService);

    private assignmentsData = new BehaviorSubject<TourAssignments>(this.tourAssignmentObject);
    tourAssignmentsChange$: Observable<TourAssignments> = this.assignmentsData.asObservable();

    constructor() {}

    setAssignments(tourAssignments: TourAssignments) {
        this.tourAssignmentObject = this.convertJsonToTourAssignments(tourAssignments);
    }

    convertJsonToTourAssignments(json: any): TourAssignments {
        return {
            members: new Map<number, { car: number; things: number[] }>(
                Object.entries(json.members).map(([key, value]) => [
                    Number(key),
                    value as { car: number; things: number[] }, // Explizite Typisierung
                ])
            ),
            things: new Map<number, { member: number }>(
                Object.entries(json.things).map(([key, value]) => [
                    Number(key),
                    value as { member: number }, // Explizite Typisierung
                ])
            ),
            cars: new Map<number, { members: number[] }>(
                Object.entries(json.cars).map(([key, value]) => [
                    Number(key),
                    value as { members: number[] }, // Explizite Typisierung
                ])
            ),
        };
    }

    newAssignment(): void {
        switch (this.target.type) {
            case 'UNDEFINED':
                console.log('drag-drop service - newAssignment: UNDEFINED type');
                break;
            case 'CAR':
                this.assignToCar();
                break;
            case 'MEMBER':
                this.assignToMember();
                break;
            case 'THING':
                this.assignToThing();
                break;
            default:
                console.log('drag-drop service - newAssignment: error');
        }
    }

    assignToCar() {
        if (this.origin.type === 'MEMBER') {
            if (this.tourAssignmentObject.cars.has(this.target.id)) {
                const carPassengers = this.tourAssignmentObject.cars.get(this.target.id);
                if (carPassengers) {
                    if (!carPassengers.members.includes(this.origin.id)) {
                        carPassengers.members.push(this.origin.id);
                        this.tourAssignmentObject.cars.set(this.target.id, carPassengers);
                    } else {
                        console.log(`Member ${this.origin.id} ist bereits in Auto ${this.target.id}`);
                    }
                }
            } else {
                this.tourAssignmentObject.cars.set(this.target.id, {
                    members: [this.origin.id],
                });
                this.updateTourAssignments();
            }
        } else {
            console.log('assignCar - Assignment not possible');
        }
    }

    assignToMember() {
        if (this.origin.type === 'THING') {
            const thing = this.tourAssignmentObject.things.get(this.origin.id);
            if (thing) {
                console.log('assignToMember - Thing is already assigned');
                return;
            }

            // Check if thing is already assigned to member
            const member = this.tourAssignmentObject.members.get(this.target.id);
            if (member) {
                if (member.things.includes(this.origin.id)) {
                    console.log(`Thing ${this.origin.id} ist bereits Member ${this.target.id} zugeordnet`);
                } else {
                    // Get old values
                    const things = member.things;
                    things.push(this.origin.id);
                    // Update member
                    member.things = things;
                    console.log(`Thing ${this.origin.id} Member ${this.target.id} zugeordnet`);
                    // Update thing
                    this.tourAssignmentObject.things.set(this.origin.id, { member: this.target.id });
                    // Refresh
                    this.updateTourAssignments();
                }
            }
        } else if (this.origin.type === 'CAR') {
        } else {
            console.log('assignCar - Assignment not possible');
        }
    }

    assignToThing() {
        if (this.origin.type === 'MEMBER') {
            if (this.tourAssignmentObject.things.has(this.target.id)) {
                const thing = this.tourAssignmentObject.things.get(this.target.id);
                if (thing) {
                    if (thing.member !== this.origin.id) {
                        thing.member = this.origin.id;
                        this.tourAssignmentObject.things.set(this.target.id, {
                            member: this.origin.id,
                        });
                    } else {
                        console.log(`Member ${this.origin.id} ist bereits Thing ${this.target.id} zugeordnet`);
                    }
                }
            } else {
                this.tourAssignmentObject.things.set(this.target.id, {
                    member: this.origin.id,
                });
                this.updateTourAssignments();
            }
        } else {
            console.log('assignThing - Assignment not possible');
        }
    }

    updateTourAssignments() {
        const data = {
            tourAssignments: JSON.stringify(this.convertTourAssignmentsToJson(this.tourAssignmentObject)),
        };

        return this.tourService
            .put('tour/' + this.tourId + '/assignments', data)
            .toPromise()
            .then((response) => {
                console.log('updateTourAssignments - success', response);
                this.assignmentsData.next(this.tourAssignmentObject);
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

    hasAssignments(assignment: dragObject): boolean {
        const tourAssignments = this.tourAssignmentObject;
        let result = false;

        /** Prüft, ob ein Member noch zugewiesene Things oder ein Car hat */
        function hasMemberAssignments(memberId: number): boolean {
            const memberData = tourAssignments.members.get(memberId);
            if (!memberData) return false;

            // Prüfen, ob Car-Zuweisung oder Things vorhanden sind
            return memberData.car !== -1 || memberData.things.length > 0;
        }

        /** Prüft, ob ein Thing noch einem Member zugeordnet ist */
        function hasThingAssignments(thingId: number): boolean {
            if (!tourAssignments.things.has(thingId)) return false;

            const thingData = tourAssignments.things.get(thingId);
            if (!thingData) return false;

            // Prüfen, ob ein gültiger Member zugewiesen ist
            return tourAssignments.members.has(thingData.member);
        }

        /** Prüft, ob ein Car noch Members enthält */
        function hasCarAssignments(carId: number): boolean {
            if (!tourAssignments.cars.has(carId)) return false;

            const carData = tourAssignments.cars.get(carId);
            if (!carData) return false;

            // Prüfen, ob Members zugewiesen sind
            return carData.members.length > 0;
        }

        switch (assignment.type) {
            case 'CAR':
                result = hasCarAssignments(assignment.id);
                break;
            case 'THING':
                result = hasThingAssignments(assignment.id);
                break;
            case 'MEMBER':
                result = hasMemberAssignments(assignment.id);
                break;
            default:
                console.log('hasAssignments - type error');
        }
        return result;
    }

    /** Löst einen Member von seinem Car */
    unassignMemberFromCar(memberId: number): void {
        if (!this.tourAssignmentObject.members.has(memberId)) return;

        const memberData = this.tourAssignmentObject.members.get(memberId);
        if (memberData && memberData.car !== null) {
            const carId = memberData.car;

            // Entferne Member von Car
            if (this.tourAssignmentObject.cars.has(carId)) {
                const carData = this.tourAssignmentObject.cars.get(carId);
                if (carData) {
                    carData.members = carData.members.filter((id) => id !== memberId);
                    this.tourAssignmentObject.cars.set(carId, carData);
                }
            }

            // Entferne Car-Zuordnung beim Member
            memberData.car = -1;
            this.tourAssignmentObject.members.set(memberId, memberData);
            this.updateTourAssignments();
        }
    }

    /** Löst einen Member von einem bestimmten Thing */
    unassignThingFromMember(thingId: number): void {
        if (!this.tourAssignmentObject.things.has(thingId)) return;

        const thingData = this.tourAssignmentObject.things.get(thingId);
        if (thingData) {
            const memberId = thingData.member;

            // Entferne Thing aus dem Member-Array
            if (this.tourAssignmentObject.members.has(memberId)) {
                const memberData = this.tourAssignmentObject.members.get(memberId);
                if (memberData) {
                    memberData.things = memberData.things.filter((id) => id !== thingId);
                    this.tourAssignmentObject.members.set(memberId, memberData);
                }
            }

            // Entferne Thing-Zuordnung
            this.tourAssignmentObject.things.delete(thingId);
            this.updateTourAssignments();
        }
    }

    /** Löst ein Car von einem bestimmten Member */
    unassignCarFromMember(memberId: number, carId: number): void {
        if (!this.tourAssignmentObject.members.has(memberId) || !this.tourAssignmentObject.cars.has(carId)) return;

        const memberData = this.tourAssignmentObject.members.get(memberId);
        const carData = this.tourAssignmentObject.cars.get(carId);

        if (memberData && carData && memberData.car === carId) {
            // Entferne das Car vom Member
            memberData.car = -1;
            this.tourAssignmentObject.members.set(memberId, memberData);

            // Entferne den Member aus der Car-Liste
            carData.members = carData.members.filter((id) => id !== memberId);
            this.tourAssignmentObject.cars.set(carId, carData);
            this.updateTourAssignments();
        }
    }

    /** Löst einen Member von einem Thing (Alternative zur Thing-Löschung) */
    unassignMemberFromThing(memberId: number, thingId: number): void {
        if (!this.tourAssignmentObject.things.has(thingId)) return;

        const thingData = this.tourAssignmentObject.things.get(thingId);
        if (thingData && thingData.member === memberId) {
            // Entferne das Thing von dem Member
            if (this.tourAssignmentObject.members.has(memberId)) {
                const memberData = this.tourAssignmentObject.members.get(memberId);
                if (memberData) {
                    memberData.things = memberData.things.filter((id) => id !== thingId);
                    this.tourAssignmentObject.members.set(memberId, memberData);
                }
            }

            // Entferne die Zuweisung aus `things`
            this.tourAssignmentObject.things.delete(thingId);
            this.updateTourAssignments();
        }
    }

    
}
