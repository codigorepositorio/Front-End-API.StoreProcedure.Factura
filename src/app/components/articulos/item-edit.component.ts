import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { NotificationService } from 'src/app/services/notification.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { Item } from 'src/app/models/Item/item.model';
import { ItemForUpdate } from 'src/app/models/Item/ItemForUpdate.model';

@Component({
  selector: 'app-item-edit',
  templateUrl: './item-edit.component.html'
})
export class ItemEditComponent implements OnInit, OnDestroy {
  private subParams: Subscription;
  codigoItem: number;
  condicion: boolean;
  cargando = false;
  formEditArticulo: FormGroup;
  subRef$: Subscription;
 

  constructor(
    public dialogRef: MatDialogRef<ItemEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService) {

    this.formEditArticulo = formBuilder.group({
      descripcion: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]),      
      precio: new FormControl(0.00, [Validators.required, Validators.min(0.5), Validators.max(500)]),      
      condicion: new FormControl(true)
    });
  }

  ngOnInit() {
    this.cargando = true;
    this.codigoItem = this.data.codigoItem

    const url = environment.BASE_URL + '/Item/' + this.codigoItem;;
    this.subRef$ = this.dataService.get<Item>(url)
      .subscribe(res => {
        this.cargando = false;
        const art: Item = res.body;
        this.formEditArticulo.patchValue(art);        
      }, (error) => {
        this.cargando = false;
        this.errorHandler.handleError(error);
        this.dialogRef.close();
      });
  
  }
  public hasError = (controlName: string, errorName: string) => {
    return this.formEditArticulo.controls[controlName].hasError(errorName);
  }

  ActualizarArticulo() {
    this.cargando = true;
    const itemForUpdate: ItemForUpdate = {      
      codigoItem: this.codigoItem,
      descripcion: this.formEditArticulo.value.descripcion,
      precio: this.formEditArticulo.value.precio,            
      condicion: this.formEditArticulo.value.condicion,
    };

    const url = environment.BASE_URL + '/Item'
    this.subRef$ = this.dataService.put<ItemForUpdate>(url,
      itemForUpdate)
      .subscribe(res => {
        console.log("modificado",res.body);
        this.cargando = false;
        this.onClose();
        this.notificationService.warn(':: Submitted successfully');
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
    //this.condicion = event.checked;
  }

  cancelar() {
    this.onClose();
  }

  onClose() {
    this.dialogRef.close();
    this.formEditArticulo.reset();
  }

  ngOnDestroy() {
    if (this.subParams) { this.subParams.unsubscribe(); }
    if (this.subRef$) { this.subRef$.unsubscribe(); }
  }
}
