import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { MatPaginatorIntl, MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';

import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

import { NotificationService } from 'src/app/services/notification.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { DialogoBorrarComponent } from 'src/app/components/borrar/dialogo-borrar.component';
import { Persona } from '../../models/Persona/persona.model';
import { PersonaEditComponent } from './persona-edit.component';
import { PersonaAddComponent } from './persona-add.component';
import { MatPaginatorIntlCro } from 'src/app/models/utilitario/mat-paginator-intl-cro';

@Component({
  selector: 'app-persona-list',
  templateUrl: './persona-list.component.html',
  styles: [],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlCro }],
})
export class PersonaListComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  personas: MatTableDataSource<Persona>;
  subRef$: Subscription;
  searchKey: string;
  displayedColumns: string[] = ['codigoCliente','tipo', 'nombres', 'documento', 'numero', 'direccion', 'telefono', 'email', 'actions'];
  cargando = true;
  constructor(
    private dataService: DataService,
    public dialog: MatDialog,
    public data: MatDialog,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService

  ) { }

  ngOnInit(): void {
    this.ListaPersonas();
  }

  ngOnDestroy() {
    if (this.subRef$) {
      this.subRef$.unsubscribe();
    }
  }

  ListaPersonas() {
    const url = environment.BASE_URL + '/Cliente';
    this.subRef$ = this.dataService.get<Persona[]>(url)
      .subscribe(res => {
        this.cargando = false;
        this.personas = new MatTableDataSource<Persona>(res.body);
        this.personas.paginator = this.paginator;
        this.personas.sort = this.sort;
      },
        (error) => { this.errorHandler.handleError(error) })
  }

  borrar(per: Persona) {
    const dialogRef = this.dialog.open(DialogoBorrarComponent, {
      width: '390px',
      panelClass: 'confirm-dialog-container',
      disableClose: true,
      position: { top: "10px" },
      data: {
        id: per.codigoCliente,
        titulo: '¿Desea eliminar la Persona:  "' + per.codigoCliente + ' ' + per.nombres + '"?',
        dato: 'Si continua no podra recuperar los cambios.'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.id > 0) {
        this.BorrarArticulo(per);
      }
    });
  }

  BorrarArticulo(per: Persona) {
    this.cargando = true;
    const url = environment.BASE_URL + '/Cliente/' + per.codigoCliente
    this.subRef$ = this.dataService.delete<Persona>(url)
      .subscribe(res => {
        const index: number = this.personas.data.findIndex(d => d === per);
        this.personas.data.splice(index, 1);
        this.personas = new MatTableDataSource<Persona>(this.personas.data);
        this.personas.paginator = this.paginator;
        this.personas.sort = this.sort;
        this.cargando = false;
        console.log(res)
      }, err => {
        this.cargando = false;
        if (err.status === 0) {
          this.errorHandler.handleError(err);
          return;
        }
        console.log(err.error);
        
      });
  }
  agregar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.width = "50%";
    this.dialog.open(PersonaAddComponent, dialogConfig).afterClosed()
      .subscribe(res => { this.ListaPersonas() });
  }

  editar(e) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.width = "50%";
    dialogConfig.data = { codigoCliente: e.codigoCliente };
    this.dialog.open(PersonaEditComponent, dialogConfig).afterClosed()
      .subscribe(res => { this.ListaPersonas() });
  }

  onSearchClear() {
    this.searchKey = "";
    this.applyFilter();
  }

  applyFilter() {
    this.personas.filter = this.searchKey.trim().toLocaleLowerCase();
  }

}
