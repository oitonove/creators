# OITONOVE — Portal do Criador

Área logada do criador parceiro: cupom pessoal, vendas atribuídas, comissões,
pagamentos, campanhas e regras da parceria.

## Arquitetura

Este app **não tem banco próprio**. Todo dado vem da API do CRM
(`crm.oitonove.com.br/api/creators/*`), escopado por criador:

```
oitonove.com.br/criadores      → candidatura pública (form → CRM)
crm.oitonove.com.br            → backoffice + API (dono do schema/banco)
portal.oitonove.com.br         → este app (cliente da API do CRM)
```

Auth: magic-link por email (token one-time, 15 min) → o CRM emite um bearer
HMAC de 30 dias → guardado aqui em cookie httpOnly (`creator_session`) e
repassado server-side em cada fetch. Nenhum CORS aberto no CRM; nenhuma
credencial de banco neste repo.

## Env

| Var | O quê |
|---|---|
| `CRM_API_BASE_URL` | Base da API do CRM (prod: `https://crm.oitonove.com.br`) |

## Dev

```bash
npm install
CRM_API_BASE_URL=http://localhost:3123 npm run dev
```

## Deploy

Vercel — push na `main` = produção.
