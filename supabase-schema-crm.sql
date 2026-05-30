-- ================================================================
-- Unity Multas — CRM + Área do Cliente
-- Execute no SQL Editor do Supabase após o supabase-schema.sql
-- ================================================================

-- Clientes (leads do CRM)
create table if not exists public.clientes (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  telefone        text,
  whatsapp        text,
  cpf             text,
  placa           text,
  orgao           text,
  ait             text,
  tipo_infracao   text,
  origem          text,
  tem_suspensao   boolean not null default false,
  etapa           text not null default 'novo_contato',
  followup_data   date,
  followup_contagem int not null default 0,
  followup_canal  text,
  proposta_id     text references public.propostas(id),
  created_at      timestamptz not null default now()
);

create index if not exists clientes_etapa_idx     on public.clientes (etapa);
create index if not exists clientes_cpf_idx       on public.clientes (cpf);
create index if not exists clientes_followup_idx  on public.clientes (followup_data) where etapa = 'aguardando_resposta';

-- Histórico de atividades
create table if not exists public.atividades (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references public.clientes(id) on delete cascade,
  texto       text not null,
  tipo        text not null default 'nota',
  created_at  timestamptz not null default now()
);

create index if not exists atividades_cliente_idx on public.atividades (cliente_id, created_at desc);

-- Processos de recurso (até 2 por cliente: infração e suspensão)
create table if not exists public.processos_recurso (
  id                  uuid primary key default gen_random_uuid(),
  cliente_id          uuid not null references public.clientes(id) on delete cascade,
  tipo                text not null check (tipo in ('infracao', 'suspensao')),
  fase_atual          text not null default 'defesa_previa'
                        check (fase_atual in ('defesa_previa', 'jari', 'cetran')),
  status              text not null default 'em_andamento'
                        check (status in ('em_andamento', 'aguardando_resultado', 'deferido', 'indeferido')),
  numero_protocolo    text,
  data_protocolo      date,
  created_at          timestamptz not null default now()
);

create index if not exists processos_cliente_idx on public.processos_recurso (cliente_id);

-- Histórico de fases (resultados informados)
create table if not exists public.fases_recurso (
  id            uuid primary key default gen_random_uuid(),
  processo_id   uuid not null references public.processos_recurso(id) on delete cascade,
  fase          text not null check (fase in ('defesa_previa', 'jari', 'cetran')),
  resultado     text check (resultado in ('deferido', 'indeferido')),
  informado_por text not null default 'cliente' check (informado_por in ('cliente', 'admin')),
  notas         text,
  created_at    timestamptz not null default now()
);

create index if not exists fases_processo_idx on public.fases_recurso (processo_id);

-- Tarefas do Kanban de execução
create table if not exists public.tarefas_execucao (
  id                  uuid primary key default gen_random_uuid(),
  cliente_id          uuid references public.clientes(id),
  processo_id         uuid references public.processos_recurso(id),
  fase                text not null check (fase in ('defesa_previa', 'jari', 'cetran')),
  etapa               text not null default 'a_redigir'
                        check (etapa in ('a_redigir', 'em_redigicao', 'aguardando_protocolo', 'protocolado')),
  status              text not null default 'ativa' check (status in ('ativa', 'arquivada')),
  numero_protocolo    text,
  prazo               date,
  notas               text,
  created_at          timestamptz not null default now(),
  arquivada_at        timestamptz
);

create index if not exists tarefas_status_etapa_idx on public.tarefas_execucao (status, etapa);
create index if not exists tarefas_cliente_idx       on public.tarefas_execucao (cliente_id);
