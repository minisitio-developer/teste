================================================================================
                    GUIA DE SEGURANÇA - MINISITIO
                         Recomendações Críticas
================================================================================

## 📋 ÍNDICE
1. CORS e Origem de Requisições
2. Certificados SSL/HTTPS
3. Autenticação e JWT
4. Proteção de Dados Sensíveis
5. Validação de Entrada
6. Rate Limiting
7. Headers de Segurança
8. Segredos e Chaves API

================================================================================
## 1. CORS (Cross-Origin Resource Sharing)
================================================================================

❌ PROBLEMA ANTERIOR:
   - CORS configurado com "*" (aceita requisições de qualquer origem)
   - Isso permite ataques CSRF, XSRF e exposição de dados sensíveis

✅ SOLUÇÃO IMPLEMENTADA:
   - Arquivo: back/index.js
   - CORS agora restrito a domínios específicos
   - Variável de ambiente: ALLOWED_ORIGINS
   - Suporta credenciais apenas de origens confiáveis

📝 PRÓXIMAS AÇÕES:
   1. Criar arquivo .env com domínios específicos:
      ALLOWED_ORIGINS=https://meufrontend.com,https://admin.meufrontend.com
   
   2. Para cada ambiente (dev, staging, prod), use diferentes listas:
      - Desenvolvimento: http://localhost:3000
      - Produção: https://meufrontend.com (sem localhost)
   
   3. Certificar que o arquivo .env está no .gitignore (nunca versionar segredos)

================================================================================
## 2. CERTIFICADOS SSL/HTTPS
================================================================================

❌ PROBLEMA ANTERIOR:
   - Certificados comentados no código
   - Produção usando HTTP (não-criptografado)
   - Dados sensíveis transmitidos em texto plano

✅ SOLUÇÃO IMPLEMENTADA:
   - Certificados desativados em desenvolvimento (mantém HTTP)
   - Código preparado para HTTPS em produção (comentado)
   - Instruções claras de como ativar

📝 COMO ATIVAR HTTPS EM PRODUÇÃO:

   1. Obter certificados SSL válidos:
      - Let's Encrypt (gratuito): https://letsencrypt.org
      - Comando: certbot certonly --standalone -d meufrontend.com
      - Resultado: /etc/letsencrypt/live/meufrontend.com/
   
   2. Copiar certificados para a pasta certificados/:
      - cp /etc/letsencrypt/live/meufrontend.com/privkey.pem ./certificados/code.key
      - cp /etc/letsencrypt/live/meufrontend.com/fullchain.pem ./certificados/code.crt
   
   3. Descomenta linhas no back/index.js:
      const https = require('https');
      const options = {
          key: fs.readFileSync("./certificados/code.key"),
          cert: fs.readFileSync("./certificados/code.crt"),
      };
      const server = https.createServer(options, app);
   
   4. Atualizar .env:
      NODE_ENV=production
      SSL_KEY_PATH=./certificados/code.key
      SSL_CERT_PATH=./certificados/code.crt

================================================================================
## 3. AUTENTICAÇÃO E JWT
================================================================================

✅ RECOMENDAÇÕES IMPLEMENTADAS:

   1. JWT Token:
      - Usar chave secreta forte (64+ caracteres aleatórios)
      - Definir tempo de expiração apropriado (ex: 24h)
      - Armazenar em variável de ambiente: JWT_SECRET

   2. Exemplo .env seguro:
      JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f
      JWT_EXPIRE=24h

   3. Armazenamento do Token (Frontend):
      - Use SessionStorage (não persiste após fechar navegador)
      - Evitar LocalStorage (vulnerável a XSS)
      - Código recomendado:
        sessionStorage.setItem('userTokenAccess', token);

   4. Refresh Tokens (Recomendado):
      - Implementar tokens de curta duração (15 min)
      - Refresh tokens de longa duração (7 dias)
      - Armazenar refresh token em secure HTTP-only cookie

================================================================================
## 4. PROTEÇÃO DE DADOS SENSÍVEIS
================================================================================

❌ NÃO FAÇA:
   - Commitar .env no repositório
   - Expor chaves API em código fonte
   - Logar informações sensíveis (senhas, tokens, CPF, CNPJ)
   - Usar credenciais padrão (admin/admin)

✅ FAÇA:
   1. Criar arquivo .gitignore:
      .env
      .env.local
      .env.*.local
      node_modules/
      public/upload/
      logs/

   2. Usar .env.example como template:
      - Versione .env.example com valores placeholder
      - Documentar cada variável necessária
      - Facilitar onboarding de novos devs

   3. Validação de entrada:
      - Sanitizar todos os inputs do usuário
      - Validar tipos de dados
      - Usar bibliotecas: joi, yup, validator.js

   4. Senhas no banco de dados:
      - Sempre usar hash (bcrypt, argon2)
      - Nunca armazenar em texto plano
      - Usar salt com 10+ rounds

