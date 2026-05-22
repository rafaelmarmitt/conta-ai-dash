# Plano: Página de Administração `/admin`

## 1. Banco de dados (migration única)

**Sistema de roles (separado de `profiles`, padrão seguro):**
- Enum `app_role` (`admin`, `user`)
- Tabela `user_roles` (user_id, role, unique)
- Função `has_role(_user_id, _role)` security definer
- RLS: usuário vê seu próprio role; admins veem tudo
- Seed: insere meu `user_id` atual como `admin`

**Tabela `error_logs`:**
- Campos: `source` (gemini | database | webhook | edge_function), `severity` (info/warn/error), `message`, `context` (jsonb), `user_id` (opcional), `created_at`
- RLS: só admins leem (`has_role(auth.uid(),'admin')`); edge functions gravam via service role

**Tabela `broadcasts`:**
- Campos: `title`, `message`, `sent_by` (uuid), `recipients_count`, `status` (pending/sent/failed), `webhook_response` (jsonb), `created_at`
- RLS: só admins leem/inserem

**Políticas admin extras (acesso global aos dados):**
- Adicionar policies em `profiles`, `sales`, `expenses`, `products`, `sale_items`, `customers`, `whatsapp_messages`: "Admins view all" usando `has_role(auth.uid(),'admin')`

**Função RPC `admin_metrics()`** (security definer, valida admin internamente):
- Retorna JSON com: usuários ativos 7d, total mensagens, GMV, taxa onboarding, distribuição business_type, top 10 produtos, atividade por hora (últimos 30d)
- Evita N consultas client-side

## 2. Secret
- `N8N_BROADCAST_WEBHOOK_URL` (via `add_secret`) — usado pela edge function de broadcast

## 3. Edge function `admin-broadcast`
- Valida JWT + checa role admin via `has_role`
- Busca todos `profiles.phone` não nulos
- POST para `N8N_BROADCAST_WEBHOOK_URL` com `{ message, recipients: [{phone, name, business_name}] }`
- Grava registro em `broadcasts` com status e contagem
- Em erro, grava em `error_logs`

## 4. Frontend

**Roteamento (`App.tsx`):**
- Novo componente `AdminRoute` que estende `ProtectedRoute` e bloqueia quem não tem role admin (redireciona para `/dashboard` com toast)
- Rota `/admin` envolvida em `AdminRoute`

**Hook `useIsAdmin()`** — consulta `user_roles` do user atual, cacheia via react-query

**Página `src/pages/Admin.tsx`** — usa `DashboardLayout`, tabs:

1. **Visão Geral**
   - 4 StatCards (Usuários Ativos 7d, Mensagens, GMV, Taxa Onboarding)
   - Realtime: assinatura em `sales` recalcula GMV ao vivo

2. **Nichos**
   - Pizza: `business_type` (Recharts)
   - Barras horizontais: Top 10 produtos
   - Linha: atividade por hora (0-23h)

3. **Usuários**
   - Tabela: Empresa, WhatsApp, Tipo, Criado em, Badge engajamento
   - Badge calculado: Frequente (venda <2d), Iniciante (<14d cadastro), Em Risco (sem venda >5d)
   - Input de busca (nome/CNPJ) com debounce
   - Botão "Dossiê" abre Dialog com vendas + despesas + sales chart do usuário
   - Botão "Simular" → seta `localStorage.adminImpersonate = userId` e navega para `/dashboard` (banner de leitura no topo, hooks de dados respeitam o id)

4. **Broadcast**
   - Textarea + título + preview de contagem de destinatários
   - Botão "Enviar" chama `admin-broadcast` edge function, loading state, toast
   - Lista histórico de envios da tabela `broadcasts`

5. **Erros**
   - Tabela paginada de `error_logs` (últimos 100), filtro por source/severity
   - Realtime: novos erros aparecem no topo

**Link no `AppSidebar`:** item "Admin" só renderiza se `useIsAdmin()` for true (ícone Shield)

**Design:** paleta atual do projeto (verde água/lima já no `index.css`), Cards/Tabs/Table shadcn, gráficos Recharts coloridos com tokens semânticos.

## 5. Observações técnicas (resumo)

- Modo simulação é **somente leitura**: hooks de dados (`useSupabaseTable`) recebem prop `overrideUserId` que admins podem setar; mutações ficam desabilitadas quando `adminImpersonate` está ativo
- Realtime via canais Supabase em `sales` (GMV) e `error_logs` (monitor)
- Linter rodado após a migration; warnings de segurança serão corrigidos antes de prosseguir

## Entregáveis
1. Migration (roles + error_logs + broadcasts + policies admin + RPC)
2. Secret `N8N_BROADCAST_WEBHOOK_URL`
3. Edge function `admin-broadcast`
4. `AdminRoute`, `useIsAdmin`, página `/admin` com 5 tabs, modo simulação, link condicional no sidebar
