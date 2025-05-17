import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { TopbarComponent } from './layout/topbar/topbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { slideTopbar, slideFooter } from './core/animations/layout';
import { LayoutService, visibleState } from './core/services/layout.service';
import { NgClass, NgStyle } from '@angular/common';
import { AlertComponent } from "./shared/alert/alert.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, TopbarComponent, FooterComponent, NgClass, NgStyle, AlertComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    animations: [slideTopbar, slideFooter],
})
export class AppComponent {
    private topBarStateSubscription: Subscription;
    private footerStateSubscription: Subscription;
    private backgroundBlurredStateSubscription: Subscription;
    private backgroundSuccessStateSubscription: Subscription;
    private backgroundLinkSubscription: Subscription;
    private loadingSubscription: Subscription;

    layoutService = inject(LayoutService);  

    title = 'packmas';

    backgroundBlurred = false;
    topbarState = 'hidden';
    footerState = 'hidden';
    backgroundLink = '/assets/mountains.png';
    loading = false;

    constructor() {
        this.backgroundBlurredStateSubscription = this.layoutService.backgroundBlurred$.subscribe(
            (newValue) => {
                this.backgroundBlurred = newValue;
            }
        );
        this.backgroundSuccessStateSubscription = this.layoutService.backgroundSuccess$.subscribe(
            (newValue) => {
                this.backgroundBlurred = newValue;
            }
        );
        this.topBarStateSubscription = this.layoutService.topbarState$.subscribe(
            (newValue) => {
                this.topbarState = newValue;
            }
        );
        this.footerStateSubscription = this.layoutService.footerState$.subscribe(
            (newValue) => {
                this.footerState = newValue;
            }
        );
        this.backgroundLinkSubscription = this.layoutService.view$.subscribe(
            (newValue) => {
                this.backgroundLink = newValue;
            }
        )
        this.loadingSubscription = this.layoutService.loading$.subscribe(
            (newValue) => {
                this.loading = newValue;
                this.isLoading();
            }
        )
    }

    isLoading() {
        if(this.loading) {
            this.layoutService.setBackgroundBlurred(false);
        }else{
            this.layoutService.setBackgroundBlurred(true);
        }
    }
}
