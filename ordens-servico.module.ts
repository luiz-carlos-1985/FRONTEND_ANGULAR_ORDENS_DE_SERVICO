import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EstoqueModule } from '../../estoque/estoque.module';
import { OrdemServicoComponent } from './ordem-servico/ordem-servico.component';
import { OrdensServicoComponent } from './ordens-servico.component';

const ROUTES: Routes = [
    { path: '', component: OrdensServicoComponent, pathMatch: 'full' },
    { path: 'criar', component: OrdemServicoComponent },
];

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/erp/', '.json');
}

@NgModule({
    entryComponents: [
    ],
    providers: [
    ],
    declarations: [
        OrdensServicoComponent,
        OrdemServicoComponent
    ],
    imports: [
        EstoqueModule,
        RouterModule.forChild(ROUTES),
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            },
            isolate: true,
        }),
    ]
})
export class OrdensServicoModule {

    constructor(private readonly translate: TranslateService) {
        translate.addLangs(['en', 'pt-br']);
        translate.setDefaultLang('pt-br');

        const browserLang: string = translate.getBrowserLang();

        translate.use(browserLang.match(/pt-br|en/) ? browserLang : 'pt-br');

    }

}
