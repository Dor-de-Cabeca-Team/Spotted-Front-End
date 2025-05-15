import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Login } from './login';
import { Usuario } from './usuario';
import { environment } from '../../environments/environment';

interface KeycloakJwtPayload extends JwtPayload {
  sub?: string; // ID do usuário (keycloakId)
  realm_access?: { roles: string[] }; // Papéis do usuário
  email?: string;
  preferred_username?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  http = inject(HttpClient);
  API = environment.SERVIDOR + '/api/auth/login';

  constructor() {}

  logar(login: Login): Observable<string> {
    return this.http.post<string>(this.API, login, {
      responseType: 'text' as 'json',
    });
  }

  addToken(token: string) {
    localStorage.setItem('token', token);
  }

  removerToken() {
    localStorage.removeItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  jwtDecode(): Usuario | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = jwtDecode<KeycloakJwtPayload>(token);
      
      // Extrair o papel principal (ignorar papéis padrão do Keycloak)
      const roles = payload.realm_access?.roles || [];
      const primaryRole = roles.find(role => 
        !['offline_access', 'uma_authorization', 'default-roles-spotted'].includes(role)
      ) || '';

      return {
        id: payload.sub || '',
        role: primaryRole,
        email: payload.email || '',
        username: payload.preferred_username || '',
      } as Usuario;
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      return null;
    }
  }

  hasPermission(role: string): boolean {
    const user = this.jwtDecode();
    return user?.role === role;
  }

  getUsuarioLogado(role: string) {
    let user = this.jwtDecode() as Usuario;
  }

  getIdUsuarioLogado(): string | null {
    const user = this.jwtDecode();
    return user?.id || null;
  }
}
