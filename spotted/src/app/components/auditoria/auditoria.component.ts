import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuditoriaService } from '../../services/auditoria/auditoria.service';
import { Auditoria, AcaoTipo, BaseAuditoriaContent } from '../../models/auditoria/auditoria.model';
import { finalize } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { SidebarComponent } from "../layout/sidebar/sidebar.component";

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    SidebarComponent,
  ]
})
export class AuditoriaComponent implements OnInit {
  dataSource = new MatTableDataSource<Auditoria>();
  displayedColumns: string[] = ['email', 'data', 'acao', 'conteudo'];
  isLoading = false;
  isExporting = false;
  actionTypes = Object.values(AcaoTipo);

  filterForm = new FormGroup({
    email: new FormControl(''),
    dateStart: new FormControl<Date | null>(null),
    dateEnd: new FormControl<Date | null>(null),
    action: new FormControl('')
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private auditoriaService: AuditoriaService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAuditData();
    this.setupFilters();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private parseConteudo(conteudo: string): BaseAuditoriaContent {
    const lines = conteudo.split('\n');
    const result: any = {
      tipo: lines[0]
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('Post ID:')) {
        result.postId = line.replace('Post ID:', '').trim();
      } else if (line.startsWith('Comentário ID:')) {
        result.comentarioId = line.replace('Comentário ID:', '').trim();
      } else if (line.startsWith('Usuario ID:')) {
        result.usuarioId = line.replace('Usuario ID:', '').trim();
      } else if (line.startsWith('Conteúdo:')) {
        result.conteudo = line.replace('Conteúdo:', '').trim().replace(/^"|"$/g, '');
      }
    }

    return result;
  }

  formatConteudo(conteudo: string): string {
    try {
      const parsed = this.parseConteudo(conteudo);
      switch (parsed.tipo) {
        case 'Post criado':
          return `${parsed.conteudo}`;
        case 'Comentário criado':
          return `${parsed.conteudo}`;
        case 'Like criado':
          return parsed.comentarioId ?
            'Like em comentário' :
            'Like em post';
        case 'Like deletado':
          return parsed.comentarioId ?
            'Like removido do comentário' :
            'Like removido do post';
        case 'Denúncia criada':
          return parsed.comentarioId ?
            'Denúncia em comentário' :
            'Denúncia em post';
        case 'Denúncia deletada':
          return parsed.comentarioId ?
            'Denúncia removida do comentário' :
            'Denúncia removida do post';
        case 'Usuário criado':
          return 'Novo usuário registrado';
        case 'Usuário logado':
          return 'Login realizado';
        default:
          return conteudo;
      }
    } catch {
      return conteudo;
    }
  }

  getTooltipContent(conteudo: string): string {
    try {
      const parsed = this.parseConteudo(conteudo);
      let tooltip = `${parsed.tipo}\n`;

      if (parsed.postId) {
        tooltip += `Post ID: ${parsed.postId}\n`;
      }
      if (parsed.comentarioId) {
        tooltip += `Comentário ID: ${parsed.comentarioId}\n`;
      }
      if (parsed.usuarioId) {
        tooltip += `Usuário ID: ${parsed.usuarioId}\n`;
      }
      if (parsed.conteudo) {
        tooltip += `Conteúdo: "${parsed.conteudo}"`;
      }

      return tooltip;
    } catch {
      return conteudo;
    }
  }

  private loadAuditData(): void {
    this.isLoading = true;
    this.auditoriaService.getAllAuditorias()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
        },
        error: (error) => {
          console.error('Erro ao carregar dados de auditoria:', error);
          this.snackBar.open('Erro ao carregar dados', 'Fechar', {
            duration: 3000
          });
        }
      });
  }

  private setupFilters(): void {
    this.dataSource.filterPredicate = (data: Auditoria, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);

      const emailMatch = !searchTerms.email ||
        data.email.toLowerCase().includes(searchTerms.email.toLowerCase());

      const dateMatch = this.checkDateMatch(data.data, searchTerms.dateStart, searchTerms.dateEnd);

      const actionMatch = !searchTerms.action ||
        data.acao === searchTerms.action;

      return emailMatch && dateMatch && actionMatch;
    };

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilter();
    });
  }

  private checkDateMatch(dataDate: string, startDate: Date | null, endDate: Date | null): boolean {
    if (!startDate && !endDate) return true;

    const date = new Date(dataDate);

    if (startDate && endDate) {
      return date >= startDate && date <= endDate;
    } else if (startDate) {
      return date >= startDate;
    } else if (endDate) {
      return date <= endDate;
    }

    return true;
  }

  applyFilter(): void {
    const filterValue = {
      email: this.filterForm.get('email')?.value || '',
      dateStart: this.filterForm.get('dateStart')?.value,
      dateEnd: this.filterForm.get('dateEnd')?.value,
      action: this.filterForm.get('action')?.value || ''
    };

    this.dataSource.filter = JSON.stringify(filterValue);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.dataSource.filter = '';
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  exportToExcel(): void {
    this.isExporting = true;
    try {
      const headers = ['Email', 'Data', 'Ação', 'Tipo', 'Conteúdo', 'Post ID', 'Comentário ID', 'Usuário ID'];

      const data = this.dataSource.filteredData.map(item => {
        const parsed = this.parseConteudo(item.conteudo);
        return [
          item.email,
          new Date(item.data).toLocaleString(),
          item.acao,
          parsed.tipo,
          parsed.conteudo || '',
          parsed.postId || '',
          parsed.comentarioId || '',
          parsed.usuarioId || ''
        ];
      });

      const excelData = [headers, ...data];
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();

      const wsColumns = [
        { wch: 30 }, // Email
        { wch: 20 }, // Data
        { wch: 15 }, // Ação
        { wch: 20 }, // Tipo
        { wch: 50 }, // Conteúdo
        { wch: 40 }, // Post ID
        { wch: 40 }, // Comentário ID
        { wch: 40 }  // Usuário ID
      ];
      ws['!cols'] = wsColumns;

      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:H1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellRef]) continue;
        ws[cellRef].s = { font: { bold: true } };
      }

      XLSX.utils.book_append_sheet(wb, ws, 'Auditoria');
      const fileName = `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      this.snackBar.open('Arquivo exportado com sucesso!', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      this.snackBar.open('Erro ao exportar arquivo', 'Fechar', {
        duration: 3000
      });
    } finally {
      this.isExporting = false;
    }
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'email':
          return compare(a.email, b.email, isAsc);
        case 'data':
          return compare(new Date(a.data), new Date(b.data), isAsc);
        case 'acao':
          return compare(a.acao, b.acao, isAsc);
        case 'conteudo':
          return compare(this.formatConteudo(a.conteudo), this.formatConteudo(b.conteudo), isAsc);
        default:
          return 0;
      }
    });
  }
}

function compare(a: any, b: any, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
