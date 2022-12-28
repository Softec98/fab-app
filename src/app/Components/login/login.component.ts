import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { LoginService } from 'src/app/Core/Services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(protected loginService: LoginService, private router: Router) { }

  async login(login: string, senha: string): Promise<void> {
    if (await this.loginService.login(login, senha))
      this.router.navigate(['/home']);
    else
      alert('Desculpe, credencial inválida! Por favor, tente novamente.');
  }
}