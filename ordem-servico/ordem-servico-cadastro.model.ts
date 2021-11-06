import { AbstractModel } from '../../../core/models/abstract.model';
import { Terceiro } from '../../../erp/terceiros/terceiro.model';


export class OrdemServicoCadastro extends AbstractModel {

    dataEntrada: Date;
    cliente: Terceiro;
    identificacao: string;
    tipoObjeto: string;
    marca: string;
    modelo: string;
    historico: string;

}
