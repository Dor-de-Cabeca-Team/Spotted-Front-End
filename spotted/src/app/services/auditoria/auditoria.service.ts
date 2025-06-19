import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auditoria } from '../../models/auditoria/auditoria.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private readonly apiUrl = `${environment.SERVIDOR}/api/auditoria`;

  constructor(private readonly http: HttpClient) {}

  getAllAuditorias(): Observable<Auditoria[]> {
    return this.http.get<Auditoria[]>(`${this.apiUrl}/`);
  }
}
