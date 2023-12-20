import { Utils } from 'src/app/Utils/Utils';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RegiaoDB } from 'src/app/Core/Entities/RegiaoDB';
import { VendedorDB } from 'src/app/Core/Entities/VendedorDB';
import { EmpresaService } from '../../Core/Services/empresa.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { IVendedor_aux } from 'src/app/Core/Interfaces/IVendedor_aux';
import { DataService } from '../../Infrastructure/Services/data.service';
import { CriptografiaService } from 'src/app/Core/Services/criptografia.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SpinnerOverlayService } from 'src/app/Core/Services/spinner-overlay.service';
import vendedor_validation from '../../../assets/data/validation/vendedor-validation.json';
import { Component, Input, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-vendedor',
  templateUrl: './vendedor.component.html',
  styleUrls: ['./vendedor.component.scss']
})
export class VendedorComponent implements OnInit, AfterViewChecked {

  @Input() cnpj!: string;
  validation_messages = vendedor_validation;
  isPhonePortrait: boolean = false;
  regiao: RegiaoDB[] = [];
  vendedores: IVendedor_aux[] = [];
  public formVendedor!: FormGroup;

  foneMask = Utils.foneMask();
  documentoMask = Utils.documentoMask();

  constructor(
    protected cripto: CriptografiaService,
    protected dataService: DataService,
    protected empresaService: EmpresaService,
    private responsive: BreakpointObserver,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private spinner: SpinnerOverlayService
    
  ) { }

  private async carregarSeletores() {
    const promise1 = this.dataService.obterRegiao();
    const promise2 = this.dataService.preencherVendedores();
    await Promise.allSettled([promise1, promise2]).
      then((results) => results.forEach((result) => console.log(result.status))).
      finally(async () => this.atualizarSeletores().then(() => {
        console.log("Seletores atualizados...");
      }));
  }

  private async atualizarSeletores() {
    this.regiao = this.dataService.regiao;
    this.vendedores = this.dataService.vendedores_aux;
  }

