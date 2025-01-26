import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Warning } from '../../shared/alert/alert.component';

export interface Alert {
    type: Warning,
    message: string
}

@Injectable({
    providedIn: 'root',
})
export class AlertService {
    private showAlert = new Subject<Alert>();
    onShowAlert = this.showAlert.asObservable();

    showAlertMessage(alert: Alert) {
        this.showAlert.next(alert);
    }
}
