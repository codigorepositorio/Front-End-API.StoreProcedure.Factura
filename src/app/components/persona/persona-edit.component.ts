import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { NotificationService } from 'src/app/services/notification.service';
import { PersonaForUpdate } from '../../models/Persona/personaForUpdate.model';
import { Persona } from '../../models/Persona/persona.model';
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
  selector: 'app-persona-edit',
  templateUrl: './persona-edit.component.html',
  styles: [
  ]
})
export class PersonaEditComponent implements OnInit, OnDestroy {
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
  formEditarPersona: FormGroup;
  reportedError: boolean;
  subRef$: Subscription;
  subParams: Subscription;
  clienteID: number;
  constructor(
    public dialogRef: MatDialogRef<PersonaEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService
  ) {
    this.formEditarPersona = formBuilder.group({
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
    this.cargando = true;
    this.clienteID = this.data.codigoCliente
    const url = environment.BASE_URL + '/Cliente/' + this.clienteID;
    this.subRef$ = this.dataService.get<Persona>(url)
      .subscribe(res => {
        this.cargando = false;
        const art: Persona = res.body;
        this.formEditarPersona.patchValue(art);
      },
        (error) => {
          this.dialogRef.close();
          this.errorHandler.handleError(error);
        });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.formEditarPersona.controls[controlName].hasError(errorName);
  }

  EditarArticulo() {
    const personaForUpdate: PersonaForUpdate = {
      codigoCliente: this.clienteID,
      tipo: this.formEditarPersona.value.tipo,
      nombres: this.formEditarPersona.value.nombres,
      apellidos: this.formEditarPersona.value.apellidos,
      documento: this.formEditarPersona.value.documento,
      numero: this.formEditarPersona.value.numero,
      direccion: this.formEditarPersona.value.direccion,
      telefono: this.formEditarPersona.value.telefono,
      email: this.formEditarPersona.value.email
    };

    const url = environment.BASE_URL + '/Cliente';
    this.subRef$ = this.dataService.put<PersonaForUpdate>(url, personaForUpdate)
      .subscribe(res => {
        this.cargando = false;
        this.notificationService.success(':: Submitted successfully');
        this.dialogRef.close()
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
    this.dialogRef.close();
    this.formEditarPersona.reset();
  }

  onClose() {
    this.dialogRef.close();
    this.formEditarPersona.reset();
  }

  ngOnDestroy() {
    if (this.subParams) { this.subParams.unsubscribe(); }
    if (this.subRef$) { this.subRef$.unsubscribe(); }
  }

}