  async ngOnInit(): Promise<void> {

    this.spinner.show();

    let vendedor!: VendedorDB;
    this.responsive.observe([
      Breakpoints.HandsetPortrait,
    ]).subscribe((result: { matches: any; }) => {
      this.isPhonePortrait = false;
      if (!result.matches) {
        this.isPhonePortrait = true;
      }
    });

    const idVendedor = Number(this.activatedRoute.snapshot.params["id"]);
    if (idVendedor) {
      const usuario = JSON.parse(localStorage.getItem('usuario')!) as VendedorDB;
      vendedor = <VendedorDB>(await this.dataService.obterVendedorPorId(idVendedor));
      if (!usuario.IsAdmin && vendedor.Id != usuario.Id) {
        const filhos = await this.dataService.obterVendedoresFilho(usuario.Id);
        if (!filhos.includes(idVendedor)) {
          alert("Desculpe, mas você não tem autorização para acessar esse cadastro.");
          this.router.navigate(['/vendedores']);
        }
      }
    } else {
      alert("Desculpe, mas o cadastro não está disponível.");
      this.router.navigate(['/vendedores']);
    }

    this.formVendedor = this.formBuilder.group({
      id: vendedor.Id ?? [0],
      codigo: vendedor.Codigo ?? [0],
      documento: this.formBuilder.control({
        value: vendedor.Documento ?? '', disabled: false
      }, Utils.isDocumento()),
      contato: vendedor?.xContato ?? [''],
      nome: new FormControl(vendedor?.xNome ?? [''], Validators.compose([
        Validators.required,
        Validators.pattern(/^[a-zA-Z].*[\s\.]*$/),
        Validators.maxLength(100),
        Validators.minLength(5)
      ])),
      login: vendedor?.Login! ?? [''],
      acesso: vendedor?.Acesso! == null ? [''] : this.cripto.decryptData(vendedor?.Acesso!),
      nasc: vendedor?.DataNasc! ?? [''],
      ultAcesso: new FormControl({ value: ((vendedor?.UltimoAcesso! + '') === '') ? '' : formatDate(vendedor?.UltimoAcesso!, 'yyyy-MM-ddTHH:mm', 'en'), disabled: true }),
      idPai: vendedor?.IdPai! ?? [''],
      idRegiao: vendedor?.IdRegiao! ?? [''],
      isAdmin: vendedor?.IsAdmin! ?? [''],
      email: new FormControl(vendedor?.Email! ?? [''], Validators.email),
      ddd: vendedor?.fone.replace('9 ', '9').replace('(', '').replace(')', '').split(' ')[0]! ?? [''],
      ddd2: vendedor?.fone2.replace('9 ', '9').replace('(', '').replace(')', '').split(' ')[0]! ?? [''],
      ddd3: vendedor?.Celular.replace('9 ', '9').replace('(', '').replace(')', '').split(' ')[0]! ?? [''],
      fone: [vendedor?.fone.replace('9 ', '9').replace('(', '').replace(')', '').split(' ')[1]! ?? '', Validators.pattern(/^\s*(\d{2}|\d{0})[-. ]?(\d{5}|\d{4}|d{5})[-. ]?(\d{4})[-. ]?\s*$/)],
      fone2: [vendedor?.fone2.replace('9 ', '9').replace('(', '').replace(')', '').split(' ')[1]! ?? '', Validators.pattern(/^\s*(\d{2}|\d{0})[-. ]?(\d{5}|\d{4}|d{5})[-. ]?(\d{4})[-. ]?\s*$/)],
      celular: [vendedor?.Celular.replace('9 ', '9').replace('(', '').replace(')', '').split(' ')[1]! ?? '', Validators.pattern(/^\s*(\d{2}|\d{0})[-. ]?(\d{5}|\d{4}|d{5})[-. ]?(\d{4})[-. ]?\s*$/)],
    });

    await this.carregarSeletores();

    this.spinner.hide();
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  BuscarEmpresa(event: Event): void {
    const cnpj = (event.target as HTMLInputElement).value.match(/\d/g)?.join('');
    this.BuscarEmpresaIcon(cnpj);
  }

  async BuscarEmpresaIcon(cnpj?: string): Promise<void> {
    cnpj = cnpj?.match(/\d/g)?.join('');
    if (typeof cnpj !== 'undefined' && cnpj !== null && cnpj !== '' &&
      (cnpj.length == 11 || cnpj.length == 14) &&
      this.formVendedor.controls['documento'].valid && this.formVendedor.controls['nome'].value == '') {
      this.empresaService.obterEmpresa(cnpj)
        .subscribe({
          next: (empresa: any) => {
            if (this) {
              this.formVendedor.patchValue({
                id: 0,
                nome: empresa.company.name,
                contato: empresa.alias!,
                email: empresa.emails.length > 0 ? empresa.emails[0].address : '',
                fone: empresa.phones.length > 0 ? empresa.phones[0].number : '',
                fone2: empresa.phones.length > 1 ? empresa.phones[1].number : ''
              });
            }
          },
          error: (err: any) => {
            alert(`Não foi possível encontrar a empresa,\nverifique se o CNPJ está correto.`);
          }
        });
    }
  }

  async Salvar() {
    let cnpj: string = this.formVendedor.controls['documento'].value.match(/\d/g)?.join('');
    if (typeof cnpj !== 'undefined' && cnpj !== null && cnpj !== '' &&
      (cnpj.length == 11 || cnpj.length == 14) && this.formVendedor.controls['documento'].valid) {
      let vendedor = new VendedorDB();
      if (this.formVendedor.controls['id'].value != '0') {
        vendedor.Id = this.formVendedor.controls['id'].value;
      }
      vendedor.Documento = cnpj;
      vendedor.Codigo = this.formVendedor.controls['codigo'].value;
      vendedor.xNome = this.formVendedor.controls['nome'].value;
      vendedor.xContato = this.formVendedor.controls['contato'].value;
      vendedor.Login = this.formVendedor.controls['login'].value;
      vendedor.Acesso = this.cripto.encryptData(this.formVendedor.controls['acesso'].value);
      vendedor.DataNasc = this.formVendedor.controls['nasc'].value;
      vendedor.IdPai = this.formVendedor.controls['idPai'].value;
      vendedor.IdRegiao = this.formVendedor.controls['idRegiao'].value;
      vendedor.IsAdmin = this.formVendedor.controls['isAdmin'].value;
      vendedor.Email = this.formVendedor.controls['email'].value;
      vendedor.fone = '(' + this.formVendedor.controls['ddd'].value + ') ' + this.formVendedor.controls['fone'].value;
      vendedor.fone2 = '(' + this.formVendedor.controls['ddd2'].value + ') ' + this.formVendedor.controls['fone2'].value;
      vendedor.Celular = '(' + this.formVendedor.controls['ddd3'].value + ') ' + this.formVendedor.controls['celular'].value;
      await this.dataService.salvarVendedor(vendedor);
    }
    alert("O vendedor foi salvo com sucesso!");
    this.router.navigate(['/vendedores']);
  }

  obterVendedores() {
    return this.vendedores;
  }

  public senhaPadrao() {
    const id = this.formVendedor.controls['id'].value;
    if (id > 0) {
      const acesso = this.vendedores.filter(x => x.key == id)[0].secret;
      this.formVendedor.patchValue({
        acesso: acesso
      });
    }
  }
}