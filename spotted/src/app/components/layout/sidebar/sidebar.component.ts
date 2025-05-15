import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { ModalUserComponent } from '../modal-user/modal-user.component';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { jwtDecode, JwtPayload } from 'jwt-decode';

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
    //   {
    //     route: '/trends',
    //     icon: this.sanitizer.bypassSecurityTrustHtml(`
    //       <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-hash" viewBox="0 0 16 16">
    //         <path d="M8.39 12.648a1 1 0 0 0-.015.18c0 .305.21.508.5.508.266 0 .492-.172.555-.477l.554-2.703h1.204c.421 0 .617-.234.617-.547 0-.312-.188-.53-.617-.53h-.985l.516-2.524h1.265c.43 0 .618-.227.618-.547 0-.313-.188-.524-.618-.524h-1.046l.476-2.304a1 1 0 0 0 .016-.164.51.51 0 0 0-.516-.516.54.54 0 0 0-.539.43l-.523 2.554H7.617l.477-2.304c.008-.04.015-.118.015-.164a.51.51 0 0 0-.523-.516.54.54 0 0 0-.531.43L6.53 5.484H5.414c-.43 0-.617.22-.617.532s.187.539.617.539h.906l-.515 2.523H4.609c-.421 0-.609.219-.609.531s.188.547.61.547h.976l-.516 2.492c-.008.04-.015.125-.015.18 0 .305.21.508.5.508.265 0 .492-.172.554-.477l.555-2.703h2.242zm-1-6.109h2.266l-.515 2.563H6.859l.532-2.563z" />
    //       </svg>
    //     `),
    //     name: 'Trends'
    //   }
  ];

  status: boolean = false;


  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private modalService: MdbModalService
  ) {}

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
  getRole(): string | undefined {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = jwtDecode<JwtPayload & { id?: string; role?: string }>(token);
      return payload.role;
    }
    return undefined;
  }

  sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedUser');
    this.router.navigate(['/login']);
  }
}
