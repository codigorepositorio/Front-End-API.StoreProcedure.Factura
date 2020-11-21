import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { NotificationService } from 'src/app/services/notification.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { CategoriaForUpdate } from '../../models/categoria/categoriaForUpdate.model';
import { Categoria } from '../../models/categoria/categoria.model';

@Component({
  selector: 'app-categoria-edit',
  templateUrl: './categoria-edit.component.html'

})
export class CategoriaEditComponent implements OnInit, OnDestroy {
  mensaje: any;
  cargando = false;
  formEditarCategoria: FormGroup;
  reportedError: boolean;
  subRef$: Subscription;
  categoriaId: Number;
  constructor(
    public dialogRef: MatDialogRef<CategoriaEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService
  ) {
    this.formEditarCategoria = formBuilder.group({
      nombre: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]),
      descripcion: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]),
      condicion: new FormControl(true)
    });

  }
  ngOnInit(): void {
    this.cargando = true;
    this.categoriaId = this.data.categoriaId
    const url = environment.BASE_URL + '/categorias/' + this.categoriaId;
    this.subRef$ = this.dataService.get<Categoria>(url)
      .subscribe(res => {
        this.cargando = false;
        const art: Categoria = res.body;
        this.formEditarCategoria.patchValue(art);
      },
        (error) => {
          this.dialogRef.close();
          this.errorHandler.handleError(error);
        });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.formEditarCategoria.controls[controlName].hasError(errorName);
  }

  Editar() {
    const categoriaForUpdate: CategoriaForUpdate = {
      nombre: this.formEditarCategoria.value.nombre,
      descripcion: this.formEditarCategoria.value.descripcion,
      condicion: this.formEditarCategoria.value.condicion
    };
    this.cargando = true;
    const url = environment.BASE_URL + '/categorias/' + this.categoriaId;
    this.subRef$ = this.dataService.put<CategoriaForUpdate>(url, categoriaForUpdate)
      .subscribe(res => {
        this.cargando = false;
        this.onClose();
        this.notificationService.warn(':: Submitted successfully');
        console.log(res);
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

    this.formEditarCategoria.reset();
    this.dialogRef.close();

    // this.service.form.reset();
    // this.formEditarCategoria.initializeFormGroup();
    // this.dialogRef.close();
  }

  ngOnDestroy() {
    if (this.subRef$) { this.subRef$.unsubscribe(); }
  }

}
