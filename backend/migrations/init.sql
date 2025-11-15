-- 1. APAGA a tabela (incluindo todos os dados e a estrutura)
DROP TABLE IF EXISTS pedidos;

-- 2. RECRIE a tabela usando o seu init.sql
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  cliente_nome TEXT,
  cliente_cpf TEXT,
  cliente_email TEXT,
  endereco TEXT,
  pagamento JSONB, -- JSONB
  items JSONB NOT NULL, -- JSONB
  total NUMERIC(12,2) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'Pendente' -- O campo que faltava
);

ALTER TABLE pedidos
ADD COLUMN cliente_senha VARCHAR(255);