import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pagination } from '../../core/models/pagination';

@Component({
    selector: 'app-paginator',
    standalone: true,
    imports: [FormsModule, NgClass],
    templateUrl: './paginator.component.html',
    styleUrl: './paginator.component.scss',
})
export class PaginatorComponent implements OnChanges{
    @Input() pagination: Pagination = { limit: 10, offset: 0, page: 1 };
    @Output() getData = new EventEmitter();
    @Output() paginationChange = new EventEmitter<Pagination>();

    pages: number[] = [];

    ngOnChanges(changes: SimpleChanges) {
        if (changes['pagination']) {
            this.pagination = changes['pagination'].currentValue
            if (this.pagination.total) {
                let pagesCount = this.pagination.total / this.pagination.limit;
                for (let page = 0; page < pagesCount; page++) {
                    this.pages.push(page);
                }
            }
        }
    }

    onLimitChange() {
        this.getData.emit()
    }
}
