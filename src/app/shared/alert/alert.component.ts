import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { alertAnimation } from '../../core/animations/layout';

export type Warning = "success" | "warning" | "error";

@Component({
    selector: 'app-alert',
    standalone: true,
    imports: [MatIcon, NgClass, NgIf],
    templateUrl: './alert.component.html',
    styleUrl: './alert.component.scss',
    animations: [alertAnimation]
})
export class AlertComponent {
    @Input() message: string = 'No Message Data';
    @Input() type: Warning = 'error'

    icon: string = 'report_gmailerrorred'
    isVisible: boolean = false;

    ngOnInit() {
        switch (this.type) {
            case 'success':
                this.icon = 'check_circle'
                break;
            case 'warning':
                this.icon = 'warning_amber'
                break;
            case 'error':
                this.icon = 'report_gmailerrorred'
                break;
            default:
                this.icon = 'question_mark'
                break;
        }
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
    }
}
