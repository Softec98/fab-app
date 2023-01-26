
import { Utils } from 'src/app/Utils/Utils';
import { IAuxiliar } from '../../Core/Interfaces/IAuxiliar'
import { CepService } from '../../Core/Services/cep.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { EmpresaService } from '../../Core/Services/empresa.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DataService } from '../../Infrastructure/Services/data.service';
import cliente_validation from '../../../assets/data/validation/cliente-validation.json';
import { Component, Input, ViewChild, ElementRef, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';

@Component({
	selector: 'app-cliente',
	templateUrl: './cliente.component.html',
	styleUrls: ['./cliente.component.scss']
})
export class ClienteComponent implements OnInit, AfterViewChecked {

	@ViewChild("inputCliente") inputClienteField!: ElementRef;
	@Input() cnpj!: string;
	validation_messages = cliente_validation;
	isPhonePortrait: boolean = false;
	idUltimoPedido!: number;
	Estados: IAuxiliar[] = [];
	public formCliente!: FormGroup;

	cepMask = Utils.cepMask;
	foneMask = Utils.foneMask();
	documentoMask = Utils.documentoMask();

	constructor(
		protected cepService: CepService,
		protected dataService: DataService,
		private responsive: BreakpointObserver,
		protected empresaService: EmpresaService,
		private rootFormGroup: FormGroupDirective,
		private readonly changeDetectorRef: ChangeDetectorRef
	) { }

	async ngOnInit(): Promise<void> {
		this.formCliente = this.rootFormGroup.control;
		this.responsive.observe([
			Breakpoints.HandsetPortrait,
		]).subscribe(result => {
			this.isPhonePortrait = false;
			if (!result.matches) {
				this.isPhonePortrait = true;
			}
		});
		this.dataService.ObterEstados().subscribe(data => {
			this.Estados = data;
		});
		setTimeout(async () => {
			if (this.cnpj) {
				await this.BuscarEmpresaIcon(this.cnpj);
			}
		}, 0);
	}

	async ngAfterViewInit(): Promise<void> {
		// this.inputClienteField.nativeElement.select();
		// this.inputClienteField.nativeElement.focus();
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
			this.formCliente.controls['cnpj'].valid && this.formCliente.controls['nome'].value == '') {
			const cliente = await this.dataService.obterClientePeloCnpj(cnpj);
			if (cliente != null) {
				if (cliente.IdPedidoUltimo) {
					this.idUltimoPedido = cliente.IdPedidoUltimo;
				}
				this.formCliente.patchValue({
					id: cliente.Id,
					nome: cliente.xNome,
					IE: cliente.IE,
					fantasia: cliente.xFantasia,
					cep: cliente.CEP,
					endereco: cliente.xLgr,
					numero: cliente.nro,
					complemento: cliente.xComplemento,
					bairro: cliente.cBairro,
					cidade: cliente.xMun,
					uf: cliente.UF,
					me: cliente.indME,
					pais: cliente.cPais,
					email: cliente.email,
					ddd: cliente.fone?.split(' ')[0] ?? '',
					fone: cliente.fone?.split(' ')[1] ?? '',
					ddd2: cliente.fone2?.split(' ')[0] ?? '',
					fone2: cliente.fone2?.split(' ')[1] ?? '',
				});
			}
			else {
				this.empresaService.obterEmpresa(cnpj)
					.subscribe({
						next: (empresa: any) => {
							if (this) {
								this.formCliente.patchValue({
									id: 0,
									nome: empresa.company.name,
									fantasia: empresa.alias!,
									cep: empresa.address.zip,
									endereco: empresa.address.street,
									numero: empresa.address.number,
									complemento: empresa.address.details!,
									bairro: empresa.address.district,
									cidade: empresa.address.city,
									uf: empresa.address.state,
									me: empresa.company.size.text == "Microempresa",
									pais: empresa.address.country.name,
									email: empresa.emails.length > 0 ? empresa.emails[0].address : '',
									ddd: empresa.phones.length > 0 ? empresa.phones[0].area : '',
									fone: empresa.phones.length > 0 ? empresa.phones[0].number : '',
									ddd2: empresa.phones.length > 1 ? empresa.phones[1].area : '',
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
	}

	ObterEndereco() {
		let cep: string = this.formCliente.controls['cep'].value.match(/\d/g)?.join('');
		if (typeof cep !== 'undefined' && cep !== null && cep !== '' && cep.length == 8
			&& this.formCliente.controls['cep'].valid) {
			this.cepService.ObterEndereco(cep)
				.subscribe({
					next: (endereco: any) => {
						if (this)
							this.formCliente.patchValue({
								endereco: endereco.logradouro,
								complemento: endereco.complemento,
								bairro: endereco.bairro,
								uf: endereco.uf,
								cidade: endereco.localidade
							});
					},
					error: (err: any) => {
						alert(`Erro ao buscar o CEP: ${err.message}`);
					}
				});
		}
	}
}