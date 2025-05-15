import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'weight',
    standalone: true
})
export class WeightPipe implements PipeTransform {
    transform(value: number, unit: string = 'g'): string {
        if (!value && value !== 0) return '0 g';

        if (unit === 'g' && value >= 1000) {
            return (value / 1000).toFixed(2) + ' kg';
        } else {
            return value + ' g';
        }
    }
}
