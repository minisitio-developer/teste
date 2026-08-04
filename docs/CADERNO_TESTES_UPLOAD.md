# Caderno de Testes — Uploads MiniSítio

Objetivo: validar os fluxos críticos de upload após a padronização dos componentes de imagem e PDF.

Ambiente recomendado:

- Branch: `develop`
- Frontend buildado sem erro
- Backend apontando para ambiente de homologação/desenvolvimento
- Usuário autenticado com permissão para criar/editar perfil

## Preparação

- [ ] Acessar o sistema em ambiente de teste.
- [ ] Fazer login.
- [ ] Separar arquivos de teste:
  - [ ] JPG válido menor que 5MB.
  - [ ] PNG válido menor que 5MB.
  - [ ] Imagem maior que 5MB.
  - [ ] Arquivo `.txt` ou `.docx`.
  - [ ] PDF válido menor que 5MB.
  - [ ] PDF maior que 5MB.

## Fluxo 1 — Criar perfil sem anexo

Passos:

1. Acessar `/comprar-espaco-minisitio`.
2. Preencher os dados obrigatórios.
3. Não inserir imagem.
4. Salvar/criar o perfil.

Resultado esperado:

- [ ] Perfil criado sem crash.
- [ ] Sistema não exibe erro `Cannot read properties of undefined`.
- [ ] Perfil abre normalmente após a criação.

## Fluxo 2 — Criar perfil com arte 600x300

Passos:

1. Acessar `/comprar-espaco-minisitio`.
2. Inserir uma imagem JPG/PNG válida no campo “Inserir arte do perfil”.
3. Concluir o cadastro.

Resultado esperado:

- [ ] Upload é aceito.
- [ ] Preview/“Ver imagem” aparece.
- [ ] Perfil é salvo com a imagem.
- [ ] Imagem abre pela URL `/api/files/descImagem/{arquivo}`.
- [ ] Não há erro `replace` no console.

## Fluxo 3 — Editar perfil e trocar imagem

Passos:

1. Abrir um perfil existente no painel.
2. Remover a imagem atual.
3. Inserir nova imagem JPG/PNG válida.
4. Salvar.

Resultado esperado:

- [ ] Remoção não quebra a tela.
- [ ] Nova imagem é enviada.
- [ ] Nome salvo não começa com `undefined_`.
- [ ] Perfil atualizado mostra a nova imagem.

## Fluxo 4 — Imagem inválida por tipo

Passos:

1. Em qualquer campo de upload de imagem, tentar anexar `.txt`, `.docx` ou PDF.

Resultado esperado:

- [ ] Sistema rejeita o arquivo.
- [ ] Mensagem informa que apenas PNG/JPG são permitidos.
- [ ] Nenhum arquivo é salvo.
- [ ] Tela não trava.

## Fluxo 5 — Imagem inválida por tamanho

Passos:

1. Tentar anexar imagem maior que 5MB.

Resultado esperado:

- [ ] Sistema rejeita o arquivo.
- [ ] Mensagem informa limite de 5MB.
- [ ] Backend responde JSON, sem página HTML de erro.
- [ ] Tela continua utilizável.

## Fluxo 6 — Logo parceiro/desconto

Passos:

1. Acessar o módulo de gerenciar ID/desconto.
2. Inserir logo parceiro.
3. Salvar.

Resultado esperado:

- [ ] Upload é aceito.
- [ ] Arquivo é salvo em `logoParceiro`.
- [ ] Nome do arquivo usa código válido ou `new_`, nunca `undefined_`.
- [ ] Campo `newImg_*` é preenchido corretamente.

## Fluxo 7 — Institucional

Passos:

1. Acessar configuração institucional.
2. Trocar imagem/logotipo institucional.
3. Salvar.

Resultado esperado:

- [ ] Upload é aceito.
- [ ] Preview institucional atualiza.
- [ ] Arquivo é salvo em `adminInstitucional`.
- [ ] Tela não usa nome antigo do arquivo após upload.

## Fluxo 8 — Campanha com imagem

Passos:

1. Acessar fluxo de campanha.
2. Inserir imagem válida.
3. Salvar/avançar.

Resultado esperado:

- [ ] Upload é aceito.
- [ ] Estado de interação da campanha é marcado.
- [ ] Imagem permanece vinculada ao cadastro.

## Fluxo 9 — Cartão digital PDF

Passos:

1. Abrir edição de perfil ou campanha.
2. Inserir PDF válido menor que 5MB.
3. Clicar em “Ver cartão digital”.

Resultado esperado:

- [ ] Upload é aceito.
- [ ] PDF abre pela URL `/api/files/3/{arquivo}`.
- [ ] Campo `cartao_digital` recebe o nome retornado pelo backend.
- [ ] Não há erro de autenticação.

## Fluxo 10 — PDF inválido

Passos:

1. Tentar inserir arquivo não PDF no campo de cartão digital.
2. Tentar inserir PDF maior que 5MB.

Resultado esperado:

- [ ] Arquivo não PDF é rejeitado.
- [ ] PDF maior que 5MB é rejeitado.
- [ ] Mensagem informa claramente o motivo.
- [ ] Tela não trava.

## Regressão rápida

- [ ] Página inicial abre.
- [ ] Busca abre.
- [ ] Perfil público abre.
- [ ] Login funciona.
- [ ] Painel admin abre.
- [ ] Build do frontend passa.

## Observações de teste

| Data | Testador | Ambiente | Resultado | Observações |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
