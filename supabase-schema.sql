-- ================================================================
-- Unity Multas — Schema do Supabase (versão atualizada)
-- Cole e execute no SQL Editor do seu projeto Supabase
-- ================================================================

-- Se ainda não criou a tabela, rode o bloco abaixo completo.
-- Se já criou a versão anterior, vá para a seção MIGRAÇÃO no final.

-- ── Criação completa (tabela nova) ────────────────────────────
create table if not exists public.propostas (
  id                      text primary key,
  nome_cliente            text not null,
  ait                     text not null default '',
  tipo_infracao           text not null default 'Lei Seca — Recusa ao Teste',
  valor_essencial_pix     numeric(10, 2) not null default 0,
  valor_essencial_cartao  numeric(10, 2) not null default 0,
  valor_gestao_pix        numeric(10, 2) not null default 0,
  valor_gestao_cartao     numeric(10, 2) not null default 0,
  prazo_validade          date,
  observacoes             text,
  status                  text not null default 'enviada'
                            check (status in ('enviada', 'visualizada', 'em_analise', 'contratada', 'expirada')),
  created_at              timestamptz not null default now(),
  viewed_at               timestamptz,
  accepted_at             timestamptz,
  plano_aceito            text    -- ex: "essencial-pix", "essencial+gestao-cartao"
);

-- ── Row Level Security ────────────────────────────────────────
alter table public.propostas enable row level security;

create policy "propostas_public_read"
  on public.propostas for select
  using (true);

-- ── Índices ───────────────────────────────────────────────────
create index if not exists propostas_created_at_idx on public.propostas (created_at desc);
create index if not exists propostas_status_idx     on public.propostas (status);


-- ================================================================
-- MIGRAÇÃO — rode apenas se já tinha a tabela na versão anterior
-- ================================================================

-- Adicionar coluna mostrar_gestao (toggle do upsell no admin)
-- alter table public.propostas
--   add column if not exists mostrar_gestao boolean not null default false;

-- alter table public.propostas
--   add column if not exists valor_essencial_pix    numeric(10,2) not null default 0,
--   add column if not exists valor_essencial_cartao numeric(10,2) not null default 0,
--   add column if not exists valor_gestao_pix       numeric(10,2) not null default 0,
--   add column if not exists valor_gestao_cartao    numeric(10,2) not null default 0;

-- alter table public.propostas
--   drop column if exists valor_essencial,
--   drop column if exists valor_gestao,
--   drop column if exists link_pagamento_essencial,
--   drop column if exists link_pagamento_gestao;
