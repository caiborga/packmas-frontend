import { Component, inject, ElementRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { Pagination } from '../../core/models/pagination';
import { HeaderComponent } from '../../shared/header/header.component';
import { LayoutService } from '../../core/services/layout.service';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { tableRowAnimation } from '../../core/animations/layout';
import { ToursService } from '../../core/services/tours.service';
import { AlertService } from '../../core/services/alert.service';
import { Setting } from '../../core/models/setting';

interface ServerData {
    data: Setting[]
    table: string
}

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [HeaderComponent, MatIconModule, NgClass, PaginatorModule, TableModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss',
    animations: [tableRowAnimation]
})

export class SettingsComponent {
    @ViewChild('addModal') addModal!: ElementRef<HTMLDialogElement>;
    @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

    alertService = inject(AlertService);
    layoutService = inject(LayoutService);
    tourService = inject(ToursService);

    loadingData = false;
    carsPagination: Pagination = { limit: 10, offset: 0, page: 1 }
    brands = ['Skoda', 'VW', 'Maserati']
    settingToDelete: Setting = { id: 0, value: '', table: '' }
    selectedSetting: Setting = {
        id: -1,
        value: '',
        table: ''
    }

    serverData: ServerData = {
        data: [],
        table: 'TABLE'
    }

    carSettings: Setting[] = [
        {
            id: 0,
            value: 'Marken',
            table: 'CAR_BRANDS'
        },
        {
            id: 1,
            value: 'Varianten',
            table: 'CAR_VARIANTS'
        }
    ]

    generalSettings: Setting[] = [
        {
            id: 0,
            value: 'Aussicht',
            table: 'GENERAL_VIEW'
        },
        {
            id: 1,
            value: 'Varianten',
            table: 'GENERAL_SECURITY'
        }
    ]

    thingSettings: Setting[] = [
        {
            id: 0,
            value: 'Einheiten',
            table: 'THING_UNITS'
        },
        {
            id: 1,
            value: 'Kategorien',
            table: 'THING_CATEGORIES'
        }
    ]

    ngOnInit() {
        this.layoutService.setTopbarState('visible');
        this.layoutService.setFooterState('visible');
        this.layoutService.setBackgroundBlurred(true);
    }

    getSettingData(table: string) {
        this.tourService
            .get('settings/' + table)
            .toPromise()
            .then((response) => {
                console.log('getSettingData - success', response);
                this.serverData = response
                this.loadingData = false;
            })
            .catch((error) => {
                console.error('getSettingData - error', error);
                this.loadingData = false;
            }
        );
    }

    onDeleteSetting() {
        this.tourService
            .delete('settings/' + this.settingToDelete.table + '/' + this.settingToDelete.id)
            .toPromise()
            .then((response) => {
                this.getSettingData(this.settingToDelete.table);
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Eintrag erfolgreich entfernt',
                });
                console.log('onDeleteSetting - success', response);
            })
            .catch((error) => {
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Eintrag konnte nicht entfernt werden',
                });
                console.error('onDeleteSetting - error', error);
            });
    }

    onAddSetting(value: string) {
        const table = this.serverData.table
        this.tourService
            .post('settings/' + table, {value: value})
            .toPromise()
            .then((response) => {
                console.log('onAddSetting - success', response);
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Neuer Eintrag erfolgreich hinzugefügt',
                });
                this.getSettingData(table);
            })
            .catch((error) => {
                this.loadingData = false;
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Eintrag konnte nicht hinzugefügt werden',
                });
                console.error('onAddSetting - error', error);
            });
    }

    onEdit(setting: Setting) {
    }

    onSelectOption(setting: Setting) {
        this.selectedSetting = setting
        this.getSettingData(setting.table)
    }

    onShowAddEntryModal() {
        this.addModal.nativeElement.showModal();
    }

    showDeleteModal(setting: Setting) {
        if (setting) {
            this.settingToDelete = setting;
            this.deleteModal.nativeElement.showModal();
        }
    }
}
