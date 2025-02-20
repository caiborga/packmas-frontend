import { Routes } from '@angular/router';

//Componentes
// import { HomeComponent } from './pages/home/home.component';
// import { PlannerComponent } from './pages/planner/planner.component';
import { ThingsComponent } from './pages/things/things.component';
import { RegisterComponent } from './auth/register/register.component';
// import { NotfoundComponent } from './pages/notfound/notfound.component';
import { AuthGuard } from './core/guards/auth-guard.guard';
import { ToursComponent } from './pages/tours/tours.component';
import { AditTourComponent } from './pages/tour/tour.component';
import { MembersComponent } from './pages/members/members.component';
import { CarsComponent } from './pages/cars/cars.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
    { path: 'tour/:id', component: AditTourComponent },
    { path: 'tours', component: ToursComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'members', component: MembersComponent, canActivate: [AuthGuard] },
    { path: 'cars', component: CarsComponent, canActivate: [AuthGuard] },
    // { path: 'planner/:id', component: PlannerComponent, canActivate: [AuthGuard] },
    { path: 'things', component: ThingsComponent, canActivate: [AuthGuard] },
    { path: 'register', component: RegisterComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    // { path: '**', component: NotfoundComponent }
];
