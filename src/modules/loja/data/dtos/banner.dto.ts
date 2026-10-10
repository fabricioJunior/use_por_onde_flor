// Shape de `EcommerceBannerEntity` (apollo-api) -- ver
// apps/api/src/modules/ecommerce/ecommerce-banner/entities/ecommerce-banner.entity.ts.
export interface BannerDto {
    id: number;
    ecommerceId: number;
    type: 'Imagem' | 'Vídeo' | 'Documento';
    url: string;
    ordem: number;
    ativo: boolean;
    dispositivo: 'desktop' | 'mobile';
    /// Destino ao tocar no banner. Ausente nas versões antigas da API = banner sem link.
    linkTipo?: 'url' | 'lista' | null;
    linkUrl?: string | null;
    listaId?: number | null;
}
