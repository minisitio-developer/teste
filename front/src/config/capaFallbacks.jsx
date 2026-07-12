const base = import.meta.env.VITE_BASE_URL || '';

const capaFallbacks = {
  DF: [
    `${base}/assets/img/brasilia/ponte-jk-wiki.jpg`,          // 0: UTILIDADE PÚBLICA
    `${base}/assets/img/brasilia/congresso-nacional.jpg`,      // 1: CÂMARA DE VEREADORES
    `${base}/assets/img/brasilia/catedral.jpg`,                // 2: INFORMAÇÕES
    `${base}/assets/img/brasilia/palacio-alvorada.jpg`,        // 3: ADMINISTRAÇÃO REGIONAL / PREFEITURA
    `${base}/assets/img/brasilia/torre-tv.jpg`,                // 4: EMERGÊNCIA
    `${base}/assets/img/brasilia/eixo-monumental.jpg`,         // 5: HOSPITAIS PÚBLICOS
    `${base}/assets/img/brasilia/brasilia-1.jpg`,              // 6: SECRETARIA DE TURISMO
    `${base}/assets/img/brasilia/brasilia-4.jpg`,              // 7: EVENTOS NA CIDADE
  ],
};

/**
 * Retorna a imagem de fallback para uma determinada UF e índice de capa.
 * Se não houver fallback para a UF, retorna null (sem fallback).
 */
export function getCapaFallback(uf, index) {
  if (!uf) return null;
  const fallbacks = capaFallbacks[uf.toUpperCase()];
  if (!fallbacks || fallbacks.length === 0) return null;
  return fallbacks[index % fallbacks.length];
}

export default capaFallbacks;
