import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { MatPaginatorIntl, MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatPaginatorIntlCro } from 'src/app/models/utilitario/mat-paginator-intl-cro';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { DialogoBorrarComponent } from 'src/app/components/borrar/dialogo-borrar.component';
import { Router } from '@angular/router';
import { Factura } from 'src/app/models/factura/factura.model';


@Component({
  selector: 'app-factura-list',
  templateUrl:'./factura-list.component.html',
  styles: [],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlCro }],
})
export class FacturaListComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ventas: MatTableDataSource<Factura>;
  subRef$: Subscription;
  searchKey: string;
  displayedColumns: string[] = ['codigoFactura','tipo', 'numeroFactura',  'fecha',  'importeTotal', 'actions'];
  cargando = true;
  constructor(
    private dataService: DataService,
    public dialog: MatDialog,
    public data: MatDialog,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService,
    private router: Router,

  ) { }

  ngOnInit(): void {
    this.ListaVentas();
  }



  ListaVentas() {
    const url = environment.BASE_URL + '/Factura';
    this.subRef$ = this.dataService.get<Factura[]>(url)
      .subscribe(res => {
        this.cargando = false;
        this.ventas = new MatTableDataSource<Factura>(res.body);        
        this.ventas.paginator = this.paginator;
        this.ventas.sort = this.sort;
      },
        (error) => { this.errorHandler.handleError(error) })
  }

  borrar(fac: Factura) {
    const dialogRef = this.dialog.open(DialogoBorrarComponent, {
      width: '390px',
      panelClass: 'confirm-dialog-container',
      disableClose: true,
      position: { top: "10px" },
      data: {
        id: fac.codigoFactura,
        titulo: '¿Desea eliminar la Venta:  "' + fac.codigoFactura + ' ' + fac.numComprobante + '"?',
        dato: 'Si continua no podra recuperar los cambios.'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.id > 0) {
        this.BorrarArticulo(fac);
      }
    });
  }

  BorrarArticulo(fac: Factura) {
    this.cargando = true;
    const url = environment.BASE_URL + '/factura/' + fac.codigoFactura
    this.subRef$ = this.dataService.delete<Factura>(url)
      .subscribe(res => {
        const index: number = this.ventas.data.findIndex(d => d === fac);
        this.ventas.data.splice(index, 1);
        this.ventas = new MatTableDataSource<Factura>(this.ventas.data);
        this.ventas.paginator = this.paginator;
        this.ventas.sort = this.sort;
        this.cargando = false;
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
    this.router.navigate(['/factura-add']);
  }

  editar(e) {    
    this.router.navigate(['/factura-edit', e.codigoFactura]);
  }

  onSearchClear() {
    this.searchKey = "";
    this.applyFilter();
  }

  applyFilter() {
    this.ventas.filter = this.searchKey.trim().toLocaleLowerCase();
  }
  
  ngOnDestroy() {
    if (this.subRef$) {
      this.subRef$.unsubscribe();
    }
  }

}
