import { Component, OnInit, OnDestroy, ViewChild, NgModule } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs'
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { DataService } from 'src/app/services/data.service';
import { Persona } from 'src/app/models/Persona/persona.model';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NotificationService } from 'src/app/services/notification.service';
import { DetalleVentaEditComponent } from '../detalleventa/detalle-venta-edit.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DetalleVentaAddComponent } from 'src/app/components/detalleventa/detalle-venta-add.component';
import { FacturaDetalle } from 'src/app/models/detalle/FacturaDetalle.model';
import { facturaForAddEdit } from 'src/app/models/factura/facturaForAddEdit.model';


@Component({
  selector: 'app-factura-add',
  templateUrl: './factura-add.component.html'
})

export class FacturaAddComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  detalleVentas: MatTableDataSource<FacturaDetalle>;
  displayedColumns: string[] = ['codigoItem', 'descripcion', 'precio', 'cantidad',  'subTotal', 'actions'];
  tipoComprobantes: string[] = ['Boleta', 'Factura', 'Otros']
  serieComprobantes: string[] = ['Cash', 'Credito', 'Otros']
  estados: string[] = ['Confirmado', 'Pendiente', 'Otros'];

  cargando = false;
  formAddVenta: FormGroup;
  private subParams: Subscription;
  subRef$: Subscription;
  ListadoCliente: {};
  DetalleVentas: FacturaDetalle[];
  public totalGeneral: number;
  searchKey: string;

  public codigoItem: number = 0;
  constructor
    (
      private formBuilder: FormBuilder,
      private router: Router,
      private route: ActivatedRoute,
      private dataService: DataService,
      private errorHandler: ErrorHandlerService,
      private notificationService: NotificationService,
      public dialog: MatDialog,
      public data: MatDialog,

  ) {
    this.formAddVenta = formBuilder.group({
      codigoCliente: ['', Validators.required],
      tipoComprobante: ['', Validators.required],
      serieComprobante: ['', Validators.required],
      numeroFactura: [Math.floor(100000 + Math.random() * 900000).toString(), [Validators.required]],
      fecha: [new Date(), [Validators.required]],
      impuesto: [0],
      importeTotal: [0],
      estado: new FormControl('', [Validators.required])
    });

    this.DetalleVentas = [];
  }

  ngOnInit(): void {
    this.ListaPersonas();
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.formAddVenta.controls[controlName].hasError(errorName);
  }

  ListaPersonas() {
    const url = environment.BASE_URL + '/Cliente';
    this.subRef$ = this.dataService.get<Persona[]>(url).subscribe(res => { this.ListadoCliente = res.body; })
  }

  GuardarVenta() {
    this.cargando = true;
    const ventaForUpdate: facturaForAddEdit = {
      codigoCliente: this.formAddVenta.value.codigoCliente,
      usuarioId: 1,
      tipoComprobante: this.formAddVenta.value.tipoComprobante,
      serieComprobante: this.formAddVenta.value.serieComprobante,
      numeroFactura: this.formAddVenta.value.numeroFactura,
      fecha: this.formAddVenta.value.fecha,
      impuesto: 0,
      subTotal: this.totalGeneral,
      estado: this.formAddVenta.value.estado,
      itemDetalles: this.DetalleVentas
    };

    const url = environment.BASE_URL + '/Factura'
    this.subRef$ = this.dataService.post<facturaForAddEdit>(url, ventaForUpdate)
      .subscribe(res => {
        this.cargando = false;
        this.notificationService.success(':: Submitted successfully');
        this.router.navigate(['/Factura']);
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
    dialogConfig.data = {
      ventaId: 0, detalleVentaId: 0
    };
    this.dialog.open(DetalleVentaAddComponent, dialogConfig).afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.DetalleVentas.push(result)
      this.actualizarTablaDetalle();
    })
  }

  editar(e) {
    this.codigoItem = e.codigoItem
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.width = "50%";
    dialogConfig.data = {
      ventaId: e.ventaId, detalleVentaId: e.detalleVentaId,
      codigoItem: e.codigoItem, cantidad: e.cantidad,      
    };

    this.dialog.open(DetalleVentaEditComponent, dialogConfig).afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      let detalleVenta = result as FacturaDetalle;
      this.validaProducto(detalleVenta);
      this.actualizarTablaDetalle()
    })
  }

  ventas() {
    this.router.navigate(['/factura']);
  }
  validaProducto(detalleVenta: FacturaDetalle) {
    var index = this.DetalleVentas.findIndex(e => e.codigoItem == this.codigoItem);
    if (index != -1) {
      this.DetalleVentas[index] = detalleVenta;
    }
  }

  updateGrandTotal() {
    let _totalGeneral: number;
    _totalGeneral = this.DetalleVentas.reduce((prev, curr) => {
      return prev + curr.subTotal;
    }, 0)
    this.totalGeneral = parseFloat(_totalGeneral.toFixed(2));
  }

  onSearchClear() {
    this.searchKey = "";
    this.applyFilter();
  }

  applyFilter() {
    this.detalleVentas.filter = this.searchKey.trim().toLocaleLowerCase();
  }

  Borrar(e) {
    const index: number = this.DetalleVentas.findIndex(d => d === e);
    this.DetalleVentas.splice(index, 1);
    this.actualizarTablaDetalle();
  }

  actualizarTablaDetalle() {
    this.detalleVentas = new MatTableDataSource<FacturaDetalle>(this.DetalleVentas);
    this.detalleVentas.paginator = this.paginator;
    this.detalleVentas.sort = this.sort;
    this.cargando = false;
    this.updateGrandTotal();
  }

  ngOnDestroy() {
    if (this.subParams) { this.subParams.unsubscribe(); }
    if (this.subRef$) { this.subRef$.unsubscribe(); }
  }

}


