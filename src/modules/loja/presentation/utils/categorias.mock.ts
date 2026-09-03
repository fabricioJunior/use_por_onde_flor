// TODO: plugar em serviço de categorias quando existir endpoint. Não há tabela/endpoint de
// categoria no apollo-api hoje -- lista fixa só pra viabilizar a seção/página na identidade nova.
export interface CategoriaMock {
    slug: string;
    nome: string;
    descricao: string;
    icone?: string;
}

export const CATEGORIAS_MOCK: CategoriaMock[] = [
    { slug: 'vestidos', nome: 'Vestidos', descricao: 'Peças atemporais para o dia a dia.' },
    { slug: 'calcas', nome: 'Calças', descricao: 'Alfaiataria e jeans em cortes básicos.' },
    { slug: 'blusas', nome: 'Blusas', descricao: 'Camisas e blusas para compor looks discretos.' },
    { slug: 'acessorios', nome: 'Acessórios', descricao: 'Detalhes que fecham o look.' },
];
