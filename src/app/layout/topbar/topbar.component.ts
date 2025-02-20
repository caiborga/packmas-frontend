import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [MatIconModule, RouterModule],
    templateUrl: './topbar.component.html',
    styleUrl: './topbar.component.scss',
})
export class TopbarComponent {}
