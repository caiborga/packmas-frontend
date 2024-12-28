import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type visibleState = "visible" | "hidden";

@Injectable({
    providedIn: 'root',
})
export class LayoutService {

    private backgroundBlurred = new BehaviorSubject<boolean>(false);
    private backGroundSuccess = new BehaviorSubject<boolean>(false);
    private topbarState = new BehaviorSubject<visibleState>('hidden');
    private footerState = new BehaviorSubject<visibleState>('hidden');

    public backgroundBlurred$: Observable<boolean> = this.backgroundBlurred.asObservable();
    public backgroundSuccess$: Observable<boolean> = this.backgroundBlurred.asObservable();
    public topbarState$: Observable<string> = this.topbarState.asObservable();
    public footerState$: Observable<string> = this.footerState.asObservable();

    constructor() {}

    setBackgroundBlurred(status: boolean): void {
        this.backgroundBlurred.next(status);
    }

    setBackgroundSuccess(): void {
        this.backgroundBlurred.next(true);
        setInterval(() => {
            this.backgroundBlurred.next(false); 
        }, 1000);
    }

    setTopbarState(status: visibleState): void {
        this.topbarState.next(status);
    }

    setFooterState(status: visibleState): void {
        this.footerState.next(status);
    }
}
