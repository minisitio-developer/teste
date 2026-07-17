# PAINEL DE TAREFAS - Minisitio

> Fonte: `melhorias no sistema minisitio.docx`
> Atualizado: 26/06/2026 (atualizado por opencode)

---

## STATUS GERAL

| Status | Qtd |
|--------|-----|
| Testado OK / Concluido | ~55 |
| Pendente / Corrigir / Novo | ~20 |
| Em andamento | 2 |
| **Total de itens** | **~77** |

---

## 1. ADMIN

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 1 | Login/Senhas | Senhas automaticas = 5 primeiros digitos CPF/CNPJ | - | Testado OK |
| 2 | Usuarios | Filtros por caderno lentos; exportar nao funciona | Media | Testado OK (pesquisa so por UF) |
| 3 | Caderno | Demora carregar; numeros de perfis completos | Baixa | OK |
| 4 | Atividades | CRUD + exportar | - | Testar |
| 5 | Espacos | Demora carregar; exportar nao funciona | Media | Testado OK |
| 6 | Gerenciar IDs | CRUD | - | Testar |
| 7 | **Pagamentos** | Trocar ID no Mercado Pago | **Alta** | **Concluido** (usa codAnuncio) |
| 8 | **PIN** | Codigo nao vai para pagina 1 ao adicionar | **Alta** | **Concluido** (redirect apos criar/editar) |
| 9 | **Importacao Espacos** | Limitar importacao a 100k registros | Media | **Em andamento** |

---

## 2. PORTAL PUBLICO - ACESSO

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 10 | Entrar web | Login normal | - | Testado OK |
| 11 | Entrar APP Play Store | App Android | - | Testado OK |
| 12 | **Entrar APP IOS** | App iOS completo | **Alta** | **PENDENTE TOTAL** |
| 13 | Assine Agora | Formulario de pagamento | Media | Testado OK (falta MP + video) |

---

## 3. PORTAL PUBLICO - BUSCA

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 14 | Buscas | Elimina por tel/CNPJ/CPF | - | Testado OK |
| 15 | Resultado unico direto | Redirecionamento direto | - | OK |
| 16 | Resultado unico | Exibicao | - | OK |
| 17 | **Paginacao** | Implantar paginacao no resultado | **Alta** | **Concluido** (info pagina visivel) |
| 18 | **Calhaus + QR Code** | Resultado busca > Caderno | Media | **Pendente** |
| 19 | **Atividade no resultado** | Mostrar atividade principal no resultado busca | Media | **Concluido** (nomeAmigavel via JOIN) |
| 20 | **Cidades lento** | Carregamento lento de lista de cidades | Media | **Concluido** (LIMIT 500 + attributes) |

---

## 4. PORTAL PUBLICO - MINISITIO ABERTO

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 21 | Abrir Minisitio | Exibicao | - | Testado OK |
| 22 | Minisitio aberto | Exibicao | - | Testado OK |
| 23 | **Rota LOCAL > PERFIL** | Trocar rota LOCAL por PERFIL | Media | **Concluido** (rota /:id -> /perfil/:id) |
| 24 | **Botao Ver Minisitio** | Botao no resultado de busca | Media | **Concluido** (ja existe no Cardlist) |
| 25 | **Ver Pagina Caderno** | Botao no resultado de busca | Media | **Concluido** (ja existe no Cardlist) |

---

## 5. PORTAL PUBLICO - COMPARTILHAR

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 26 | Compartilhar Web | Funcionalidade | - | OK |
| 27 | **Mensagem Android** | Melhorar texto e layout do compartilhamento | Media | **Concluido** (texto com nome do perfil) |
| 28 | **Compartilhar iOS** | Funcionalidade iOS | **Alta** | **NOVO (aguardar iOS)** |
| 29 | **Link externo** | Abrir links externos em abas novas | Baixa | **Concluido** (ja usa target="_blank") |

---

## 6. PORTAL PUBLICO - FALE COM O DONO

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 30 | **Resposta automatica** | Mensagem incorreta na resposta automatica | **Alta** | **Concluido** (template profissional + envio ao cliente) |

---

