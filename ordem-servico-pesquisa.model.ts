import { AbstractModel } from '../../core/models/abstract.model';

export class OrdemServicoPesquisa extends AbstractModel {

    public dataEntrada: Date;
    public codigoBarras: string;
    public identificacao: string;
    public cliente: string;
    public tipoObjeto: string;
    public marca: string;
    public modelo: string;
    // TODO
    // Aqui ficarão os dados que serão mostrados na tabela de listagem
}
