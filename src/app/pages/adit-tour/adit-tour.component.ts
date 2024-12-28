import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { FormControl, FormGroup } from '@angular/forms';
import { LayoutService } from '../../core/services/layout.service';
import { HeaderComponent } from "../../shared/header/header.component";

@Component({
    selector: 'app-adit-tour',
    standalone: true,
    imports: [DatePicker, ReactiveFormsModule, FormsModule, HeaderComponent],
    templateUrl: './adit-tour.component.html',
    styleUrl: './adit-tour.component.scss',
})
export class AditTourComponent {
    layoutService = inject(LayoutService);

    name = new FormControl('');
    dates: Date | undefined;
    tourForm = new FormGroup({
        dates: new FormControl<Date[] | undefined>([]), 
        firstName: new FormControl(''),
        lastName: new FormControl(''),
    });

    memberForm = new FormGroup({
        avatar: new FormControl(0),
        id: new FormControl(''),
        name: new FormControl('', Validators.required),
    });

    ngOnInit() {
        this.layoutService.setTopbarState('visible');
        this.layoutService.setFooterState('visible');
        this.layoutService.setBackgroundBlurred(true);
    }
}