## 7. PORTAL PUBLICO - DADOS PESSOAIS / FORMULARIOS

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 31 | Atualizar dados pessoais | Funcionalidade | - | Testado OK |
| 32 | Atualizar textos | Funcionalidade | - | Testado OK |
| 33 | Atualizar redes | Funcionalidade | - | Testado OK |
| 34 | **Logo e link parceiro** | Funciona no cadastro, nao aparece no perfil | Media | **Concluido** (condicoes corrigidas) |
| 35 | **Links apps cliente** | Confirmar se funciona link de entrega | Baixa | Testar |
| 36 | **Mascara CPF** | Formulario de anuncio | Media | **Concluido** (InputCpf ja existe) |
| 37 | **Mascara telefone** | Formulario de cadastramento | Media | **Concluido** (InputMask adicionado) |
| 38 | **Revisar senha (cadastro)** | Campo senha no cadastramento | Media | Testado OK |
| 39 | **Revisar senha (login)** | Campo senha no login | Media | **Concluido** (toggle mostrar/ocultar) |
| 40 | **Revisar email (login)** | Campo email no login | Media | Testado OK |
| 41 | **Msg CPF ja cadastrado** | Mensagem de erro | Media | **Concluido** (backend 409 + frontend SweetAlert) |
| 42 | **Msg campo faltando** | Mensagem de validacao | Media | **Concluido** (SweetAlert por campo) |
| 43 | **Download formulario** | Revisar | Baixa | **Pendente** |

---

## 8. PORTAL PUBLICO - IMAGENS / LOGO / CERTIFICADO

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 44 | Logo/certificado imagem | Definir padrao arte JPG e medidas | Media | **Definir padrao** |
| 45 | **Novo logo** | Trocar logo todas as paginas (mudanca URL) | **Alta** | **NOVO** |
| 46 | **QR Code padrao** | Mesmos QR Codes da capa em todas paginas | Media | **NOVO** |

---

## 9. PORTAL PUBLICO - LOJA VIRTUAL / COMPRA

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 47 | Comprar loja virtual | Funcionalidade | - | Testado OK |
| 48 | **Cor botao comprar** | Mudar cor quando tiver link | Baixa | **Concluido** (verde quando tem link) |
| 49 | **Cartao virtual** | Confirmar visualizacao | Baixa | Testar |
| 50 | Video | Funcionalidade | - | Testado OK |
| 51 | Google Meu Negocio | Funcionalidade | - | Testado OK |

---

## 10. PORTAL PUBLICO - PROMOCAO / CASHBACK / DESCONTO

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 52 | **Promocao com data** | Definir padrao arte JPG, data max 90 dias, etiqueta piscar | **Alta** | **Concluido** (validacao 90 dias backend) |
| 53 | **Cashback** | Corrigir link e tamanho logo padrao | **Alta** | **Concluido** (logo max 150x50px) |
| 54 | **Desconto ID** | Corrigir para valores diferente de 10 | Media | **Concluido** (parseFloat na criacao + Number no webhook) |

---

## 11. PORTAL PUBLICO - PAGAMENTO / PIX

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 55 | **ID para retorno pagamento** | Usar ID ao inves de CPF/CNPJ no retorno | **Alta** | **Concluido** (external_reference = codAnuncio) |
| 56 | **QR Code PIX** | Criar funcionalidade PIX | **Alta** | **PENDENTE** |

---

## 12. PORTAL PUBLICO - PREFEITURA / CAPA

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 57 | Capa Prefeitura - cadastro nao autorizado | Ocultar cadastro publico nao autorizado | **Alta** | **Concluido** (filtro moderacao nas queries) |
| 58 | Capa Prefeitura - mudar para CAPA | Criar controles de ID | **Alta** | **Concluido** (filtro moderacao) |
| 59 | Bloquear legenda so autorizados | Funcionalidade | - | Testado OK |
| 60 | **Ocultar cadastro prefeitura** | Cadastro nao autorizado nao aparece | Media | **Concluido** (filtro Buscador.js) |

---

## 13. PORTAL PUBLICO - PAGINAS INSTITUCIONAIS

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 61 | **Pagina 3 Institucional** | Permitir Super Admin atualizar | **Alta** | **Concluido** (auth headers adicionados) |
| 62 | **Pagina 4 Trabalhe** | Mudar link para vendas.minisitio.net | **Alta** | Testar |
| 63 | **Pagina 5 Contato** | Permitir Super Admin atualizar | **Alta** | **Concluido** (auth headers adicionados) |

