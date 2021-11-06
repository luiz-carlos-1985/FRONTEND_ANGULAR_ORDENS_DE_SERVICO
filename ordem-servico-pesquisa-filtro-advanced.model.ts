import { OrdemServicoCamposExportacao } from './ordem-servico-campos-exportacao.enum';

export class OrdemServicoPesquisaFiltroAdvanced {

    public tipoObjeto: string;
    public marca: string;
    public modelo: string;
    public camposExportacao: OrdemServicoCamposExportacao[];

}
