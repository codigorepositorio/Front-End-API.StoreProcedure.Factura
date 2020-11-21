import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatosDialogo } from 'src/app/models/utilitario/datos-dialogo';

@Component({
  selector: 'app-dialogo-borrar',
  templateUrl:'./dialogo-borrar.component.html',
  styles: []
})
export class DialogoBorrarComponent implements OnInit {

  constructor
  (
    public dialogRef: MatDialogRef<DialogoBorrarComponent>,
    @Inject(MAT_DIALOG_DATA) 
    public data: DatosDialogo
    
    ) { }


  ngOnInit() {
  }

  cancelar(): void {
    this.data.id = 0;
    this.dialogRef.close();
  }

}
