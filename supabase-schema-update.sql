-- ================================================================
-- Unity Multas — Migration: status aprovada + dados_contrato
-- Execute no SQL Editor do Supabase
-- ================================================================

-- 1. Adicionar coluna para dados do contrato
alter table public.propostas
  add column if not exists dados_contrato jsonb;

-- 2. Atualizar constraint de status para incluir "aprovada"
--    (precisa dropar e recriar pois ALTER CONSTRAINT não suporta CHECK no Postgres)
alter table public.propostas
  drop constraint if exists propostas_status_check;

alter table public.propostas
  add constraint propostas_status_check
    check (status in ('enviada', 'visualizada', 'em_analise', 'aprovada', 'contratada', 'expirada'));
