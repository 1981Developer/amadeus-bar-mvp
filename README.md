
# Amadeus Bar — MVP Sprint 2
MVP estático (HTML/JS/CSS) sem backend, usando **LocalStorage** para persistência local.
Abra **index.html** no navegador e use o botão **"Carregar dados de exemplo"** em *Estoque* para popular.

## Módulos
- **Estoque**: CRUD de produtos, validade e alertas (⚠) próximos de expirar.
- **Vendas/Comandas**: seleção de produto, baixa automática em estoque, registro de venda e geração automática de **entrada** no caixa.
- **Fluxo de Caixa**: entradas e saídas manuais, filtro e saldo consolidado.
- **Agenda**: cadastro e listagem de eventos.
- **Relatórios**: total de vendas, top produtos e saldo de caixa por período, exportação CSV.

## Prints sugeridos
1. Estoque com dados de exemplo e alerta de validade.
2. Registro de Venda e tabela de vendas.
3. Fluxo de Caixa com saldo.
4. Agenda com um evento criado.
5. Relatórios com período aplicado e indicadores + exportação CSV.

## Publicação rápida (GitHub Pages)
1) Crie um repositório público chamado `amadeus-bar-mvp`.
2) Envie estes 4 arquivos na raiz do repositório.
3) Vá em **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
4) Em **Branch**, selecione `main` e a pasta `/ (root)` → **Save**.
5) A URL ficará como `https://seu-usuario.github.io/amadeus-bar-mvp/`.

## Observações
- Este MVP evidencia execução e resultados da Sprint 2.
- Pode ser evoluído para Nuxt/SQLite/Azure numa próxima sprint.
