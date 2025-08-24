export class CruzamentoCoresETamanhosDto {
    descricao?: string;
    _id?: string;
    cruzamento?: CorTamanho[];
}

class CorTamanho {
    tamanho?: string;
    cor?: string;
    quantidade?: number;
}

//    _id: "$referencia",
//           descricao: { $first: "$descricao" },
//           cruzamento: {
//             $addToSet: {
//               tamanho: '$tamanho',
//               cor: '$cor',
//               quantidade: '$quantidade'
//             },
//           }  