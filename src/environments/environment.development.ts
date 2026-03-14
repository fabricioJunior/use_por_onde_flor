export const environment = {
    production: false,
    serverUrl: 'https://apollo-api-stg.coralcloud.app',
    pagamentoApiUrl: 'http://localhost:5001',
    estoqueApiUrl: 'https://estoque.coralcloud.app',
    empresaPadraoId: 1,
    empresas: {
        padrao: 1,
        flor: 1,
    } as Record<string, number>,
};
