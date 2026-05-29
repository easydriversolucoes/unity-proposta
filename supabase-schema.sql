-- ================================================================
-- Unity Multas — Schema completo e atualizado
-- Cole TUDO isso no SQL Editor do Supabase e clique em Run
-- ================================================================

create table if not exists public.propostas (
  id                      text primary key,
  nome_cliente            text not null,
  ait                     text not null default '',
  tipo_infracao           text not null default 'Lei Seca — Recusa ao Teste',
  valor_essencial_pix     numeric(10, 2) not null default 0,
  valor_essencial_cartao  numeric(10, 2) not null default 0,
  parcelas_essencial      int  not null default 1,
  valor_gestao_pix        numeric(10, 2) not null default 0,
  valor_gestao_cartao     numeric(10, 2) not null default 0,
  parcelas_gestao         int  not null default 1,
  mostrar_gestao          boolean not null default false,
  prazo_validade          date,
  observacoes             text,
  status                  text not null default 'enviada'
                            check (status in ('enviada', 'visualizada', 'em_analise', 'contratada', 'expirada')),
  created_at              timestamptz not null default now(),
  viewed_at               timestamptz,
  accepted_at             timestamptz,
  plano_aceito            text
);

alter table public.propostas enable row level security;

create policy "propostas_public_read"
  on public.propostas for select
  using (true);

create index if not exists propostas_created_at_idx on public.propostas (created_at desc);
create index if not exists propostas_status_idx     on public.propostas (status);
