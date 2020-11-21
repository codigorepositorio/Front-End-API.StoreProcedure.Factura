import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Login } from 'src/app/models/login/login.model';
import { IResponse } from 'src/app/models/utilitario/iresponse.model';


@Component({
  selector: 'app-login',
  templateUrl:'./login.component.html',
  styles: [
  ]
})
export class LoginComponent implements OnInit, OnDestroy {
  formLogin: FormGroup;
  subRef$: Subscription;
  constructor(
    formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {

    this.formLogin = formBuilder.group({
      usuario: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
  }

  Login() {
    this.router.navigate(['table-list'])
    const usuarioLogin: Login =
    {
      usuario: this.formLogin.value.usuario,
      password: this.formLogin.value.password
    };
    console.log('token', usuarioLogin);
    this.subRef$ = this.http.post<IResponse>('http://localhost:50000/api/identidad/login',
      usuarioLogin, { observe: 'response' }
    ).subscribe(res => {
      const token = res.body.response;
      console.log('token', token);
      sessionStorage.setItem('token', token);
      this.router.navigate(['/user-profile'])
    },
      err => {
        console.log('Error en el Login', err);
      });

  }
  ngOnDestroy() {
    if (this.subRef$) {
      this.subRef$.unsubscribe();
    }
  }

}