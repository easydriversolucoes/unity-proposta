-- ================================================================
-- Unity Multas — Schema do Supabase
-- Cole e execute no SQL Editor do seu projeto Supabase
-- ================================================================

-- Habilita extensão para UUID (já disponível na maioria dos projetos)
create extension if not exists "pgcrypto";

-- ── Tabela principal ──────────────────────────────────────────
create table if not exists public.propostas (
  id                         text primary key,
  nome_cliente               text not null,
  ait                        text not null default '',
  tipo_infracao              text not null default 'Lei Seca',
  valor_essencial            numeric(10, 2) not null default 0,
  valor_gestao               numeric(10, 2) not null default 0,
  link_pagamento_essencial   text,
  link_pagamento_gestao      text,
  prazo_validade             date,
  observacoes                text,
  status                     text not null default 'enviada'
                               check (status in ('enviada', 'visualizada', 'em_analise', 'contratada', 'expirada')),
  created_at                 timestamptz not null default now(),
  viewed_at                  timestamptz,
  accepted_at                timestamptz,
  plano_aceito               text
);

-- ── Row Level Security ────────────────────────────────────────
alter table public.propostas enable row level security;

-- Qualquer um pode LER uma proposta (necessário para a rota /p/[id])
-- O service key bypassa RLS automaticamente — estas políticas cobrem o anon key
create policy "propostas_public_read"
  on public.propostas for select
  using (true);

-- O service key já tem acesso total. Se quiser permitir insert/update
-- via anon key em algum momento, adicione políticas aqui.
-- Por ora, todas as operações de escrita usam o service key (server-side).

-- ── Índices ───────────────────────────────────────────────────
create index if not exists propostas_created_at_idx on public.propostas (created_at desc);
create index if not exists propostas_status_idx     on public.propostas (status);
