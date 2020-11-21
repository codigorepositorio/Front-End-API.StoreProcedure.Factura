import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { MatPaginatorIntl, MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';

import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { DialogoBorrarComponent } from 'src/app/components/borrar/dialogo-borrar.component';
import { MatPaginatorIntlCro } from 'src/app/models/utilitario/mat-paginator-intl-cro';
import { Item } from 'src/app/models/Item/item.model';
import { ItemAddComponent } from 'src/app/components/articulos/item-add.component';
import { ItemEditComponent } from './item-edit.component';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styles: [],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlCro }],
})
export class ItemListComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  items: MatTableDataSource<Item>;
  subRef$: Subscription;
  searchKey: string;
  displayedColumns: string[] = ['codigoItem', 'descripcion', 'precio', 'actions'];
  cargando = true;
  
  constructor(
    private dataService: DataService,
    public dialog: MatDialog,
    public data: MatDialog,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService

  ) { }

  ngOnInit(): void {
    this.ListaArticulos();
  }
  ngOnDestroy() {
    if (this.subRef$) {
      this.subRef$.unsubscribe();
    }
  }

  ListaArticulos() {
    const url = environment.BASE_URL + '/Item';
    this.subRef$ = this.dataService.get<Item[]>(url)
      .subscribe(res => {
        this.cargando = false;
        this.items = new MatTableDataSource<Item>(res.body);
        this.items.paginator = this.paginator;
        this.items.sort = this.sort;
      },
        (error) => {
          this.errorHandler.handleError(error);         
        })
  }

  borrar(art: Item) {
    const dialogRef = this.dialog.open(DialogoBorrarComponent, {
      width: '390px',
      panelClass: 'confirm-dialog-container',
      disableClose: true,
      position: { top: "10px" },
      data: {
        id: art.codigoItem,
        titulo: '¿Desea eliminar el Articulo:  "' + art.codigoItem + ' ' + art.descripcion + '"?',
        dato: 'Si continua no podra recuperar los cambios.'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.id > 0) {
        this.BorrarArticulo(art);
      }
    });
  }

  BorrarArticulo(item: Item) {
    this.cargando = true;
    const url = environment.BASE_URL + '/Item/'+ item.codigoItem
    this.subRef$ = this.dataService.delete<Item>(url)
      .subscribe(res => {
        
        const index: number = this.items.data.findIndex(d => d === item);
        this.items.data.splice(index, 1);
        this.items = new MatTableDataSource<Item>(this.items.data);
        this.items.paginator = this.paginator;
        this.items.sort = this.sort;
        this.cargando = false;
      },
      err => {
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
    this.dialog.open(ItemAddComponent, dialogConfig).afterClosed()
      .subscribe(res => { this.ListaArticulos() });
  }

  editar(e) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.width = "50%";
    dialogConfig.data = { codigoItem: e.codigoItem };
    this.dialog.open(ItemEditComponent, dialogConfig).afterClosed()
      .subscribe(res => { this.ListaArticulos() });
  }

  onSearchClear() {
    this.searchKey = "";
    this.applyFilter();
  }

  applyFilter() {
    this.items.filter = this.searchKey.trim().toLocaleLowerCase();
  }



}
