# OITONOVE - Portal do Criador

Área logada do criador parceiro: cupom pessoal, vendas atribuídas, comissões,
pagamentos, campanhas e regras da parceria.

## Arquitetura

Este app **não tem banco próprio**. Todo dado vem da API do CRM
(`crm.oitonove.com.br/api/creators/*`), escopado por criador:

```
oitonove.com.br/criadores      -> candidatura pública (form -> CRM)
crm.oitonove.com.br            -> backoffice + API (dono do schema/banco)
criadores.oitonove.com.br      -> este app (cliente da API do CRM)
```

Auth: magic-link por email (token one-time, 15 min) -> o CRM emite um bearer
HMAC de 30 dias -> guardado aqui em cookie httpOnly (`creator_session`) e
repassado server-side em cada fetch. Nenhum CORS aberto no CRM; nenhuma
credencial de banco neste repo.

## Env

| Var | O que |
|---|---|
| `CRM_API_BASE_URL` | Base da API do CRM (prod: `https://crm.oitonove.com.br`) |
| `CRM_USE_MOCK_AUTH` | Se `true`, habilita login local com dados mockados |
| `MOCK_CREATOR_EMAIL` | Email da conta local de teste |
| `MOCK_CREATOR_PASSWORD` | Senha da conta local de teste |

## Dev

```bash
npm install
CRM_API_BASE_URL=http://localhost:3123 npm run dev
```

Para subir o portal sem CRM local, rode com mock auth:

```bash
CRM_USE_MOCK_AUTH=true npm run dev
```

Credenciais padrão do modo local:

```text
email: teste@oitonove.com.br
senha: teste1234
```

## Deploy

Vercel - push na `main` = produção.
