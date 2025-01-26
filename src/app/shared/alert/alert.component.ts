import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { alertAnimation } from '../../core/animations/layout';
import { AlertService } from '../../core/services/alert.service';
import { Alert } from '../../core/services/alert.service';

export type Warning = 'success' | 'warning' | 'error';

@Component({
    selector: 'app-alert',
    standalone: true,
    imports: [MatIcon, NgClass],
    templateUrl: './alert.component.html',
    styleUrl: './alert.component.scss',
    animations: [alertAnimation],
})
export class AlertComponent {
    message: string = 'No Message Data';
    type: Warning = 'error';

    alertService = inject(AlertService);

    icon: string = 'report_gmailerrorred';
    isVisible: boolean = false;

    private timeoutId: any;

    ngOnInit() {
        this.alertService.onShowAlert.subscribe((alert: Alert) => {
            this.initAlert(alert);
        });
    }

    initAlert(alert: Alert) {
        this.isVisible = false; // Setzt den Zustand initial auf nicht sichtbar
        this.type = alert.type;
        switch (alert.type) {
            case 'success':
                this.icon = 'check_circle';
                break;
            case 'warning':
                this.icon = 'warning_amber';
                break;
            case 'error':
                this.icon = 'report_gmailerrorred';
                break;
            default:
                this.icon = 'question_mark';
                break;
        }
        this.message = alert.message;
        this.isVisible = true;

        // Bestehenden Timer abbrechen, falls vorhanden
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        // Neuer Timer zum Verstecken des Alerts
        this.timeoutId = setTimeout(() => {
            this.isVisible = false;
            this.timeoutId = null; // Timer zurücksetzen
        }, 2000);
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
    }
}
