const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..', '..');

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

test('admin user and announcement creation routes stay protected', () => {
  const routes = read('back/routes/Routes.js');

  assert.match(
    routes,
    /router\.post\('\/api\/admin\/usuario\/create',\s*auth,\s*Users\.create\)/,
    'admin user creation must require auth'
  );

  assert.match(
    routes,
    /router\.post\('\/api\/admin\/anuncio\/create',\s*auth,\s*EspacosController\.criarAnuncio\)/,
    'admin announcement creation must require auth'
  );

  assert.match(
    routes,
    /router\.post\('\/api\/admin\/usuario\/criar-anuncio',\s*auth,\s*Users\.criarAnuncio\)/,
    'legacy admin announcement route must require auth'
  );

  assert.match(
    routes,
    /router\.get\('\/api\/admin\/desconto\/buscar\/:id',\s*auth,\s*Admin\.buscarId\)/,
    'admin discount lookup must require auth'
  );
});

test('portal routes expose only portal-safe handlers', () => {
  const routes = read('back/routes/Routes.js');
  const usersController = read('back/controllers/Users.js');

  assert.match(
    routes,
    /router\.post\('\/api\/portal\/usuario\/create',\s*Users\.createPortal\)/,
    'portal user creation must use createPortal'
  );

  assert.match(
    routes,
    /router\.post\('\/api\/portal\/anuncio\/create',\s*EspacosController\.criarAnuncio\)/,
    'portal announcement creation route must exist'
  );

  assert.match(
    routes,
    /router\.get\('\/api\/portal\/desconto\/buscar\/:id',\s*Admin\.buscarId\)/,
    'portal discount lookup route must exist'
  );

  assert.match(
    usersController,
    /TipoUsuario:\s*tipoUsuarioSolicitado === '5' \? '5' : '3'/,
    'portal user creation must not accept arbitrary user roles'
  );
});

test('public frontend flows do not call admin creation endpoints', () => {
  const publicFiles = [
    'front/src/components/Modal/ContentChildForm.jsx',
    'front/src/components/Modal/ContentChildLogin.jsx',
    'front/src/views/area-assinante/AssinanteCadastro.jsx',
    'front/src/views/comprar-anuncio/criarAnuncio.jsx',
  ];

  for (const file of publicFiles) {
    const source = read(file);
    assert.doesNotMatch(source, /\/admin\/usuario\/create/, `${file} must not call admin user creation`);
    assert.doesNotMatch(source, /\/admin\/anuncio\/create/, `${file} must not call admin announcement creation`);
  }
});

test('contact owner endpoint validates input and does not log request body', () => {
  const routes = read('back/routes/Routes.js');
  const mailer = read('back/functions/sendMailer.js');

  const routeStart = routes.indexOf("router.post('/api/fale-com-dono'");
  const routeEnd = routes.indexOf('//ROTINAS', routeStart);
  assert.ok(routeStart >= 0 && routeEnd > routeStart, 'fale-com-dono route block must be found');

  const routeBlock = routes.slice(routeStart, routeEnd);
  assert.match(routeBlock, /validateEmail\(email\)/, 'fale-com-dono must validate email');
  assert.match(routeBlock, /Number\.isInteger\(codAnuncio\)/, 'fale-com-dono must validate announcement id');
  assert.doesNotMatch(routeBlock, /console\.log\(req\.body\)/, 'fale-com-dono must not log personal request body');

  assert.match(mailer, /function escapeHtml\(value\)/, 'mailer must escape user-provided HTML');
  assert.match(mailer, /replyTo:\s*data\.email/, 'mailer must use replyTo for contact owner messages');
});

