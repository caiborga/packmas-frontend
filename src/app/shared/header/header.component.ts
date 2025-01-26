import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
    @Input() breadCrumbs: String[] = []
    @Input() title: String = 'no title'
    @Input() subTitle: string = 'no subtitle'
}
