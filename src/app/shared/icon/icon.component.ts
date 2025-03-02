import { Component, Input } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';

@Component({
    selector: 'app-icon',
    standalone: true,
    imports: [NgClass, NgStyle],
    templateUrl: './icon.component.html',
    styleUrl: './icon.component.scss',
})
export class IconComponent {
    @Input() avatarNumber: string = '';
    @Input() name: string = '';
    @Input() number: number = 0;
    @Input() backGroundcolor: string = '';
    @Input() type: string = '';
    abbreviation: string = '';

    ngOnInit() {
        this.abbreviation = Array.from(this.name)[0];
    }

    getContrastColor(bgColor: string): string {
        // Entferne das "#" falls vorhanden
        const color = bgColor.startsWith("#") ? bgColor.substring(1) : bgColor;
    
        // Konvertiere Hex in RGB
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
    
        // Berechne die relative Helligkeit (Luminanz)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
        // Falls die Farbe dunkel ist, nutze weißen Text, sonst schwarzen
        return brightness > 128 ? "#000000" : "#ffffff";
      }

}
