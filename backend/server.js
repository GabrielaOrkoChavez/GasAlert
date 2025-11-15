// CÓDIGO server.js COMPLETO E FINALIZADO

// -----------------------------
// Configuração Inicial
// -----------------------------
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
// Importa o pool de conexão do banco de dados (deve estar em './db.js')
const pool = require('./db');
const app = express();

// -----------------------------
// Middlewares
// -----------------------------
app.use(cors());
// Permite que o Express leia o corpo de requisições JSON
app.use(express.json());

// Servir frontend automaticamente (tudo dentro de /frontend)
// Assume que server.js está em 'backend' e o frontend está em '../frontend'
app.use(express.static(path.join(__dirname, '../frontend')));

// -----------------------------
// Rotas
// -----------------------------

// Rota principal — exibe index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Rotas de pedidos

// [1] ROTA POST: Cria um novo pedido (CREATE)
// Recebe dados do cliente, endereço, pagamento, itens e total.
app.post('/api/pedidos', async (req, res) => {
    try {
        const { cliente_nome, cliente_cpf, cliente_email, cliente_senha, endereco, pagamento, items, total } = req.body;
        
        // Validações básicas
        if (total === undefined || total === null) {
            return res.status(400).json({ error: 'Total da compra não fornecido.' });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Carrinho vazio' });
        }
        if (!cliente_senha) {
            return res.status(400).json({ error: 'A senha do cliente é obrigatória.' });
        }

        // Inserir pedido no banco de dados (status padrão 'Pendente')
        const result = await pool.query(
            `INSERT INTO pedidos (cliente_nome, cliente_cpf, cliente_email, cliente_senha, endereco, pagamento, items, total, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pendente') RETURNING id`,
            // Usa JSON.stringify para salvar os objetos JS (pagamento, items) como JSONB no Postgres
            [cliente_nome, cliente_cpf, cliente_email, cliente_senha, endereco, JSON.stringify(pagamento), JSON.stringify(items), total]
        );
        
        res.status(201).json({ message: 'Pedido salvo com sucesso', pedidoId: result.rows[0].id });
    } catch (error) {
        console.error('Erro ao registrar pedido:', error);
        res.status(500).json({ error: 'Erro ao registrar pedido. Verifique a conexão com o banco de dados.' });
    }
});

// [2] ROTA GET: Buscar pedidos pelo email E senha do cliente (Minhas Compras) (READ)
app.get('/api/pedidos/:cliente_email/:cliente_senha', async (req, res) => {
    try {
        const { cliente_email, cliente_senha } = req.params;
        if (!cliente_email || !cliente_senha) return res.status(400).json({ error: 'Email e senha do cliente são obrigatórios.' });

        // MODIFICADO: Seleciona 'items' como texto (items::text as items) para evitar problemas de escape do JSONB
        // Adiciona a cliente_senha na cláusula WHERE
        const result = await pool.query(
            `SELECT id, cliente_nome, cliente_cpf, cliente_email, endereco, pagamento,
             items::text as items, total, status, criado_em
             FROM pedidos WHERE cliente_email = $1 AND cliente_senha = $2 ORDER BY criado_em DESC`,
            [cliente_email, cliente_senha]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('ERRO AO BUSCAR PEDIDOS (DETALHE):', error.message || error);
        res.status(500).json({ error: 'Erro ao buscar pedidos. Verifique o servidor.' });
    }
});

// [3] ROTA PUT: Atualizar/Modificar pedido (UPDATE)
// Usado principalmente para alterar 'endereco' ou 'status'.
app.put('/api/pedidos/:id', async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const { endereco, pagamento, status } = req.body;

        const fields = [];
        const values = [];
        let paramIndex = 1; // Contador para placeholders do PostgreSQL ($1, $2, ...)

        // Constrói dinamicamente a query com base nos campos presentes no body
        if (endereco !== undefined) {
            fields.push(`endereco = $${paramIndex++}`);
            values.push(endereco);
        }
        if (pagamento !== undefined) {
            fields.push(`pagamento = $${paramIndex++}`);
            values.push(JSON.stringify(pagamento));
        }
        if (status !== undefined) {
            fields.push(`status = $${paramIndex++}`);
            values.push(status);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar fornecido.' });
        }

        // Adiciona o ID do pedido ao final dos valores para a cláusula WHERE
        values.push(pedidoId);
        
        // Constrói a query de UPDATE: Ex: UPDATE pedidos SET endereco = $1, status = $2 WHERE id = $3
        const query = `UPDATE pedidos SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id`;
        
        const result = await pool.query(query, values);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }
        
        res.status(200).json({ message: 'Pedido atualizado com sucesso', pedidoId });

    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        res.status(500).json({ error: 'Erro ao atualizar pedido' });
    }
});

// [4] ROTA DELETE: Remove um pedido do banco (DELETE)
app.delete('/api/pedidos/:id', async (req, res) => {
    try {
        const pedidoId = req.params.id;

        const result = await pool.query(
            `DELETE FROM pedidos WHERE id = $1`,
            [pedidoId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }
        
        res.status(200).json({ message: 'Pedido removido com sucesso', pedidoId });

    } catch (error) {
        console.error('Erro ao deletar pedido:', error);
        res.status(500).json({ error: 'Erro ao deletar pedido' });
    }
});


// -----------------------------
// Inicializar servidor
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));