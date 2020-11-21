import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { NotificationService } from 'src/app/services/notification.service';
import { PersonaForCreation } from '../../models/Persona/personaForCreation.model';
import { ErrorHandlerService } from '../../services/error-handler.service';

interface TipoPersona {
  tipoPersona: string;
  descripcion: string;
}

interface TipoDocumento {
  tipoDocumento: string;
  descripcion: string;
}

@Component({
  selector: 'app-persona-add',
  templateUrl: './persona-add.component.html',
  styles: [
  ]
})
export class PersonaAddComponent implements OnInit, OnDestroy {

  tipoPersonas: TipoPersona[] = [
    { tipoPersona: 'Cliente', descripcion: 'Cliente' },
    { tipoPersona: 'Proveedor', descripcion: 'Proveedor' },
    { tipoPersona: 'Otros', descripcion: 'Otros' },
  ];

  tipoDocumentos: TipoDocumento[] = [
    { tipoDocumento: 'Dni', descripcion: 'Dni' },
    { tipoDocumento: 'Ruc', descripcion: 'Ruc' },
    { tipoDocumento: 'Otros', descripcion: 'Otros' }
  ];

  mensaje: any;
  cargando = false;
  formAgregarPersona: FormGroup;
  reportedError: boolean;
  subRef$: Subscription;
  subParams: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private dataService: DataService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<PersonaAddComponent>,
    private errorHandler: ErrorHandlerService

  ) {
    this.formAgregarPersona = formBuilder.group({
      tipo: new FormControl('', [Validators.required]),
      nombres: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]),
      apellidos: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]),
      documento: new FormControl('', [Validators.required]),
      numero: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(11)]),
      direccion: new FormControl('', [Validators.required, Validators.minLength(15), Validators.maxLength(80)]),
      telefono: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(9)]),
      email: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(60), Validators.email]),
      condicion: new FormControl(true)
    });

  }
  ngOnInit(): void {

  }

  public hasError = (controlName: string, errorName: string) => {
    return this.formAgregarPersona.controls[controlName].hasError(errorName);
  }

  AgregarPersona() {
    this.cargando = true;
    const personaForCreation: PersonaForCreation = {
      codigoCliente: 0,
      tipo: this.formAgregarPersona.value.tipo,
      nombres: this.formAgregarPersona.value.nombres,
      apellidos: this.formAgregarPersona.value.apellidos,
      documento: this.formAgregarPersona.value.documento,
      numero: this.formAgregarPersona.value.numero,
      direccion: this.formAgregarPersona.value.direccion,
      telefono: this.formAgregarPersona.value.telefono,
      email: this.formAgregarPersona.value.email
    };

    const url = environment.BASE_URL + '/Cliente';
    this.subRef$ = this.dataService.post<PersonaForCreation>(url, personaForCreation)
      .subscribe(res => {
        this.notificationService.success(':: Submitted successfully');
        this.onClose()
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
    this.formAgregarPersona.reset();
  }

  ngOnDestroy() {
    if (this.subParams) { this.subParams.unsubscribe(); }
    if (this.subRef$) { this.subRef$.unsubscribe(); }
  }

}
