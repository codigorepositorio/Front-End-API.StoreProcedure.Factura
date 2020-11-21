import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DefaultComponent } from './layouts/default/default.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { PostsComponent } from './modules/posts/posts.component';
import { ItemListComponent } from 'src/app/components/articulos/item-list.component';
import { LoginComponent } from 'src/app/components/login/login.component';
import { NotFoundComponent } from './components/error/not-found.component';
import { ServerErrorComponent } from './components/error/server-error.component';
import { PersonaListComponent } from './components/persona/persona-list.component';
import { CategoriaListComponent } from './components/categoria/categoria-list.component';
import { FacturaListComponent } from './components/factura/factura-list.component';
import { FacturaEditComponent } from './components/Factura/factura-edit.component';
import { FacturaAddComponent } from './components/Factura/Factura-add.component';
const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'posts', component: PostsComponent },
      { path: 'login', component: LoginComponent },

      { path: 'item-list', component: ItemListComponent },

      { path: 'categoria-list', component: CategoriaListComponent },
      { path: 'persona-list', component: PersonaListComponent },      

      { path: 'factura', component: FacturaListComponent },
      { path: 'factura-edit/:id', component: FacturaEditComponent },
      { path: 'factura-add', component: FacturaAddComponent },

      { path: '404', component: NotFoundComponent },
      { path: '500', component: ServerErrorComponent },
      { path: '**', redirectTo: '/404', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
