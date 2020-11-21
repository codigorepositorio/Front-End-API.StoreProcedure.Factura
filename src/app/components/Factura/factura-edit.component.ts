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
import { Factura } from '../../models/factura/factura.model';
import { facturaForAddEdit } from '../../models/factura/facturaForAddEdit.model';
import { FacturaDetalle } from 'src/app/models/detalle/FacturaDetalle.model';



interface Estado {
  estado: string;
}

@Component({
  selector: 'app-factura-edit',
  templateUrl: './factura-edit.component.html',
  styles: [
  ]
})

export class FacturaEditComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  detalleVentas: MatTableDataSource<FacturaDetalle>;

  displayedColumns: string[] = ['codigoItem', 'descripcion', 'precio', 'cantidad',  'subTotal', 'actions'];
  tipoComprobantes: string[] = ['Boleta', 'Factura', 'Otros']
  serieComprobantes: string[] = ['Cash', 'Credito', 'Otros']

  estados: Estado[] = [
    { estado: 'Confirmado' },
    { estado: 'Pendiente' },
    { estado: 'Otros' }
  ];

  cargando = false;
  formEditarVenta: FormGroup;
  private subParams: Subscription;
  subRef$: Subscription;
  facturaId: number;
  ListadoCliente: {};
  DetalleVentas: FacturaDetalle[];
  totalGeneral: number = 0;

  searchKey: string;
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
    this.formEditarVenta = formBuilder.group({
      codigoCliente: new FormControl('', [Validators.required]),
      tipoComprobante: new FormControl([Validators.required]),
      serieComprobante: new FormControl('', [Validators.required]),
      numeroFactura: new FormControl('', [Validators.required]),
      fecha: new FormControl('', [Validators.required]),      
      importeTotal: new FormControl(0, [Validators.required]),
      estado: new FormControl('', [Validators.required])
    });

    this.DetalleVentas = [];
  }

  ngOnInit(): void {
    this.cargando = true;
    this.subParams = this.route.params.subscribe(params => {
      this.facturaId = +params.id;      
      const url = environment.BASE_URL + '/Factura/' + this.facturaId;
      this.subRef$ = this.dataService.get<Factura>(url)
        .subscribe(res => {          
          this.cargando = false;
          const vent: Factura = res.body;
          this.formEditarVenta.patchValue(vent);
          this.DetalleVentas = vent.itemDetalles;
          console.log(this.DetalleVentas);
          this.actualizarTablaDetalle();
        },
          (error) => {
            this.errorHandler.handleError(error);
          });
    });
    this.ListaPersonas();
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.formEditarVenta.controls[controlName].hasError(errorName);
  }

  ListaPersonas() {
    const url = environment.BASE_URL + '/Cliente';
    this.subRef$ = this.dataService.get<Persona[]>(url).subscribe(res => { this.ListadoCliente = res.body; })
  }

  EditarVenta() {
    this.cargando = true;
    const ventaForUpdate: facturaForAddEdit = {
      codigoCliente: this.formEditarVenta.value.codigoCliente,
      usuarioId: 1,
      tipoComprobante: this.formEditarVenta.value.tipoComprobante,
      serieComprobante: this.formEditarVenta.value.serieComprobante,
      numeroFactura: this.formEditarVenta.value.numeroFactura,
      fecha: this.formEditarVenta.value.fecha,
      impuesto: 0,
      subTotal: this.totalGeneral,
      estado: this.formEditarVenta.value.estado,
      itemDetalles: this.DetalleVentas
    };

    const url = environment.BASE_URL + '/Factura'
    this.subRef$ = this.dataService.post<facturaForAddEdit>(url, ventaForUpdate)
      .subscribe(res => {
        this.cargando = false;
        this.notificationService.success(':: Submitted successfully');
        this.router.navigate(['/factura']);
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
      facturaId: this.facturaId, detalleVentaId: 0
    };
    this.dialog.open(DetalleVentaAddComponent, dialogConfig).afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      console.log("Datos desde el hijo");
      console.log(result);
      this.DetalleVentas.push(result)
      this.actualizarTablaDetalle();
    })
  }

  editar(e) {
    console.log("eeeeeeditar", e);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.width = "50%";
    dialogConfig.data = {
      codigoFactura: e.vencodigoFacturataId, codigoDetalle: e.codigoDetalle,
      codigoItem: e.codigoItem, cantidad: e.cantidad,      
    };

    this.dialog.open(DetalleVentaEditComponent, dialogConfig).afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      console.log("Datos desde el hijo");
      console.log(result);
      let detalleVenta = result as FacturaDetalle;
      this.validaProducto(detalleVenta);
      this.actualizarTablaDetalle()
    })
  }
  validaProducto(detalleVenta: FacturaDetalle) {
    var index = this.DetalleVentas.findIndex((e) => e.codigoDetalle == detalleVenta.codigoDetalle);
    if (index != -1) {
      this.DetalleVentas[index] = detalleVenta;
    }
  }
  ventas() {
    this.router.navigate(['/factura']);
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


