import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractComponent } from '../../../../core/components/abstract.component';
import { OrdemServicoService } from '../../../../estoque/ordens-servico/ordem-servico.service';
import { NotificationService } from '../../../../shared/notification/notification.service';
import { OrdemServicoCamposExportacao } from '../../ordem-servico-campos-exportacao.enum';

@Component({
    selector: 'app-vo-ordem-servico-exportacao',
    templateUrl: './ordem-servico-exportacao.component.html',
    styleUrls: ['./ordem-servico-exportacao.component.css']
})

export class OrdemServicoExportacaoComponent extends AbstractComponent implements OnInit {

    camposItens: any[];

    @Output()
    exportar = new EventEmitter<OrdemServicoCamposExportacao[]>();

    constructor(
        private service: OrdemServicoService,
    ) {
        super();
    }

    ngOnInit(): void {

        super.subs = this.service.ordemServicoCamposExportacao().subscribe(campos => {
            this.camposItens = campos
                .map(c => ({ name: c.name, text: c.codigo, isChecked: c.name !== OrdemServicoCamposExportacao }));
        });
    }
    onConfirm() {

        const campos = this.camposItens.filter(c => c.isChecked);

        if (!campos.length) {
            NotificationService.error('Selecione pelo menos um campo para exportação.');
            return;
        }
        this.exportar.emit(campos.map(c => c.name as OrdemServicoCamposExportacao));
    }


}
