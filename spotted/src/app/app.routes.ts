import { Routes } from '@angular/router';
import { PrincipalComponent } from './components/layout/principal/principal.component';
import { LoginRegisterPaginaComponent } from './components/layout/login-register-pagina/login-register-pagina.component';
import { MainComponent } from './components/layout/main/main.component';
import { AnimatedComponent } from './components/layout/animated/animated.component';
import { loginGuard } from './auth/login.guard';
import { ResetPasswordComponent } from './components/layout/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './components/layout/forgot-password/forgot-password.component';
import { EmailValidadorComponent } from './components/layout/email-validador/email-validador.component';
import {AuditoriaComponent} from "./components/auditoria/auditoria.component";



export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: "login", component: LoginRegisterPaginaComponent },
  { path: "principal", component: PrincipalComponent, canActivate: [loginGuard] },
  { path: "main", component: MainComponent},
  { path: "animated", component: AnimatedComponent},
  { path: "reset-password", component: ResetPasswordComponent},
  { path: "forgot-password", component: ForgotPasswordComponent},
  { path: "email-validador", component: EmailValidadorComponent},
  { path: 'auditoria', component: AuditoriaComponent, canActivate: [loginGuard], data: { roles: ['ADMIN'] }
  },
];

