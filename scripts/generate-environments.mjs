import { config } from 'dotenv';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const environmentDir = path.join(projectRoot, 'src', 'environments');

const envOrDefault = (key, fallback) => process.env[key]?.trim() || fallback;

const sharedConfig = {
    empresaPadraoId: 1,
    empresas: {
        padrao: 1,
        flor: 1,
    },
};

const productionConfig = {
    production: true,
    serverUrl: envOrDefault('SERVER_URL', 'https://apollo-use-por-onde-for.coralcloud.app'),
    pagamentoApiUrl: envOrDefault('PAGAMENTO_API_URL', envOrDefault('SERVER_URL', 'https://apollo-use-por-onde-for.coralcloud.app')),
    estoqueApiUrl: envOrDefault('ESTOQUE_API_URL', 'https://estoque.coralcloud.app'),
    ...sharedConfig,
};

const developmentConfig = {
    production: false,
    serverUrl: envOrDefault('SERVER_URL_DEVELOPMENT', envOrDefault('SERVER_URL', 'https://apollo-api-stg.coralcloud.app')),
    pagamentoApiUrl: envOrDefault('PAGAMENTO_API_URL_DEVELOPMENT', envOrDefault('PAGAMENTO_API_URL', envOrDefault('SERVER_URL_DEVELOPMENT', 'https://apollo-use-por-onde-for.coralcloud.app'))),
    estoqueApiUrl: envOrDefault('ESTOQUE_API_URL_DEVELOPMENT', envOrDefault('ESTOQUE_API_URL', 'https://estoque.coralcloud.app')),
    ...sharedConfig,
};

const toEnvironmentFile = (environment) => `export const environment = {\n    production: ${environment.production},\n    serverUrl: '${environment.serverUrl}',\n    pagamentoApiUrl: '${environment.pagamentoApiUrl}',\n    estoqueApiUrl: '${environment.estoqueApiUrl}',\n    empresaPadraoId: ${environment.empresaPadraoId},\n    empresas: {\n        padrao: ${environment.empresas.padrao},\n        flor: ${environment.empresas.flor},\n    } as Record<string, number>,\n};\n`;

mkdirSync(environmentDir, { recursive: true });
writeFileSync(path.join(environmentDir, 'environment.ts'), toEnvironmentFile(productionConfig));
writeFileSync(path.join(environmentDir, 'environment.development.ts'), toEnvironmentFile(developmentConfig));