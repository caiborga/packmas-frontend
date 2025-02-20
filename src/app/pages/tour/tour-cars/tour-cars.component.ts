import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from 'primeng/dragdrop';
import { DragDropService } from '../../../core/services/drag-drop.service';
import { Car } from '../../../core/models/car';
import { TourCarsObject, TourMembersObject } from '../../../core/models/tour';

@Component({
    selector: 'app-tour-cars',
    standalone: true,
    imports: [DragDropModule, MatIconModule],
    templateUrl: './tour-cars.component.html',
    styleUrl: './tour-cars.component.scss',
})
export class TourCarsComponent {
    @Input() tourCars: TourCarsObject = {
        ids: [],
        data: [],
    };
    @Input() members: TourMembersObject = {
        ids: [],
        data: [],
    };
    droppedItems: string[] = [];

    dragDropService = inject(DragDropService);

    onAddCar() {
        const newCar: Car = {
            id: -1,
            driver: 0,
            name: 'Neues Auto',
            passengers: [],
            seats: 4,
        };
    }

    onDrop() {
        const item = this.dragDropService.sharedData;
        if (item) {
            this.droppedItems.push(item);
            this.dragDropService.sharedData = null;
        }
    }
}
