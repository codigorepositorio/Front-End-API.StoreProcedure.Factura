import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { MatPaginatorIntl, MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatPaginatorIntlCro } from 'src/app/models/utilitario/mat-paginator-intl-cro';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

import { NotificationService } from 'src/app/services/notification.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { DialogoBorrarComponent } from 'src/app/components/borrar/dialogo-borrar.component';
import { Categoria } from '../../models/categoria/categoria.model';
import { CategoriaAddComponent } from 'src/app/components/categoria/categoria-add.component';
import { CategoriaEditComponent } from 'src/app/components/categoria/categoria-edit.component';


@Component({
  selector: 'app-categoria-list',
  templateUrl: './categoria-list.component.html',
  styles: [],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlCro }],
})
export class CategoriaListComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  categorias: MatTableDataSource<Categoria>;
  subRef$: Subscription;
  searchKey: string;
  displayedColumns: string[] = ['nombre', 'descripcion', 'condicion','actions'];
  cargando = true;
  constructor(
    private dataService: DataService,
    public dialog: MatDialog,
    public data: MatDialog,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService
  ) { }

  ngOnInit(): void {
    this.ListaCategorias();
  }

  ListaCategorias() {
    const url = environment.BASE_URL + '/categorias';
    this.subRef$ = this.dataService.get<Categoria[]>(url)
      .subscribe(res => {
        this.cargando = false;
        this.categorias = new MatTableDataSource<Categoria>(res.body);
        this.categorias.paginator = this.paginator;
        this.categorias.sort = this.sort;
      },
        (error) => {
          this.errorHandler.handleError(error);          
        })

  }

  borrar(cat: Categoria) {
    const dialogRef = this.dialog.open(DialogoBorrarComponent, {
      width: '390px',
      panelClass: 'confirm-dialog-container',
      disableClose: true,
      position: { top: "10px" },
      data: {
        id: cat.categoriaId,
        titulo: '¿Desea eliminar la Categoria:  "' + cat.categoriaId + ' ' + cat.nombre + '"?',
        dato: 'Si continua no podra recuperar los cambios.'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.id > 0) {
        this.BorrarCategoria(cat);
      }
    });
  }

  BorrarCategoria(per: Categoria) {
    this.cargando = true;
    const url = environment.BASE_URL + '/categorias/' + per.categoriaId
    this.subRef$ = this.dataService.delete<Categoria>(url)
      .subscribe(res => {
        const index: number = this.categorias.data.findIndex(d => d === per);
        this.categorias.data.splice(index, 1);
        this.actualizarTablaDetalle()
      }, err => {
        this.cargando = false;
        if (err.status === 0) {
          this.errorHandler.handleError(err);   
          return;
        }
        this.notificationService.warn(err.error);
      });
  }
  agregar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.width = "50%";
    this.dialog.open(CategoriaAddComponent, dialogConfig).afterClosed()
      .subscribe(res => {
        this.ListaCategorias();
      });
  }

  editar(e) {  
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.width = "50%";
    dialogConfig.data = { categoriaId: e.categoriaId };
    this.dialog.open(CategoriaEditComponent, dialogConfig).afterClosed()
      .subscribe(res => {
        this.ListaCategorias();
      });

  }

  onSearchClear() {
    this.searchKey = "";
    this.applyFilter();
  }

  applyFilter() {
    this.categorias.filter = this.searchKey.trim().toLocaleLowerCase();
  }

  
  actualizarTablaDetalle() {
    this.categorias = new MatTableDataSource<Categoria>(this.categorias.data);
    this.categorias.paginator = this.paginator;
    this.categorias.sort = this.sort;
    this.cargando = false;    
  }

  ngOnDestroy() {
    if (this.subRef$) {
      this.subRef$.unsubscribe();
    }
  }

}
