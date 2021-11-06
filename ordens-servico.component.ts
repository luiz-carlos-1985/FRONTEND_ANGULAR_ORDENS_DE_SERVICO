import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { saveAs } from 'file-saver';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { BsModalService } from 'ngx-bootstrap/modal';
import { debounceTime, distinctUntilChanged, finalize, tap } from 'rxjs/operators';
import { AppConfig } from '../../app.config';
import { AbstractComponent } from '../../core/components/abstract.component';
import { Paging } from '../../core/models/paging.model';
import { PagingService } from '../../core/services/paging.service';
import { FilterContainerComponent } from '../../shared/components/filter-container/filter-container.component';
import { NotificationService } from '../../shared/notification/notification.service';
import { OrdemServicoCamposExportacao } from './ordem-servico-campos-exportacao.enum';
import { OrdemServicoPesquisaFiltro } from './ordem-servico-pesquisa-filtro.model';
import { OrdemServicoPesquisa } from './ordem-servico-pesquisa.model';
import { OrdemServicoService } from './ordem-servico.service';
import { OrdemServicoExportacaoComponent } from './ordem-servico/ordem-servico-exportacao/ordem-servico-exportacao.component';

@Component({
    selector: 'app-vo-ordens-servico',
    templateUrl: './ordens-servico.component.html',
    styleUrls: ['./ordens-servico.component.css']
})
export class OrdensServicoComponent extends AbstractComponent implements OnInit {

    formGroup: FormGroup;
    ordensServico: OrdemServicoPesquisa[] = [];
    filtros = new OrdemServicoPesquisaFiltro();
    paginacao: Paging;
    dtOptions: any;
    selectedIndex: -1;
    exportando = false;

    // Cria os objetos necessários (filtro, formGroup, objeto de pesquisa de ordens de serviço)

    @BlockUI()
    blockUI: NgBlockUI;

    columns = [
        { data: 'dataEntrada', orderable: false },
        { data: 'codigoBarras', orderable: false },
        { data: 'identificacao', orderable: false },
        { data: 'cliente', orderable: false },
        { data: 'tipoObjeto', orderable: false },
        { data: 'marca', orderable: false },
        { data: 'modelo', orderable: false },

    ];

    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;

    @ViewChild(FilterContainerComponent)
    filtroContainer: FilterContainerComponent;

    // Injeta os serviços necessários.
    constructor(
        private fb: FormBuilder,
        private pgService: PagingService,
        private router: Router,
        private modalService: BsModalService,
        private service: OrdemServicoService,
    ) {
        super();
        this.filtros = service.filtros || this.filtros;
    }

