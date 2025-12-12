import { first, firstValueFrom } from "rxjs";
import { RemoteDataSourceBase } from "../../core/http/remote.data.source.base";
import { RecuperarSenhaDto } from "./dto/recuperar.senha.dto";
import { Injectable } from "@angular/core";

@Injectable()
export class RecuperarSenhaDataSource extends RemoteDataSourceBase<RecuperarSenhaDto> {
    override path = 'v1/pessoas-usuarios/{acao}';



    notificarEsquecimentoDeSenha(email: string): Promise<RecuperarSenhaDto> {
        var observe = this.post(
            {
                pathArguments: {
                    'acao': 'esqueci-senha'
                },
                body: {
                    'email': email
                }
            }
        );
        return firstValueFrom(observe);
    }

    solicitarEsquecimentoDeSenha(email: string): Promise<RecuperarSenhaDto> {
        var observe = this.post(
            {
                pathArguments: {
                    'acao': 'solicitar-redefinir-senha'
                },
                body: {
                    'email': email
                }
            }
        );
        return firstValueFrom(observe);
    }

    redefinirSenha(email: string, codigo: string): Promise<RecuperarSenhaDto> {
        var observe = this.post(
            {
                pathArguments: {
                    'acao': 'redefinir-senha'
                },
                body: {
                    'novaSenha': email,
                    'codigo': codigo,
                }
            }
        );
        return firstValueFrom(observe);
    }



}

