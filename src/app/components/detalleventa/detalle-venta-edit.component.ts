import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs'
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { DataService } from 'src/app/services/data.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { articuloAddEdit } from 'src/app/models/detalle/articuloAddEdit.model';


@Component({
  selector: 'app-detalle-venta-edit',
  templateUrl: './detalle-venta-edit.component.html',
  styles: [
  ]
})

export class DetalleVentaEditComponent implements OnInit {
  public articulo: articuloAddEdit;
  public articuloform: FormGroup;
  ListaArticulos: articuloAddEdit[];
  public codigoItem: number;
  public gtotal: number = this.data.total;
  public gcantidad: number = this.data.cantidad;
  

  constructor
    (
      public dialogRef: MatDialogRef<DetalleVentaEditComponent>,
      @Inject(MAT_DIALOG_DATA) public data,
      private dataService: DataService,
      private errorHandler: ErrorHandlerService,
      private formBuilder: FormBuilder
    ) {
    this.articuloform = formBuilder.group({
      codigoFactura: [0],
      codigoDetalle: [0],
      codigoItem: [Validators.required],
      descripcion: [Validators.required],
      precio: [0],      
      subTotal: [0]
    });
  }

  ngOnInit(): void {
    this.getVentaArticuloById();
    this.getArticulos();    
  }

  private getVentaArticuloById = () => {
    this.codigoItem = this.data.codigoItem
    const url = environment.BASE_URL + '/Item/' + this.codigoItem;
    this.dataService.get<articuloAddEdit>(url)
      .subscribe(res => {
        this.articulo = res.body;
        this.articuloform.patchValue(this.articulo);
      }, (error) => {
        this.errorHandler.handleError(error);
        this.dialogRef.close();
      });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.articuloform.controls[controlName].hasError(errorName);
  }

  getArticulos() {
    const url = environment.BASE_URL + '/Item';
    this.dataService.get<articuloAddEdit[]>(url).subscribe(res => {
      this.ListaArticulos = res.body;
    })

  }

  EditarDetalleVenta() {
    const detalleArticulo: articuloAddEdit = {
      codigoFactura: this.data.codigoFactura,
      codigoDetalle: this.data.codigoDetalle,
      codigoItem: this.articuloform.value.codigoItem,
      descripcion: this.articuloform.value.descripcion,
      precio: this.articuloform.value.precio,
      cantidad: this.gcantidad,      
      subTotal: this.gtotal

    }    
    this.dialogRef.close(detalleArticulo);
  }

  updatePrice(event) {
    const resultado = this.ListaArticulos.find(articulo => articulo.codigoItem === event);
    this.codigoItem = this.data.codigoItem
    const url = environment.BASE_URL + '/Item/' + resultado.codigoItem;
    this.dataService.get<articuloAddEdit>(url)
      .subscribe(res => {
        this.articulo = res.body;
        
        this.articuloform.patchValue(this.articulo);
        this.updateTotal();
      }, (error) => {
        this.errorHandler.handleError(error);
      });      
  }

  updateTotal() {
    this.gtotal = parseFloat((this.gcantidad * this.articuloform.value.precio).toFixed(2));

  }

  cancelar() {
    this.onClose()
  }

  onClose() {
    this.dialogRef.close();
    this.articuloform.reset();
  }
}
