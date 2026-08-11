// Espelha PessoaEnderecoEntity / CreatePessoaEnderecoDto do apollo-api
// (apps/api/src/modules/pessoa/endereco/*).
export interface EnderecoDto {
    id?: number;
    pessoaId?: number;
    principal: boolean;
    tipoEndereco: 'Residencial' | 'Comercial';
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    pais?: string;
}
