import { Utils } from 'src/app/Utils/Utils';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteDB } from '../../Core/Entities/ClienteDB';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DataService } from '../../Infrastructure/Services/data.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SpinnerOverlayService } from 'src/app/Core/Services/spinner-overlay.service';
import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-novo-cliente',
  templateUrl: './novo-cliente.component.html',
  styleUrls: ['./novo-cliente.component.scss']
})
export class NovoClienteComponent implements OnInit, AfterViewChecked {

  isPhonePortrait: boolean = false;
  public form!: FormGroup;

  constructor(
    protected spinner: SpinnerOverlayService,
    protected dataService: DataService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private responsive: BreakpointObserver,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {

    this.spinner.show();

    let cliente!: ClienteDB;
    this.responsive.observe([
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isPhonePortrait = false;
      if (!result.matches) {
        this.isPhonePortrait = true;
      }
    });

    const idCliente = Number(this.activatedRoute.snapshot.params["id"]);
    if (idCliente) {
      cliente = <ClienteDB>(await this.dataService.obterClientePorId(idCliente));
    }

    this.form = this.formBuilder.group({
      id: cliente.Id ?? [0],
      cnpj: this.formBuilder.control({
        value: cliente.CNPJ ?? '', disabled: false
      }, Utils.isDocumento()),
      IE: cliente?.IE ?? [''],
      nome: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(/^[a-zA-Z].*[\s\.]*$/),
        Validators.maxLength(100),
        Validators.minLength(5)
      ])),
      fantasia: cliente?.xFantasia! ?? [''],
      cep: cliente?.CEP! ?? [''],
      endereco: cliente?.xLgr! ?? [''],
      complemento: cliente?.xComplemento! ?? [''],
      numero: cliente?.nro! ?? [''],
      bairro: cliente?.cBairro! ?? [''],
      cidade: cliente?.xMun! ?? [''],
      uf: cliente?.UF! ?? [''],
      me: cliente?.indME! ?? [''],
      ddd: cliente?.fone.split(' ')[0]! ?? [''],
      ddd2: cliente?.fone2.split(' ')[0]! ?? [''],
      email: cliente?.email! ?? ['', Validators.email],
      fone: [cliente?.fone.split(' ')[1]! ?? '', Validators.pattern(/^\s*(\d{2}|\d{0})[-. ]?(\d{5}|\d{4}|d{5})[-. ]?(\d{4})[-. ]?\s*$/)],
      fone2: [cliente?.fone2.split(' ')[1]! ?? '', Validators.pattern(/^\s*(\d{2}|\d{0})[-. ]?(\d{5}|\d{4}|d{5})[-. ]?(\d{4})[-. ]?\s*$/)],
      pais: [cliente?.cPais! ?? ''],
      idPedidoUltimo: [cliente.IdPedidoUltimo ?? '']
    });

    this.spinner.hide();
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  async Salvar() { // Salvar Cliente
    let cnpj: string = this.form.controls['cnpj'].value.match(/\d/g)?.join('');
    if (typeof cnpj !== 'undefined' && cnpj !== null && cnpj !== '' &&
      (cnpj.length == 11 || cnpj.length == 14) && this.form.controls['cnpj'].valid) {
      let cliente = new ClienteDB();
      if (this.form.controls['id'].value != '0') {
        cliente.Id = this.form.controls['id'].value;
      }
      cliente.CNPJ = cnpj;
      cliente.IE = this.form.controls['IE'].value;
      cliente.xNome = this.form.controls['nome'].value;
      cliente.xFantasia = this.form.controls['fantasia'].value;
      cliente.CEP = this.form.controls['cep'].value;
      cliente.xLgr = this.form.controls['endereco'].value;
      cliente.nro = this.form.controls['numero'].value;
      cliente.xComplemento = this.form.controls['complemento'].value;
      cliente.cBairro = this.form.controls['bairro'].value;
      cliente.xMun = this.form.controls['cidade'].value;
      cliente.UF = this.form.controls['uf'].value;
      cliente.indME = this.form.controls['me'].value;
      cliente.cPais = this.form.controls['pais'].value;
      cliente.email = this.form.controls['email'].value;
      cliente.fone = this.form.controls['ddd'].value + ' ' + this.form.controls['fone'].value;
      cliente.fone2 = this.form.controls['ddd2'].value + ' ' + this.form.controls['fone2'].value;
      cliente.IdPedidoUltimo = this.form.controls['idPedidoUltimo'].value;
      await this.dataService.salvarCliente(cliente);
    }
    alert("O cliente foi salvo com sucesso!");
    this.router.navigate(['/clientes']);
  }
}