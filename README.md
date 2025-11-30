# GasAlert

Este é o repositório destinado ao site de nosso sistema de aprendizagem 😃

no site haverá:
- mudança de telas
- banco de dados após a realização da compra
- informações gerais destinadas ao aplicativo

O principal objetivo inicial do site era um anúncio para um futuro app de monitoramento de gás

Baixe o arquivo e crie dentro da pasta Backend

.env - exemplo:
```bash
PORT=3000
USER=seu-user
PASSWORD=sua-senha
DATABASE=seu-banco
DB_DIALECT=postgres
DB_PORT=5432
HOST=localhost

# Opcional — facilita conectar com uma única linha no código:
DATABASE_URL=postgresql://postgres:senai@localhost:5432/loja_db
````
Instalar dependencias
```bash
npm install express pg cors dotenv
````

Crie no pgAdmin, etc o banco de dados - na pasta backend/migrations tem tudo já definido

Ele estará rodando na porta 
http://localhost:3000/


