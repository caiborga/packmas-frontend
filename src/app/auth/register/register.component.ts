import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
    @ViewChild(MessageBoxComponent) messageBox!: MessageBoxComponent

    name: string = ''
    link: string = ''

    constructor(
        private authService: AuthService,
        private clipboard: Clipboard,
        private router: Router,
        private tourService: TourService,
        private localStorage: LocalStorageService
    ) {}

    copyToClipboard() {
        let message: Message = {
            type: 'info',
            message: `Link wurde in die Zwischenablage kopiert!`
        }
        this.clipboard.copy(this.link);
        this.messageBox.changeSuccessMessage(message);

    }

    registerGroup() {
        let data = { 
            name: this.name
        }
        this.tourService.post('register', data)
        .toPromise()
        .then((response: any) => {
            console.log('registerGroup - success', response.message);
            this.authService.login()
            this.localStorage.setItem('key', response.key)
            this.link = `https://caiborga.github.io/mtc-frontend/browser/#/home/${response.key}/`
        })
        .catch((error) => {
            console.error('registerGroup - error', error);
        });
    }
}