    ngOnInit() {

        this.formGroup = this.fb.group({
            cliente: this.fb.control(this.filtros.cliente || ''),
            dataEntrada: this.fb.control(this.filtros.dataEntrada || ''),
            codigoBarras: this.fb.control(this.filtros.codigoBarras || ''),
            identificacao: this.fb.control(this.filtros.identificacao || ''),
            tipoObjeto: this.fb.control(this.filtros.tipoObjeto || ''),
            marca: this.fb.control(this.filtros.marca || ''),
            modelo: this.fb.control(this.filtros.modelo || ''),

            filtroValor: this.fb.control({
                filtro: this.filtros.filtro || '',
                valorInicial: this.filtros.valorInicial || 0,
                valorFinal: this.filtros.valorFinal || 0,
            })

        });
        this.dtOptions = {
            serverSide: true,
            processing: true,
            serachDelay: 1500,
            ajax: (data, callback, settings) => {
                this.selectedIndex = -1;
                const p = this.paginacao ?? this.pgService.build(data, this.columns);

                super.subs = this.service.filtrar(this.filtros, p).pipe(
                    debounceTime(500),
                    distinctUntilChanged(),
                    tap(() => this.paginacao = undefined)).subscribe(retorno => {
                        this.ordensServico = retorno.content;

                        callback({
                            recordsTotal: retorno ? retorno.totalElements : 0,
                            recordsFiltered: retorno ? retorno.totalElements : 0,
                            data: [],
                        });

                    }, () => {
                        NotificationService.error('Ocorreu um erro ao realizar a pesquisa.');
                    });
            },
            columns: this.columns,
            order: [],
            pageLenght: AppConfig.PAGE_SIZE,
            lengthMenu: AppConfig.TABLE_PAGELENGTH_OPTIONS,
            dom: AppConfig.TABLE_DOM_BUTTONS_LENGTHMENU,
            buttons: {
                dom: {
                    button: {
                        tag: 'button',
                        className: 'btn',
                    },
                },
                buttons: [
                    {
                        text: `<i class="fa fa-file"></i> Criar`,
                        className: 'btn-primary',
                        key: {
                            key: 'n',
                            altKey: true,
                        },
                        action: () => {
                            this.router.navigateByUrl(`${OrdemServicoService.MENU_PATH}/criar`);
                        }
                    },
                    {
                        text: `<i class="fa fa-pencil-alt"></i> Editar`,
                        className: 'btn-default',
                        key: {
                            key: 'e',
                            altKey: true,
                        },
                        action: () => {
                            if (this.selectedIndex < 0) {
                                NotificationService.error('É necessário selecionar pelo menos uma ordem de serviço para editar.');
                                return;
                            }
                            const ordemServico = this.ordensServico[this.selectedIndex];
                            this.router.navigate([`${OrdemServicoService.MENU_PATH}/editar/${ordemServico.id}`]);
                        }
                    },
                    {
                        text: '<i class="fa fa-trash-alt"></i> Excluir',
                        className: 'btn-default',
                        key: {
                            key: 'd',
                            altKey: true,
                        },
                        action: () => {
                            if (this.selectedIndex < 0) {
                                NotificationService.error('É necessário selecionar pelo menos uma ordem de serviço para excluir.');
                                return;
                            }
                            NotificationService.confirm('Excluir essa ordem de serviço?', () => {
                                this.blockUI.start('Excluindo ordem de serviço.');

                                const ordemServico = this.ordensServico[this.selectedIndex];
                                super.subs = this.service.excluir(ordemServico.id)
                                    .pipe(finalize(() => this.blockUI.stop())).subscribe(() => {
                                        this.reloadDataTable();
                                        NotificationService.success('Ordem de serviço excluída com sucesso.');
                                    });

                            });
                        }
                    },
                    {
                        text: '<i class="fas fa-flie-export"></i> Exportar',
                        className: 'btn-default',
                        key: {
                            key: 'e',
                            altKey: true,
                        },
                        action: () => {
                            if (this.exportando) {
                                NotificationService.warning
                                    ('Aguarde a exportação em andamento concluir para realizar nova exportação.');
                                return;
                            }
                            if (!this.ordensServico.length) {
                                NotificationService.error('Não há ordens de serviço para exportar com os filtros selecionados.');
                                return;
                            }
                            const modal = this.modalService.show(OrdemServicoExportacaoComponent, {
                                class: 'modal-sm', ignoreBackdropClick: true
                            });
                            super.subs = modal.content.exportar.subscribe((campos: OrdemServicoCamposExportacao[]) => {
                                this.exportando = true;
                                const filtros: OrdemServicoPesquisaFiltro = {
                                    ...this.filtros,
                                    camposExportacao: campos
                                };
                                NotificationService.info('Exportação iniciada. O download do arquivo será realizado automaticamente após a conclusão da exportação.');
                                modal.hide();
                                super.subs = this.service.exportar(filtros)
                                    .pipe(finalize(() => this.exportando = false)
                                    ).subscribe(data => {
                                        saveAs(data, `Ordens_de_Serviço.xlsx`);
                                        NotificationService.success(`Exportação concluída com sucesso.`);
                                    }, () => {
                                        NotificationService.error(`Ocorreu um erro ao efetuar o download do arquivo.`);
                                    });
                            });
                        }
                    },
                ]
            }
        };

    }

    // Cria formulário para obter os valores do HTML com base nos inputs do usuário (formGroup)
    // Cria tabela com paginação para receber os dados do back end
    // Cria os botões de ações necessárias para ordem de serviço (criação/edição/exclusão/exportar)

    onPesquisar() {
        const { ...formValue } = this.formGroup.value;
        this.filtros = {
            ...new OrdemServicoPesquisaFiltro(),
            cliente: formValue.cliente,
            dataEntrada: formValue.dataEntrada,
            codigoBarras: formValue.codigoBarras,
            identificacao: formValue.identificacao,
            tipoObjeto: formValue.tipoObjeto,
            marca: formValue.marca,
            modelo: formValue.modelo,
        };
        this.reloadDataTable();
    }

    reloadDataTable() {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.ajax.reload();
        });
    }

    onLimpar() {
        this.filtros = new OrdemServicoPesquisaFiltro();
        this.paginacao = undefined;
        this.formGroup.patchValue({
            cliente: this.filtros.cliente || '',
            dataEntrada: this.filtros.dataEntrada || '',
            codigoBarras: this.filtros.codigoBarras || '',
            identificacao: this.filtros.identificacao || '',
            tipoObjeto: this.filtros.tipoObjeto || '',
            marca: this.filtros.marca || '',
            modelo: this.filtros.modelo || '',
        });
        this.reloadDataTable();
    }

    onSelecionarLinha(index) {
        if (this.selectedIndex === index) {
            this.selectedIndex = -1;
            return;
        }
        this.selectedIndex = index;
    }
}

