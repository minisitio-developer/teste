/**
 * capaFallbacks.js — Imagens estáticas de fallback para capas por UF
 * Quando a imagem do banco falha ou não existe, usa a imagem estática da UF correspondente.
 * 
 * Cada uma das 8 capas recebe uma imagem diferente de Brasília:
 * 0 = UTILIDADE PÚBLICA
 * 1 = CÂMARA DE VEREADORES
 * 2 = INFORMAÇÕES
 * 3 = ADMINISTRAÇÃO REGIONAL / PREFEITURA
 * 4 = EMERGÊNCIA
 * 5 = HOSPITAIS PÚBLICOS
 * 6 = SECRETARIA DE TURISMO
 * 7 = EVENTOS NA CIDADE
 */

const capaFallbacks = {
  DF: [
    '/assets/img/brasilia/ponte-jk-wiki.jpg',          // 0: UTILIDADE PÚBLICA
    '/assets/img/brasilia/congresso-nacional.jpg',      // 1: CÂMARA DE VEREADORES
    '/assets/img/brasilia/catedral.jpg',                // 2: INFORMAÇÕES
    '/assets/img/brasilia/palacio-alvorada.jpg',        // 3: ADMINISTRAÇÃO REGIONAL / PREFEITURA
    '/assets/img/brasilia/torre-tv.jpg',                // 4: EMERGÊNCIA
    '/assets/img/brasilia/eixo-monumental.jpg',         // 5: HOSPITAIS PÚBLICOS
    '/assets/img/brasilia/brasilia-1.jpg',              // 6: SECRETARIA DE TURISMO
    '/assets/img/brasilia/brasilia-4.jpg',              // 7: EVENTOS NA CIDADE
  ],
};

/**
 * Retorna a imagem de fallback para uma determinada UF e índice de capa.
 * Se não houver fallback para a UF, retorna null (sem fallback).
 */
export function getCapaFallback(uf, index) {
  const fallbacks = capaFallbacks[uf];
  if (!fallbacks || fallbacks.length === 0) return null;
  return fallbacks[index % fallbacks.length];
}

export default capaFallbacks;
