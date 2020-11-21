import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { NotificationService } from 'src/app/services/notification.service';

import { ErrorHandlerService } from '../../services/error-handler.service';
import { Categoria } from 'src/app/models/categoria/categoria.model';
import { ItemForCreation } from 'src/app/models/Item/ItemForCreation.model';

@Component({
  selector: 'app-item-add',
  templateUrl: './item-add.component.html',
  styles: [
  ]
})
export class ItemAddComponent implements OnInit, OnDestroy {
  mensaje: any;
  cargando = false;
  formAgregarArticulo: FormGroup;
  maxDate: Date;
  reportedError: boolean;
  subRef$: Subscription;
  listadoCategoria: {};

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private dataService: DataService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<ItemAddComponent>,
    private errorHandler: ErrorHandlerService
  ) {
    this.formAgregarArticulo = formBuilder.group({      
      codigo: 0,
      descripcion: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]),      
      precioU: new FormControl(0.00, [Validators.required, Validators.min(0.5), Validators.max(500)]),      
      condicion: new FormControl(true)
    });

  }
  ngOnInit(): void {
    this.ListaCategorias();
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.formAgregarArticulo.controls[controlName].hasError(errorName);
  }

  AgregarArticulo() {
    this.cargando = true;
    const articuloForCreation: ItemForCreation = {      
    codigoItem: 0,
     descripcion: this.formAgregarArticulo.value.descripcion,
     precioU: this.formAgregarArticulo.value.precioU,      
     condicion: this.formAgregarArticulo.value.condicion,
    };

    const url = environment.BASE_URL + '/Item';
    this.subRef$ = this.dataService.post<ItemForCreation>(url, articuloForCreation)
      .subscribe(res => {
        this.cargando = false;
        this.onClose()
        this.notificationService.success(':: Submitted successfully');
      },
        err => {
          this.cargando = false;
          if (err.status === 0) {
            this.errorHandler.handleError(err);
            this.dialogRef.close()
            return;
          }          
          this.notificationService.warn(err.error);
        });
  }

  ListaCategorias() {
    const url = environment.BASE_URL + '/Categorias';
    this.subRef$ = this.dataService.get<Categoria[]>(url)
      .subscribe(res => {
        this.listadoCategoria = res.body;
      },
        err => { console.log('Error al recuperar categorias.') });

  }

  public checkChanged = (event) => {
    this.reportedError = event.checked;
  }


  cancelar() {
    this.onClose()
  }

  onClose() {
    this.dialogRef.close();
    this.formAgregarArticulo.reset();
  }

  ngOnDestroy() {
    if (this.subRef$) { this.subRef$.unsubscribe(); }
  }

}
