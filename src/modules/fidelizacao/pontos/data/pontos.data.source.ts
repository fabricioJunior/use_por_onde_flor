import { RemoteDataSourceBase } from "../../../core/http/remote.data.source.base";
import { PontoDto } from "./dto/ponto.dto";

export class PontosDataSource extends RemoteDataSourceBase<PontoDto> {
    override path = '/v1/pessoas/{pessoaId}/transacoes-pontos';




}