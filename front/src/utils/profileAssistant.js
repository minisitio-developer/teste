const STOP_WORDS = new Set([
  'com',
  'das',
  'dos',
  'para',
  'pela',
  'pelo',
  'que',
  'uma',
  'em',
  'de',
  'do',
  'da',
  'e',
  'o',
  'a',
  'as',
  'os',
]);

export function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeTag(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordsFrom(value) {
  return normalizeTag(value)
    .split(' ')
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

export function buildProfileSuggestions(form) {
  const nome = cleanText(form.descAnuncio);
  const atividade = cleanText(form.codAtividade);
  const cidade = cleanText(form.codCaderno);
  const uf = cleanText(form.codUf);
  const endereco = cleanText(form.descEndereco);
  const telefone = cleanText(form.descTelefone);
  const celular = cleanText(form.descCelular);
  const whatsapp = cleanText(form.descWhatsApp);
  const email = cleanText(form.descEmailComercial);
  const video = cleanText(form.descYouTube);

  const missingFields = [];
  if (!nome) missingFields.push('nome do anuncio');
  if (!atividade) missingFields.push('atividade principal');
  if (!cidade || !uf) missingFields.push('cidade e UF');
  if (!endereco) missingFields.push('endereco');
  if (!telefone && !celular && !whatsapp) missingFields.push('telefone ou WhatsApp');
  if (!email) missingFields.push('email comercial');
  if (!form.hasImage) missingFields.push('imagem do perfil');

  const location = [cidade, uf].filter(Boolean).join('/');
  const contact = whatsapp || celular || telefone;
  const descriptionParts = [
    nome && atividade
      ? `${nome} oferece ${atividade.toLowerCase()}${location ? ` em ${location}` : ''}.`
      : nome
        ? `${nome}${location ? ` atende em ${location}` : ''}.`
        : '',
    endereco ? `Atendimento no endereco ${endereco}.` : '',
    contact ? `Fale pelo ${whatsapp ? 'WhatsApp' : 'telefone'} ${contact}.` : '',
    video ? 'Veja tambem o video de apresentacao no perfil.' : '',
  ];

  const description = descriptionParts.filter(Boolean).join(' ');
  const baseTags = [
    ...wordsFrom(nome),
    ...wordsFrom(atividade),
    ...wordsFrom(cidade),
  ];

  const tags = unique(baseTags).slice(0, 10);
  const totalFields = 7;
  const score = Math.max(0, Math.round(((totalFields - missingFields.length) / totalFields) * 100));

  return {
    description,
    tags,
    missingFields,
    score,
  };
}
