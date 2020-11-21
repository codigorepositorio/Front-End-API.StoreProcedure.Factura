import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { NotificationService } from 'src/app/services/notification.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { CategoriaForCreation } from '../../models/categoria/categoriaForCreation.model';

@Component({
  selector: 'app-categoria-add',
  templateUrl: './categoria-add.component.html',
  styles: [
  ]
})
export class CategoriaAddComponent implements OnInit, OnDestroy {
  mensaje: any;
  cargando = false;
  formAgregarCategoria: FormGroup;
  reportedError: boolean;
  subRef$: Subscription;
  subParams: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private dataService: DataService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<CategoriaAddComponent>,
    private errorHandler: ErrorHandlerService

  ) {
    this.formAgregarCategoria = formBuilder.group({
      nombre: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]),
      descripcion: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]),
      condicion: new FormControl(true)
    });

  }
  ngOnInit(): void {

  }

  public hasError = (controlName: string, errorName: string) => {
    return this.formAgregarCategoria.controls[controlName].hasError(errorName);
  }

  Agregar() {
    this.cargando = true;
    const categoriaForCreation: CategoriaForCreation = {
      nombre: this.formAgregarCategoria.value.nombre,
      descripcion: this.formAgregarCategoria.value.descripcion,
      condicion: this.formAgregarCategoria.value.condicion
    };

    const url = environment.BASE_URL + '/categorias';
    this.subRef$ = this.dataService.post<CategoriaForCreation>(url, categoriaForCreation)
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
  public checkChanged = (event) => {
    this.reportedError = event.checked;
  }

  cancelar() {
    this.onClose()
  }

  onClose() {
    this.dialogRef.close();
    this.formAgregarCategoria.reset();
  }

  ngOnDestroy() {
    if (this.subParams) { this.subParams.unsubscribe(); }
    if (this.subRef$) { this.subRef$.unsubscribe(); }
  }

}
