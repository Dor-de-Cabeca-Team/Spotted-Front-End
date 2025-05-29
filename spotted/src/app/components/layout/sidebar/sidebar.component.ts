import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { ModalUserComponent } from '../modal-user/modal-user.component';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { LoginService } from '../../../auth/login.service';

// Interface para o payload do token do Keycloak
interface KeycloakJwtPayload extends JwtPayload {
  realm_access?: { roles: string[] }; // Papéis do usuário
}

interface User {
  username: string;
  picture: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MdbDropdownModule],
  providers: [MdbModalService],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  private loginService = inject(LoginService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private modalService = inject(MdbModalService);
  menuItems = [
    {
      route: '/principal',
      icon: this.sanitizer.bypassSecurityTrustHtml(`
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-house-door-fill" viewBox="0 0 16 16">
          <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5" />
        </svg>
      `),
      name: 'Inicio',
    },
  ];

  status: boolean = false;

  clickEvent() {
    this.status = !this.status;
  }

  isActive(path: string): boolean {
    const currentUrl = this.router.url;
    return currentUrl.toLowerCase() === path.toLowerCase();
  }

  user: User = {
    username: 'Config',
    picture: '../../../../assets/animals/Recurso3@2x.png',
  };

  modalRef: MdbModalRef<ModalUserComponent> | null = null;
  openModal() {
    this.modalRef = this.modalService.open(ModalUserComponent, {
      modalClass: 'modal-dialog-centered',
    });
  }

  getRole(): boolean {
    const user = this.loginService.jwtDecode();
    return !!user?.roles && user.roles.includes('ADMIN');
  }

  sair() {
    this.loginService.removerToken();
    localStorage.removeItem('loggedUser');
    this.router.navigate(['/login']);
  }
}