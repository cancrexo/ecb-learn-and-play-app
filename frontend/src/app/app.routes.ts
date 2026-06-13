import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { Splash1Component } from './features/splash/splash1/splash1';
import { Splash2Component } from './features/splash/splash2/splash2';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { VerifyEmailComponent } from './features/auth/verify-email/verify-email';
import { InstructionsComponent } from './features/instructions/instructions';
import { ClustersComponent } from './features/clusters/clusters';
import { QuizComponent } from './features/quiz/quiz';
import { SummaryComponent } from './features/summary/summary';
import { GameOverComponent } from './features/game-over/game-over';

export const routes: Routes = [
    { path: '', component: Splash1Component },
    { path: 'splash-2', component: Splash2Component },
    { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
    { path: 'verify-email', component: VerifyEmailComponent, canActivate: [guestGuard] },
    { path: 'instructions', component: InstructionsComponent, canActivate: [authGuard] },
    { path: 'clusters', component: ClustersComponent, canActivate: [authGuard] },
    { path: 'quiz/:clusterId', component: QuizComponent, canActivate: [authGuard] },
    { path: 'summary/:clusterId', component: SummaryComponent, canActivate: [authGuard] },
    { path: 'game-over', component: GameOverComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' },
];
