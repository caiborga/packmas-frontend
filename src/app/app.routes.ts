import { Routes } from '@angular/router';

//Componentes
// import { HomeComponent } from './pages/home/home.component';
// import { ParticipantsComponent } from './pages/participants/participants.component';
// import { PlannerComponent } from './pages/planner/planner.component';
// import { ThingsComponent } from './pages/things/things.component';
import { RegisterComponent } from './auth/register/register.component';
// import { NotfoundComponent } from './pages/notfound/notfound.component';
import { AuthGuard } from './core/guards/auth-guard.guard';

export const routes: Routes = [
    // { path: 'home/:id', component: HomeComponent },
    // { path: 'home', component: HomeComponent },
    // { path: 'participants', component: ParticipantsComponent, canActivate: [AuthGuard] },
    // { path: 'planner', component: PlannerComponent, canActivate: [AuthGuard] },
    // { path: 'planner/:id', component: PlannerComponent, canActivate: [AuthGuard] },
    // { path: 'things', component: ThingsComponent, canActivate: [AuthGuard] },
    { path: 'register', component: RegisterComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    // { path: '**', component: NotfoundComponent }
];
