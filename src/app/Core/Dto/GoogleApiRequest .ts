export class GoogleApiRequest {
    name!: string;
    id!: string | undefined;
    url!: string | undefined;

    constructor(googleApiJson: any ,name: string, id?: string | undefined) {
      this.name = name;
      this.id = id;
      this.BuscarApi(googleApiJson)
    }

    BuscarApi(jsonData: any) {
      const apiEndpoint = jsonData.endpoints.find((endpoint: any) => endpoint.name === `Sales_${this.name}`);
      if (apiEndpoint) {
        const url = `${jsonData.baseurl}/${apiEndpoint.url}/exec?action=getInfo` + 
          (this.id ? `&id=${this.id}` : '');
        this.url = url;
      } else
        console.error(`O Endpoint '${this.name}' não foi encontrado.`);
    }

    public static BuscarTokenApi(jsonData: any, user: string, pw: string) {
      let url = '';
      const apiEndpoint = jsonData.endpoints.find((endpoint: any) => endpoint.name === 'Sales_Vendedor');
      if (apiEndpoint) {
           url = `${jsonData.baseurl}/${apiEndpoint.url}/exec?action=getToken` + 
          (user && pw ? `&user=${user}&password=${pw}` : '');
      } else {
        console.error(`O Endpoint 'GetToken' não foi encontrado.`); }
      return url;
    }    
 }