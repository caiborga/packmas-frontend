import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation  } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { addKeyInterceptor } from './core/interceptors/add-key.interceptor';
import { AuthGuard } from './core/guards/auth-guard.guard';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes, withHashLocation()),
        provideHttpClient(withFetch()),
        provideHttpClient(withInterceptors([addKeyInterceptor])),
        provideAnimations(),
        AuthGuard, 
        provideAnimationsAsync(),
        providePrimeNG({ 
            theme: {
                preset: Aura
            }
        })
    ],
};
