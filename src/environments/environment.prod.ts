export const environment = {
    production: true,
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
    ]
  };