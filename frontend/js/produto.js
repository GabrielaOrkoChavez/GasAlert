// produtos hardcoded (must match ids used in index.html links)
const produtos = [
  {
    id: 1,
    nome: 'Sensor MQ-2 de Gás',
    preco: 20.0,
    descricao: 'Detectar a presença de gases inflamáveis e fumaça em ambientes.',
    imagem: './imagens/sensor1.jpg'
  },
  {
    id: 2,
    nome: 'Sensor MQ-9 de Gás',
    preco: 45.0,
    descricao: 'Detector de gás MQ-9',
    imagem: './imagens/sensor2.jpg'
  },
  {
    id: 3,
    nome: 'Sensor MQ-7 de Gás',
    preco: 45.0,
    descricao: 'Detector de gás MQ-7',
    imagem: './imagens/sensor3.webp'
  },
  {
    id: 4,
    nome: 'Sensor MQ-136 de Gás',
    preco: 109.0,
    descricao: 'Detector de gás MQ-136',
    imagem: './imagens/sensor4.jpg'
  },
  {
    id: 5,
    nome: 'Sensor MQ-3 de Gás',
    preco: 25.0,
    descricao: 'Detector de gás MQ-3',
    imagem: './imagens/sensor5.jpg'
  },
  {
    id: 6,
    nome: 'Sensor MQ-6 de Gás',
    preco: 40.0,
    descricao: 'Detector de gás MQ-6',
    imagem: './imagens/sensor6.jpg'
  },
];

// Pega ID da URL
const params = new URLSearchParams(window.location.search);
const produtoId = parseInt(params.get('id'));
const produto = produtos.find(p => p.id === produtoId);

if (!produto) {
 const el = document.getElementById('produto-detalhe');
 if(el) el.innerHTML = '<p>Produto não encontrado.</p>';
} else {
 const el = document.getElementById('produto-detalhe');
 if(el) el.innerHTML = `
  <div class="produto-info">
   <img class="sensorproduto" src="${produto.imagem}" alt="${produto.nome}">
   <div>
    <h2>${produto.nome}</h2>
    <p>${produto.descricao}</p>
    <div class="price">R$ ${produto.preco.toFixed(2)}</div>
    
     <div class="botoes-compra">
     <button class="btn" onclick="comprarAgora('${produto.nome}', ${produto.preco})">Comprar agora</button>
     <button class="btn1" onclick="adicionarAoCarrinho('${produto.nome}', ${produto.preco})">Adicionar ao carrinho</button>
    </div>
   </div>
  </div>
 `;
}