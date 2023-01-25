
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  dateInput: 'yyyy-MM-DD', // 'MM/DD/YYYY' | 'yyyy-MM-DD'
  dateLocale: 'pt-BR',     // en-US        | 'pt-BR'
  defaultLang: 'pt-BR',    // en           | 'pt-BR' 
  zipCodeEndPoint_pt_BR: [
    { Id: 1, url: `https://viacep.com.br/ws/[zipCode]/json/`, metodo: 'GET', cabecalho: 0 },
    { Id: 2, url: `http://republicavirtual.com.br/web_cep.php?formato=json&cep=[zipCode]`, metodo: 'GET', cabecalho: 0 },
    { Id: 3, url: `http://cep.la/[zipCode]`, metodo: 'GET', cabecalho: 1 }
  ],
  zipCodeEndPoint_us: [
    { Id: 1, url: `https://api.zip-codes.com/ZipCodesAPI.svc/1.0/QuickGetZipCodeDetails/[zipCode]?key=DEMOAPIKEY`, metodo: 'GET', cabecalho: 0 }
  ],
  apiEndPoint: [
    'https://localhost:3000'
  ],
  Id_Cond_Pagto: [
    1
  ],
  encryptSecretKey: 'Fab@2023@Softec98#&$!',
  pageSizeOptions: [5, 10, 25, 100]
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
  // import 'zone.js/plugins/zone-error';  // Included with Angular CLI.  