test('main public purchase flow guards API failures before redirecting', () => {
  const source = read('front/src/views/comprar-anuncio/criarAnuncio.jsx');

  assert.match(
    source,
    /function finalizarComErro\(/,
    'purchase flow must have a visible error handler'
  );

  assert.match(
    source,
    /if \(!res\.success \|\| !res\.message\?\.codAnuncio\)/,
    'announcement creation response must be validated before using codAnuncio'
  );

  assert.match(
    source,
    /if \(res\.success && res\.message\?\.codUsuario\)/,
    'user creation response must be validated before using codUsuario'
  );

  assert.match(
    source,
    /Nao foi possivel gerar o pagamento/,
    'payment generation failure must show a visible error'
  );

  assert.doesNotMatch(source, /"senha":\s*['"]12345['"]/, 'purchase flow must not send a hardcoded password');
  assert.doesNotMatch(source, /"hashCode":\s*0/, 'purchase flow must not send legacy hashCode');
});

test('checkout update flows validate payment URL before redirecting', () => {
  const checkoutFiles = [
    'front/src/views/comprar-anuncio/_components/checkoutUpdate.jsx',
    'front/src/views/campanha/_components/checkoutUpdate.jsx',
  ];

  for (const file of checkoutFiles) {
    const source = read(file);
    assert.match(source, /function redirecionarPagamento\(url\)/, `${file} must centralize payment redirect`);
    assert.match(source, /if \(!response\.url\)/, `${file} must validate payment response url`);
    assert.match(source, /mostrarErroPagamento/, `${file} must show a visible payment error`);
  }
});

test('critical public checkout files do not leave active console logs', () => {
  const files = [
    'front/src/views/comprar-anuncio/criarAnuncio.jsx',
    'front/src/views/comprar-anuncio/_components/checkoutUpdate.jsx',
    'front/src/views/campanha/_components/checkoutUpdate.jsx',
  ];

  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /^\s*console\.log\(/m, `${file} must not leave active console.log`);
  }
});

test('user exports do not include password fields', () => {
  const adminController = read('back/controllers/Admin.js');
  const userExport = read('back/functions/serverExportUser.js');

  const exportUserStart = adminController.indexOf('exportUser: async');
  const exportUserEnd = adminController.indexOf('exportID: async', exportUserStart);
  assert.ok(exportUserStart >= 0 && exportUserEnd > exportUserStart, 'Admin.exportUser block must be found');

  const exportUserBlock = adminController.slice(exportUserStart, exportUserEnd);
  const activeAttributesStart = exportUserBlock.indexOf('attributes: [');
  const activeAttributesEnd = exportUserBlock.indexOf(']', activeAttributesStart);
  assert.ok(activeAttributesStart >= 0 && activeAttributesEnd > activeAttributesStart, 'Admin.exportUser active attributes must be found');

  const activeAttributesBlock = exportUserBlock.slice(activeAttributesStart, activeAttributesEnd);
  assert.doesNotMatch(activeAttributesBlock, /['"]senha['"]/, 'Admin.exportUser must not select senha');
  assert.doesNotMatch(activeAttributesBlock, /hashCode/, 'Admin.exportUser must not select hashCode');

  const activeColumnsStart = exportUserBlock.indexOf('worksheet.columns = [');
  const activeColumnsEnd = exportUserBlock.indexOf('];', activeColumnsStart);
  assert.ok(activeColumnsStart >= 0 && activeColumnsEnd > activeColumnsStart, 'Admin.exportUser active worksheet columns must be found');

  const activeColumnsBlock = exportUserBlock.slice(activeColumnsStart, activeColumnsEnd);
  assert.doesNotMatch(activeColumnsBlock, /senha/, 'Admin.exportUser must not export senha');
  assert.doesNotMatch(activeColumnsBlock, /hashCode/, 'Admin.exportUser must not export hashCode');

  const headingStart = userExport.indexOf('const headingColumnNames');
  const headingEnd = userExport.indexOf('];', headingStart);
  assert.ok(headingStart >= 0 && headingEnd > headingStart, 'serverExportUser heading list must be found');

  const headingBlock = userExport.slice(headingStart, headingEnd);
  assert.doesNotMatch(headingBlock, /senha/, 'serverExportUser headings must not include senha');
  assert.doesNotMatch(headingBlock, /hashCode/, 'serverExportUser headings must not include hashCode');
});

test('api healthcheck is registered before frontend catch-all', () => {
  const index = read('back/index.js');

  const healthIndex = index.indexOf("app.get('/api/health'");
  const catchAllIndex = index.indexOf("app.get('*'");

  assert.ok(healthIndex >= 0, 'api healthcheck route must exist');
  assert.ok(catchAllIndex >= 0, 'frontend catch-all route must exist');
  assert.ok(healthIndex < catchAllIndex, 'api healthcheck must be registered before catch-all');
});

test('heavy pdf dependencies stay lazy-loaded in shared frontend helpers', () => {
  const files = [
    'front/src/globalFunctions/functions.jsx',
    'front/src/plugins/PdfGenerator.jsx',
    'front/src/plugins/Adesivo.jsx',
  ];

  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /^import .* from ['"]jspdf['"];?$/m, `${file} must not statically import jspdf`);
    assert.doesNotMatch(source, /^import .* from ['"]html2canvas['"];?$/m, `${file} must not statically import html2canvas`);
  }
});

test('selected admin-only screens stay lazy-loaded from route table', () => {
  const routes = read('front/src/routes/Rotas.jsx');

  assert.match(routes, /const Calhau = lazy\(\(\) => import\(["']\.\.\/admin\/view\/Calhau\/Calhau["']\)\)/, 'Calhau route must be lazy-loaded');
  assert.match(routes, /const Campanha = lazy\(\(\) => import\(["']\.\.\/admin\/view\/Campanha\/Campanha["']\)\)/, 'Campanha route must be lazy-loaded');
  assert.doesNotMatch(routes, /^import Calhau from/m, 'Calhau must not be statically imported');
  assert.doesNotMatch(routes, /^import Campanha from/m, 'Campanha must not be statically imported');
});

test('frontend bi table does not depend on vulnerable xlsx package', () => {
  const biTable = read('front/src/admin/view/BI/BiTable.jsx');
  const packageJson = read('front/package.json');

  assert.doesNotMatch(biTable, /from ['"]xlsx['"]/, 'BiTable must not import xlsx');
  assert.doesNotMatch(packageJson, /"xlsx"/, 'frontend package must not depend on xlsx');
  assert.match(biTable, /relatorio-excel\.csv/, 'Excel-compatible export must use CSV fallback');
});

test('allowed origins from env are trimmed and empty entries ignored', () => {
  const index = read('back/index.js');

  assert.match(index, /process\.env\.ALLOWED_ORIGINS\s*\.split\(','\)/, 'ALLOWED_ORIGINS must be split from env');
  assert.match(index, /\.map\(origin => origin\.trim\(\)\)/, 'ALLOWED_ORIGINS entries must be trimmed');
  assert.match(index, /\.filter\(Boolean\)/, 'empty ALLOWED_ORIGINS entries must be ignored');
});

test('innovation voice and route helpers use browser-native fallbacks', () => {
  const voiceSearch = read('front/src/components/VoiceSearchButton.jsx');
  const speakProfile = read('front/src/components/SpeakProfileButton.jsx');
  const routeAssist = read('front/src/components/RouteAssistButton.jsx');
  const busca = read('front/src/components/Busca.jsx');
  const fullWebCard = read('front/src/components/FullWebCard.jsx');

  assert.match(voiceSearch, /window\.SpeechRecognition \|\| window\.webkitSpeechRecognition/, 'voice search must support browser recognition prefixes');
  assert.match(voiceSearch, /if \(!supported\)/, 'voice search must degrade when unsupported');
  assert.match(speakProfile, /speechSynthesis/, 'profile reader must use browser speech synthesis');
  assert.match(routeAssist, /navigator\.geolocation\.getCurrentPosition/, 'route helper must request geolocation on demand');
  assert.match(routeAssist, /https:\/\/www\.google\.com\/maps\/dir\/\?/, 'route helper must use Maps URLs without API keys');
  assert.doesNotMatch(routeAssist, /AIza/, 'route helper must not embed Google API keys');
  assert.match(busca, /<VoiceSearchButton/, 'Busca must expose voice search');
  assert.match(fullWebCard, /<SpeakProfileButton/, 'FullWebCard must expose profile speech');
  assert.match(fullWebCard, /<RouteAssistButton/, 'FullWebCard must expose route assistance');
});
