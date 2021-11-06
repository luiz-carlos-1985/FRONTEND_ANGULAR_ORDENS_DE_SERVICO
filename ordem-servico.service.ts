import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EntityBase } from '../../../app/core/models/entity-base.model';
import { Enum } from '../../../app/core/models/enum.model';
import { Paging } from '../../../app/core/models/paging.model';
import { FilterUtils } from '../../../app/core/utils/filter-utils';
import { ServiceBase } from '../../core/services/service.base';
import { OrdemServicoPesquisaFiltro } from './ordem-servico-pesquisa-filtro.model';
import { OrdemServicoPesquisa } from './ordem-servico-pesquisa.model';
import { OrdemServico } from './ordem-servico.model';
import { OrdemServicoCadastro } from './ordem-servico/ordem-servico-cadastro.model';

@Injectable({
    providedIn: 'root',
})
export class OrdemServicoService extends ServiceBase<OrdemServico> {

    static MENU_PATH = 'erp/estoque/comercial/ordem-servico';
    static PATH = '/server/api/estoque/ordens-servico';
    protected readonly PATH = OrdemServicoService.PATH;

    // Salva filtro de pesquisa no serviço
    // Quando usuário retornar da tela de cadastro, popular a tela de listagem com os dados do filtro
    filtros: OrdemServicoPesquisaFiltro;
    constructor(protected httpClient: HttpClient) {
        super(httpClient);
    }

    public filtrar(filtros: OrdemServicoPesquisaFiltro, paginacao?: Paging): Observable<EntityBase<OrdemServicoPesquisa>> {
        this.filtros = filtros;
        if (!paginacao) {
            paginacao = new Paging();
        }
        const filtroStr = FilterUtils.convertToString(filtros);
        return this.httpClient.get<EntityBase<OrdemServicoPesquisa>>(`${this.PATH}/filtrar?${filtroStr}&${paginacao.toString()}`);
    }

    public excluir(id: number): Observable<any> {
        return this.httpClient.delete<any>(`${this.PATH}/excluir/${id}`);
    }

    public obterParaEdicao(id: number): Observable<OrdemServicoCadastro> {
        return this.httpClient.get<OrdemServicoCadastro>(`${this.PATH}/editar/${id}`);
    }

    public salvar(ordemServico: OrdemServicoCadastro): Observable<number> {
        if (ordemServico.id) {
            return this.httpClient.put<number>(`${this.PATH}`, ordemServico);
        }
        return this.httpClient.post<number>(`${this.PATH}`, ordemServico);
    }

    public ordemServicoCamposExportacao(): Observable<Enum[]> {
        return this.httpClient.get<Enum[]>(`${this.PATH}/ordem-servico-campos-exportacao`);
    }

    public exportar(filtros: OrdemServicoPesquisaFiltro): Observable<Blob> {
        const filtroStr = FilterUtils.convertToString(filtros);
        return this.httpClient.get(`${this.PATH}/exportar?${filtroStr}`, { responseType: 'blob' });
    }
}

