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
import { ControlType, Setting, View } from '../../core/models/setting';

interface ServerData {
    data: Setting[];
    table: string;
}

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [HeaderComponent, MatIconModule, NgClass, PaginatorModule, TableModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss',
    animations: [tableRowAnimation],
})
export class SettingsComponent {
    @ViewChild('addModal') addModal!: ElementRef<HTMLDialogElement>;
    @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

    alertService = inject(AlertService);
    layoutService = inject(LayoutService);
    tourService = inject(ToursService);

    loadingData = false;
    carsPagination: Pagination = { limit: 10, offset: 0, page: 1 };
    settingToDelete: Setting = { id: 0, value: '', table: '', control: 'UNDEFINED' };
    selectedSetting: Setting = {
        id: -1,
        value: '',
        table: '',
        control: 'UNDEFINED',
    };

    serverData: ServerData = {
        data: [],
        table: 'TABLE',
    };

    carSettings: Setting[] = [
        {
            id: 0,
            value: 'Marken',
            table: 'CAR_BRANDS',
            control: 'TABLE',
        },
        {
            id: 1,
            value: 'Varianten',
            table: 'CAR_VARIANTS',
            control: 'TABLE',
        },
    ];

    generalSettings: Setting[] = [
        {
            id: 0,
            value: 'Aussicht',
            table: 'GENERAL_VIEW',
            control: 'VIEW',
        },
        {
            id: 1,
            value: 'Varianten',
            table: 'GENERAL_SECURITY',
            control: 'VIEW',
        },
    ];

    thingSettings: Setting[] = [
        {
            id: 0,
            value: 'Einheiten',
            table: 'THING_UNITS',
            control: 'TABLE',
        },
        {
            id: 1,
            value: 'Kategorien',
            table: 'THING_CATEGORIES',
            control: 'TABLE',
        },
    ];

    views: View[] = [
        {
            name: 'Berge',
            link: '/assets/mountains.png',
        },
        {
            name: 'Stadt',
            link: '/assets/skyline.png',
        },
        {
            name: 'Landschaft',
            link: '/assets/landscape.png',
        },
    ];

    controlType: ControlType = 'UNDEFINED';

    ngOnInit() {
        this.layoutService.setTopbarState('visible');
        this.layoutService.setFooterState('visible');
        this.layoutService.setBackgroundBlurred(true);

        this.selectedSetting = this.generalSettings[0];
        this.controlType = 'VIEW';
    }

    getSettingData(table: string) {
        this.tourService
            .get('settings/' + table)
            .toPromise()
            .then((response) => {
                console.log('getSettingData - success', response);
                this.serverData.data = response.settings;
                this.serverData.table = table;
                this.loadingData = false;
            })
            .catch((error) => {
                console.error('getSettingData - error', error);
                this.loadingData = false;
            });
    }

    onDeleteSetting() {
        debugger;
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
        const table = this.serverData.table;
        this.tourService
            .post('settings/' + table, { value: value })
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

    onEdit(setting: Setting, value: string) {
        if (value === setting.value) {
            return;
        }
        const table = this.serverData.table;
        setting.value = value;
        this.tourService
            .put('settings', setting)
            .toPromise()
            .then((response) => {
                console.log('onEdit - success', response);
                this.alertService.showAlertMessage({
                    type: 'success',
                    message: 'Eintrag erfolgreich geändert',
                });
                this.getSettingData(table);
            })
            .catch((error) => {
                this.loadingData = false;
                this.alertService.showAlertMessage({
                    type: 'error',
                    message: 'Eintrag konnte nicht geändert werden',
                });
                console.error('onEdit - error', error);
            });
    }

    onSelectOption(setting: Setting) {
        this.selectedSetting = setting;
        this.getSettingData(setting.table);
        this.controlType = setting.control;
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

    setView(view: View) {
        this.layoutService.setView(view.link);
    }
}
