import { IAuxiliar } from "../Core/Interfaces/IAuxiliar"
import { AbstractControl, Validators } from "@angular/forms";
import { DynamicClass } from "../Infrastructure/ApplicationDB";

export class Utils {

	static documentoMask(): any {
		let replaceMask;
		return {
			mask: (value: any) => {
				replaceMask = value.replace(/[^0-9]+/g, '')
				return replaceMask.length <= 11 ? Utils.cpfMask.mask : Utils.cnpjMask.mask;
			},
			guide: true
		};
	}

	static foneMask(): any {
		let replaceMask;
		return {
			mask: (value: any) => {
				replaceMask = value.replace(/[^0-9]+/g, '')
				return replaceMask.length <= 8 ? Utils.fone8Mask : Utils.fone9Mask;
			},
			guide: true,
			showMask: true
		}
	}    

    static isDocumento() {
        return (control: AbstractControl): Validators => {
            let documento = control.value.toString().replace(/[^0-9]+/g, '')
            switch (documento.length) {
                case 11: {
                    return this.isValidCpf(documento)
                    break;
                }
                case 14: {
                    return this.isValidCnpj(documento)
                    break;
                }
                default: {
                    return '';
                    break;
                }
            }
        };
    }

    static isValidCpf(cpf: string) {
        //const cpf = control.value == null ? '' : control?.value.replaceAll('.', '').replaceAll('-', '').replaceAll('_', '');
        if (cpf) {
            let numbers: string, digits, sum, i, result, equalDigits;
            equalDigits = 1;
            if (cpf.length < 11)
                return { cpfNotValid: true };

            for (i = 0; i < cpf.length - 1; i++) {
                if (cpf.charAt(i) !== cpf.charAt(i + 1)) {
                    equalDigits = 0;
                    break;
                }
            }

            if (!equalDigits) {
                numbers = cpf.substring(0, 9);
                digits = cpf.substring(9);
                sum = 0;
                for (i = 10; i > 1; i--) {
                    sum += parseInt(numbers.charAt(10 - i)) * i;
                }

                result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

                if (result !== Number(digits.charAt(0))) {
                    return { cpfNotValid: true };
                }
                numbers = cpf.substring(0, 10);
                sum = 0;

                for (i = 11; i > 1; i--) {
                    sum += parseInt(numbers.charAt(11 - i)) * i;
                }
                result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

                if (result !== Number(digits.charAt(1))) {
                    return { cpfNotValid: true };
                }
                return '';
            } else {
                return { cpfNotValid: true };
            }
        }
        return '';

    }

    static isValidCnpj(cnpj: string) {
        //const cnpj = control.value == null ? '' : control?.value.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '').replaceAll('_', '');
        if (cnpj) {
            let tamanho, numeros: string, digitos, i, soma, pos, resultado: number;
            if (cnpj.length != 14)
                return { cpnjNotValid: true };

            // Elimina CNPJs invalidos conhecidos
            if (cnpj == "00000000000000" ||
                cnpj == "11111111111111" ||
                cnpj == "22222222222222" ||
                cnpj == "33333333333333" ||
                cnpj == "44444444444444" ||
                cnpj == "55555555555555" ||
                cnpj == "66666666666666" ||
                cnpj == "77777777777777" ||
                cnpj == "88888888888888" ||
                cnpj == "99999999999999")
                return { cpnjNotValid: true };

            // Valida DVs
            tamanho = cnpj.length - 2
            numeros = cnpj.substring(0, tamanho);
            digitos = cnpj.substring(tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
                soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != parseInt(digitos.charAt(0)))
                return { cpnjNotValid: true };

            tamanho = tamanho + 1;
            numeros = cnpj.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
                soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != parseInt(digitos.charAt(1)))
                return { cpnjNotValid: true };
        }
        return '';
    }

    static OnlyNumbers(campo: string) {
        return campo?.match(/\d/g)?.join('')!;
    }

    static cnpjMask = {
        guide: true,
        showMask: true,
        mask: [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/]
    };

    static cpfMask = {
        guide: true,
        showMask: true,
        mask: [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]
    };

    static cepMask = {
        guide: true,
        showMask: true,
        mask: [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]
    };

    static rgMask = {
        guide: true,
        showMask: true,
        mask: [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d|X/]
    };

    static fone8Mask = [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
    static fone9Mask = [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]

    static calcAge(date: Date): number {
        if (date) {
            let timeDiff = Math.abs(Date.now() - new Date(date).getTime());
            return Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);
        }
        return 0;
    }

    static async getJson(arquivo: string) {
        return await fetch(`./assets/data/${arquivo}.json`).then(res => res.json())
            .then(data => {
                return data;
            });
    }

    static async getAuxiliar(arquivo: string) {
        return await fetch(`./assets/data/${arquivo}.json`).then(res => res.json())
            .then(data => {
                return data as IAuxiliar[];
            });
    }    

    public static ObterLista<T>(objeto: any, nome: string = ""): any {
        return Object.keys(objeto).map((i: any) => {
            if (nome !== "")
                return new DynamicClass(nome, objeto[i]);
            else
                return this.Tabela<T>(objeto[i])
        })
    }

    static Tabela<T>(value: T): T {
        return value;
    }

    static ObterMensagem(prefixo: string, campo: string, tipo: string, tam: number = 0, sufixo: string = '') {
        let retorno = { type: '', message: '' };
        switch (tipo) {
            case 'email':
                retorno = { type: tipo, message: `${prefixo} ${campo} é inválido` };
                break;
            case 'maxlength':
                retorno = { type: tipo, message: `${prefixo} ${campo} não pode ter mais do que ${tam} caracteres` };
                break;
            case 'minlength':
                retorno = { type: tipo, message: `${prefixo} ${campo} precisa ter no mínimo ${tam} caracteres` };
                break;
            case 'pattern':
                retorno = { type: tipo, message: `${prefixo} ${campo} ${sufixo}` };
                break;
            case 'required':
                retorno = { type: tipo, message: `${prefixo} ${campo} é obrigatári${prefixo.toLowerCase()}` };
                break;
        }
        return retorno;
    }
}