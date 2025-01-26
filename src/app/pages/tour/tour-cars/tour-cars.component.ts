import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from 'primeng/dragdrop';
import { DragDropService } from '../../../core/services/drag-drop.service';

@Component({
    selector: 'app-tour-cars',
    standalone: true,
    imports: [DragDropModule, MatIconModule],
    templateUrl: './tour-cars.component.html',
    styleUrl: './tour-cars.component.scss',
})
export class TourCarsComponent {
    droppedItems: string[] = [];

    dragDropService = inject(DragDropService);

    showDetails = false;
    mitfahrerListe = [
      { name: 'Max Mustermann', avatar: 'https://via.placeholder.com/32' },
      { name: 'Erika Mustermann', avatar: 'https://via.placeholder.com/32' },
      { name: 'John Doe', avatar: 'https://via.placeholder.com/32' },
      { name: 'Jane Smith', avatar: 'https://via.placeholder.com/32' },
      { name: 'Anna Müller', avatar: 'https://via.placeholder.com/32' },
    ];

    onDrop() {
        const item = this.dragDropService.sharedData;
        if (item) {
            this.droppedItems.push(item);
            this.dragDropService.sharedData = null; // Daten zurücksetzen
        }
    }
}
