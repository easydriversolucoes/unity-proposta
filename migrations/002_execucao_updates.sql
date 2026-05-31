-- Run this migration in your Supabase SQL editor

-- 1. New fields in tarefas_execucao
ALTER TABLE tarefas_execucao
  ADD COLUMN IF NOT EXISTS urgente            boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS responsavel        text        NOT NULL DEFAULT 'Pablo',
  ADD COLUMN IF NOT EXISTS data_agendamento_envio      timestamptz,
  ADD COLUMN IF NOT EXISTS data_agendamento_protocolo  date,
  ADD COLUMN IF NOT EXISTS protocolado_por    text;

-- 2. Rename existing "em_redigicao" records to the new column name
UPDATE tarefas_execucao
  SET etapa = 'envio_agendado'
  WHERE etapa = 'em_redigicao';

-- 3. New field in clientes: timestamp of payment registration
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS pagamento_realizado_at timestamptz;

-- 4. If there is a CHECK constraint on tarefas_execucao.etapa, update it:
--    (Run the query below first to check: SELECT constraint_name, check_clause
--     FROM information_schema.check_constraints
--     WHERE constraint_name LIKE '%tarefas%etapa%';)
--
-- If a constraint exists, drop it and recreate:
-- ALTER TABLE tarefas_execucao DROP CONSTRAINT <constraint_name>;
-- ALTER TABLE tarefas_execucao ADD CONSTRAINT tarefas_execucao_etapa_check
--   CHECK (etapa IN ('a_redigir','envio_agendado','documentos_solicitados','aguardando_protocolo','protocolado'));
