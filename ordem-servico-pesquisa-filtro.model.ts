import { OrdemServicoCamposExportacao } from './ordem-servico-campos-exportacao.enum';

export class OrdemServicoPesquisaFiltro {

    public cliente: string;
    public dataEntrada: Date[];
    public codigoBarras: string;
    public identificacao: string;
    public camposExportacao: OrdemServicoCamposExportacao[];
    public tipoObjeto: string;
    public marca: string;
    public modelo: string;
    public filtro: string;
    public valorInicial: number;
    public valorFinal: number;


    // TODO
    // Criar propriedades referentes aos inputs necessários para a pesquisa
}