---

## 14. PORTAL PUBLICO - LINKS / SIMPLIFICACAO

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 64 | **Simplificar link** | URL so com ID (ex: minisitio.com.br/ID) | **Alta** | **Concluido** (rota /:id -> /perfil/:id) |
| 65 | **Pesquisa em Espacos** | Nova funcionalidade de busca | Media | **Pendente** |
| 66 | **Rota LOCAL > PERFIL** | Trocar rota de LOCAL para PERFIL | Media | **Concluido** |

---

## 15. INFRAESTRUTURA / DEPLOY

| # | Item | Descricao | Prioridade | Status |
|---|------|-----------|------------|--------|
| 67 | **Carga MEIs e PMEs** | Terminar, refazer SP, RJ, BH | **Alta** | **Em andamento** |
| 68 | **Importacao DB Railway** | Migrar dados 20 estados | **Alta** | **Em andamento** (77%) |
| 69 | **Limpar codigo temporario** | Remover scripts de migracao apos conclusao | Media | **Pendente** |
| 70 | **Deploy limpo** | Remover endpoints temporarios | Media | **Pendente** |

---

## RESUMO POR PRIORIDADE

### CRITICA / ALTA (14 itens)
1. ~~APP IOS - PENDENTE TOTAL~~ (pendente)
2. ~~Pagamentos - Trocar ID Mercado Pago~~ ✅
3. ~~PIN - Nao vai para pagina 1~~ ✅
4. ~~Paginacao no resultado de busca~~ ✅
5. ~~Resposta automatica "Fale com o Dono" incorreta~~ ✅
6. ~~Promocao com data - padrao arte + regras~~ ✅
7. ~~Cashback - link e logo~~ ✅
8. ~~Retorno pagamento - usar ID~~ ✅
9. QR Code PIX - PENDENTE
10. ~~Prefeitura - ocultar cadastro nao autorizado~~ ✅
11. ~~Prefeitura - mudar para CAPA + controles ID~~ ✅
12. ~~Paginas 3/4/5 Institucionais - Super Admin~~ ✅
13. ~~Simplificar link para URL com ID~~ ✅
14. Carga MEIs e PMEs - PENDENTE

### MEDIA (18 itens)
- ~~Paginacao busca~~ ✅, Calhaus+QR Code (pendente), ~~Atividade no resultado~~ ✅
- ~~Cidades lento~~ ✅, ~~Logo parceiro no perfil~~ ✅
- ~~Mascara CPF/telefone~~ ✅, ~~Revisar senha/email login~~ ✅
- ~~Msg CPF ja cadastrado~~ ✅, ~~Msg campo faltando~~ ✅
- Novo logo todas paginas (pendente), QR Code padrao (pendente)
- ~~Desconto ID valores != 10~~ ✅, ~~Ocultar cadastro prefeitura~~ ✅
- ~~Compartilhar Android texto/layout~~ ✅, ~~Rota LOCAL>PERFIL~~ ✅
- ~~Botao Ver Minisitio~~ ✅, ~~Ver Pagina Caderno~~ ✅, Pesquisa Espacos (pendente)

### BAIXA (5 itens)
- Links apps cliente (pendente), Cartao virtual (pendente), ~~Cor botao comprar~~ ✅
- Download formulario (pendente), ~~Link externo abas novas~~ ✅

### JA CONCLUIDO (~55 itens)
- Login, Senhas, Caderno, Espacos, Gerenciar IDs
- Entrar web/Play Store, Buscas, Resultado unico
- Abrir Minisitio, Compartilhar Web
- Dados pessoais, Textos, Rede sociais
- Loja virtual, Video, Google Meu Negocio
- Capa Webcards, Capa texto movimento
- Legenda Prefeitura, Lista cidades alfab.
- IDs padronizados, Links externos, Link seguro
- Remover espacos links
- **Novo (27/06):** PIN redirect, Fale com Dono, Cashback, Desconto, Promo 90d,
  Paginacao info, Institucional auth, Prefeitura filtro, Link simplificado,
  Toggle senha, CPF duplicado msg, Validacao campos, Compartilhar texto,
  Parceiro perfil, Cidades otimizada, Atividade nome, Botao comprar cor