================================================================================
## 5. VALIDAÇÃO DE ENTRADA
================================================================================

✅ RECOMENDAÇÕES:

   1. Validar tipos:
      - Não confiar em dados do cliente
      - Validar no servidor (sempre)
      - Exemplo:
        if (typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({ error: 'Email inválido' });
        }

   2. Sanitizar dados:
      - Remover caracteres perigosos
      - Usar express-validator ou joi
      - Exemplo:
        const { body, validationResult } = require('express-validator');
        [body('email').isEmail(), body('password').isLength({ min: 8 })]

   3. Limitar tamanho de requisição:
      app.use(express.json({ limit: '10mb' }));
      app.use(express.urlencoded({ limit: '10mb' }));

================================================================================
## 6. RATE LIMITING
================================================================================

❌ VULNERÁVEL A:
   - Brute force (tentar múltiplas senhas)
   - DDoS (bombardear com requisições)
   - Scraping (coletar dados em massa)

✅ SOLUÇÃO RECOMENDADA:

   Instalar express-rate-limit:
   npm install express-rate-limit redis

   Implementar no back/index.js:
   
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
       windowMs: 15 * 60 * 1000, // 15 minutos
       max: 100, // máximo 100 requisições
       message: 'Muitas requisições, tente novamente mais tarde'
   });
   
   app.use(limiter);
   
   // Rate limit mais restritivo para login
   const loginLimiter = rateLimit({
       windowMs: 15 * 60 * 1000,
       max: 5, // apenas 5 tentativas
       skipSuccessfulRequests: true
   });
   
   app.post('/entrar', loginLimiter, (req, res) => { ... });

================================================================================
## 7. HEADERS DE SEGURANÇA
================================================================================

✅ RECOMENDADO: Instalar helmet.js

   npm install helmet

   Usar no back/index.js:
   
   const helmet = require('helmet');
   app.use(helmet());
   
   Isso configura automaticamente:
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Strict-Transport-Security (HSTS)
   - Content-Security-Policy (CSP)

================================================================================
## 8. SEGREDOS E CHAVES API
================================================================================

✅ WORKFLOW SEGURO:

   1. Desenvolvimento Local:
      - Criar arquivo .env baseado em .env.example
      - Usar valores fictícios/teste
      - Nunca commitar .env

   2. Staging/Produção:
      - Usar variáveis de ambiente do servidor
      - Heroku: heroku config:set CHAVE=valor
      - AWS: Parameter Store ou Secrets Manager
      - Docker: usar docker-compose.yml com .env (gitignore)

   3. Rotação de Chaves:
      - Trocar JWT_SECRET regularmente (a cada 90 dias)
      - Atualizar chaves de API terceiros
      - Usar versionamento de secrets (Se possível)

   4. Auditoria:
      - Logar acesso a recursos sensíveis
      - Monitorar tentativas de autenticação
      - Alertar sobre atividades suspeitas

================================================================================
## 9. CHECKLIST DE SEGURANÇA PRÉ-PUBLICAÇÃO
================================================================================

✅ Marque conforme completa:

□ CORS configurado com domínios específicos (não "*")
□ Certificado SSL obtido e testado (para HTTPS)
□ JWT_SECRET definido com 64+ caracteres aleatórios
□ .env configurado e adicionado ao .gitignore
□ .env.example versionado com valores placeholder
□ Rate limiting implementado para login
□ Helmet.js instalado e ativo
□ Senhas com hash bcrypt
□ Validação de entrada em todos os endpoints
□ HTTPS redirecionado (HTTP → HTTPS)
□ Headers de segurança configurados
□ Logs de erro não expõem informações sensíveis
□ Base de dados com backup automático
□ Monitoramento e alertas ativados
□ Teste de penetração básico realizado
□ Política de privacidade e termos de uso

================================================================================
## 10. RECURSOS ÚTEIS
================================================================================

📚 Documentação:
- OWASP Top 10: https://owasp.org/Top10
- Node.js Security: https://nodejs.org/en/docs/guides/security/
- Express.js Security: https://expressjs.com/en/advanced/best-practice-security.html

🔧 Ferramentas:
- npm audit: verificar dependências vulneráveis
- Snyk: https://snyk.io (scanning de vulnerabilidades)
- SonarQube: análise estática de código

🛡️ Certificados:
- Let's Encrypt: https://letsencrypt.org
- ZeroSSL: https://zerossl.com (gratuito)

================================================================================
                        FIM DO GUIA DE SEGURANÇA
================================================================================
Última atualização: 26 de Maio de 2026
Próxima revisão recomendada: 26 de Agosto de 2026 (3 meses)
