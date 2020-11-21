import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultComponent } from './default.component';
import { DashboardComponent } from 'src/app/modules/dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { PostsComponent } from 'src/app/modules/posts/posts.component';

import { DialogoBorrarComponent } from 'src/app/components/borrar/dialogo-borrar.component';

import { SharedModule } from 'src/app/shared/shared.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DashboardService } from 'src/app/services/dashboard.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { ItemListComponent } from 'src/app/components/articulos/item-list.component';
import { MatInputModule } from '@angular/material/input';
import { LoginComponent } from 'src/app/components/login/login.component';
import { NotFoundComponent } from '../../components/error/not-found.component';
import { ServerErrorComponent } from '../../components/error/server-error.component';
import { PersonaListComponent } from '../../components/persona/persona-list.component';
import { PersonaEditComponent } from '../../components/persona/persona-edit.component';
import { PersonaAddComponent } from '../../components/persona/persona-add.component';
import { CategoriaListComponent } from '../../components/categoria/categoria-list.component';
import { CategoriaEditComponent } from '../../components/categoria/categoria-edit.component';
import { CategoriaAddComponent } from '../../components/categoria/categoria-add.component';
import { FacturaListComponent } from '../../components/factura/factura-list.component';
import { FacturaAddComponent } from '../../components/Factura/Factura-add.component';
import { FacturaEditComponent } from '../../components/Factura/factura-edit.component';
import { DetalleVentaEditComponent } from 'src/app/components/detalleventa/detalle-venta-edit.component';
import { DetalleVentaAddComponent } from 'src/app/components/detalleventa/detalle-venta-add.component';
import { ItemAddComponent } from 'src/app/components/articulos/item-add.component';
import { ItemEditComponent } from 'src/app/components/articulos/item-edit.component';

@NgModule({
  declarations: [
    DefaultComponent,
    DashboardComponent,
    PostsComponent,
    LoginComponent,

    ItemAddComponent,
    ItemEditComponent,
    ItemListComponent,

    CategoriaListComponent,
    CategoriaAddComponent,
    CategoriaEditComponent,

    PersonaListComponent,
    PersonaAddComponent,
    PersonaEditComponent,

    FacturaListComponent,
    FacturaAddComponent,
    FacturaEditComponent,

    DetalleVentaAddComponent,
    DetalleVentaEditComponent,

    DialogoBorrarComponent,

    NotFoundComponent,
    ServerErrorComponent

  ],

  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    SharedModule,
    MatSidenavModule,
    MatDividerModule,
    FlexLayoutModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatInputModule

  ],
  exports: [MatInputModule],
  entryComponents: [
    DialogoBorrarComponent, 
    ItemAddComponent, ItemEditComponent,
    PersonaAddComponent, PersonaEditComponent,
    CategoriaAddComponent, CategoriaEditComponent,
    DetalleVentaAddComponent, DetalleVentaEditComponent
  ],
  providers: [
    DashboardService    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DefaultModule { }
