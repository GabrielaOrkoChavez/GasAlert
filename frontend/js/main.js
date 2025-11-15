// CÓDIGO main.js COMPLETO E FINALIZADO COM PERSISTÊNCIA (localStorage)

const API = "http://localhost:3000/api";
let cart = []; // Variável global do carrinho

// --- FUNÇÕES DE PERSISTÊNCIA ---

// 1. Carrega o carrinho do localStorage ao carregar a página
function loadCart() {
    const savedCart = localStorage.getItem('gasAlertCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error("Erro ao carregar o carrinho do localStorage:", e);
            cart = [];
        }
    }
}

// 2. Salva o carrinho no localStorage sempre que ele é modificado
function saveCart() {
    localStorage.setItem('gasAlertCart', JSON.stringify(cart));
}


// --- FUNÇÕES DO CARRINHO ---

function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = cart.reduce((s,i)=>s+i.quantidade,0);
    }
}

function renderCart(){
    const container = document.getElementById('cart-items');
    if(!container) return;
    container.innerHTML = '';
    cart.forEach((item,index)=>{
        container.innerHTML += `
            <div class="cart-item">
                <span style="flex:1">${item.nome}</span>
                <span>R$ ${item.preco.toFixed(2)}</span>
                <button onclick="alterarQuantidade(${index},-1)">-</button>
                <span style="width:36px;text-align:center">${item.quantidade}</span>
                <button onclick="alterarQuantidade(${index},1)">+</button>
                <button onclick="removerDoCarrinho(${index})">Remover</button>
            </div>
        `;
    });
    const totalEl = document.getElementById('cart-total');
    if(totalEl) totalEl.textContent =
        'Total: R$ ' + cart.reduce((s,i)=>s+i.preco*i.quantidade,0).toFixed(2);
    
    updateCartCount();
    saveCart(); // SALVA SEMPRE QUE RENDERIZA/MUDA O CARRINHO
}

// Global para ser acessível via onclick no HTML/JS
window.adicionarAoCarrinho = function(nome, preco){
    const existing = cart.find(p=>p.nome===nome);
    if(existing) existing.quantidade++;
    else cart.push({nome, preco: Number(preco), quantidade:1});
    renderCart();
}

window.alterarQuantidade = function(index, delta){
    cart[index].quantidade += delta;
    if(cart[index].quantidade <= 0) cart.splice(index,1);
    renderCart();
}

window.removerDoCarrinho = function(index){
    cart.splice(index,1);
    renderCart();
}

// Limpa o carrinho, adiciona o item e abre o modal (compra imediata)
window.comprarAgora = function(nome, preco){
    cart = [{nome, preco: Number(preco), quantidade:1}];
    renderCart();
    showCartModal();
}

// --- LÓGICA DE MODAIS E CHECKOUT ---

const cartModal = document.getElementById('cart-modal');
const openCartBtn = document.getElementById('open-cart-btn');
if(openCartBtn) openCartBtn.addEventListener('click', ()=>cartModal.setAttribute('aria-hidden','false'));
const closeCartBtn = document.getElementById('close-cart-modal');
if(closeCartBtn) closeCartBtn.addEventListener('click', ()=>cartModal.setAttribute('aria-hidden','true'));

const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutBtn = document.getElementById('close-checkout-modal');
if(closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', ()=>checkoutModal.setAttribute('aria-hidden','true'));

function showCartModal() {
    cartModal.setAttribute('aria-hidden', 'false');
}

const checkoutBtn = document.getElementById('checkout-btn');
if(checkoutBtn) checkoutBtn.addEventListener('click', ()=>{
    if (cart.length === 0) {
        alert("Seu carrinho está vazio. Adicione um produto primeiro.");
        return;
    }
    checkoutModal.setAttribute('aria-hidden','false');
    const summary = document.getElementById('checkout-summary');
    if(summary) summary.innerHTML =
        cart.map(p=>`${p.nome} - ${p.quantidade} x R$ ${p.preco.toFixed(2)}`).join('<br>')+
        `<br><strong>Total: R$ ${cart.reduce((s,p)=>s+p.preco*p.quantidade,0).toFixed(2)}</strong>`;
});

// [C] CREATE / POST: Enviar pedido para backend
const checkoutForm = document.getElementById('checkout-form');
if(checkoutForm) checkoutForm.addEventListener('submit', async e=>{
    e.preventDefault();
    const cliente_nome = document.getElementById('cliente_nome').value;
    const cliente_cpf = document.getElementById('cliente_cpf').value;
    const cliente_email = document.getElementById('cliente_email').value;
    const cliente_senha = document.getElementById('cliente_senha').value; // NOVO: Captura a senha
    const endereco = document.getElementById('endereco').value;
    const pagamento_metodo = document.getElementById('pagamento_metodo').value;

    const total = cart.reduce((s,p)=>s+p.preco*p.quantidade,0);

    try{
        const res = await fetch(`${API}/pedidos`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                cliente_nome, cliente_cpf, cliente_email, cliente_senha, endereco, // Inclui a senha no body
                pagamento:{metodo:pagamento_metodo}, items:cart, total
            })
        });
        const data = await res.json();
        if(res.ok){
            alert('Pedido registrado com sucesso!');
            cart=[];
            renderCart();
            cartModal.setAttribute('aria-hidden','true');
            checkoutModal.setAttribute('aria-hidden','true');
            // Preenche e tenta buscar o pedido na aba "Minhas Compras"
            if(document.getElementById('search-email')) {
                document.getElementById('search-email').value = cliente_email;
                document.getElementById('search-senha').value = cliente_senha; // NOVO: Preenche a senha
                document.getElementById('open-my-orders-btn').click();
                setTimeout(() => document.getElementById('search-orders-btn').click(), 100);
            }
        } else alert('Erro: '+data.error);
    } catch(err){console.error(err); alert('Erro ao enviar pedido');}
});


// ---------------------------------------------
// Lógica do Modal Minhas Compras (R, U, D)
// ---------------------------------------------
const myOrdersModal = document.getElementById('my-orders-modal');
const openOrdersBtn = document.getElementById('open-my-orders-btn');
const closeOrdersBtn = document.getElementById('close-my-orders-modal');
const searchOrdersBtn = document.getElementById('search-orders-btn');
const ordersList = document.getElementById('orders-list');
const searchEmailInput = document.getElementById('search-email');
const searchSenhaInput = document.getElementById('search-senha'); // NOVO: Input da senha

if (openOrdersBtn) openOrdersBtn.addEventListener('click', () => myOrdersModal.setAttribute('aria-hidden', 'false'));
if (closeOrdersBtn) closeOrdersBtn.addEventListener('click', () => myOrdersModal.setAttribute('aria-hidden', 'true'));

// [R] READ / GET: Lógica de Busca de Pedidos
if (searchOrdersBtn) searchOrdersBtn.addEventListener('click', async () => {
    const email = searchEmailInput.value;
    const senha = searchSenhaInput.value; // NOVO: Captura a senha
    if (!email || !senha) { // NOVO: Valida email E senha
        alert("Por favor, digite seu e-mail e sua senha.");
        return;
    }
    
    ordersList.innerHTML = '<p>Buscando...</p>';
    
    try {
        // NOVO: Altera a rota para incluir a senha
        const res = await fetch(`${API}/pedidos/${email}/${senha}`);
        const pedidos = await res.json();

        if (res.ok && pedidos.length > 0) {
            ordersList.innerHTML = pedidos.map(pedido => {
                
                let items;
                try {
                    items = JSON.parse(pedido.items);
                } catch (e) {
                     console.error("Falha ao analisar JSON de itens do pedido:", pedido.items, e);
                     items = [{ nome: 'Erro de Leitura de Item', quantidade: 1, preco: 0 }];
                }

                const itemsSummary = items.map(item => `${item.nome} (${item.quantidade})`).join(', ');
                
                const canEditOrDelete = pedido.status === 'Pendente';
                
                let actionButtons = '';
                if (canEditOrDelete) {
                    // BOTÃO DE EDIÇÃO (PUT)
                    actionButtons += `<button class="btn" onclick="editarEndereco(${pedido.id}, '${pedido.endereco.replace(/'/g, "\\'")}')" style="background-color: #3f51b5; margin-right: 10px;">Editar Endereço</button>`;
                    // BOTÃO DE EXCLUSÃO (DELETE)
                    actionButtons += `<button class="btn" onclick="excluirPedido(${pedido.id})" style="background-color: #f44336;">Excluir Pedido</button>`;
                } else {
                    actionButtons = `<span style="color: #f44336; font-weight: bold;">Status: ${pedido.status}</span>`;
                }
                
                return `
                    <div class="card" style="margin-bottom: 10px; padding: 10px; border: 1px solid #ddd;">
                        <h4>Criado em: ${new Date(pedido.criado_em).toLocaleDateString('pt-BR')}</h4>
                        <p class="small" style="margin: 5px 0;">Itens: ${itemsSummary}</p>
                        <p class="price">Total: R$ ${parseFloat(pedido.total).toFixed(2)}</p>
                        <p class="small">Endereço Atual: <strong>${pedido.endereco}</strong></p>
                        <div style="margin-top: 10px;">${actionButtons}</div>
                    </div>
                `;
            }).join('');
        } else {
            // Mensagem de erro unificada para não revelar se o erro é o email ou a senha
            ordersList.innerHTML = '<p>E-mail ou senha incorretos, ou nenhum pedido encontrado.</p>';
        }
    } catch (err) {
        console.error(err);
        ordersList.innerHTML = '<p>Erro ao buscar pedidos. Verifique o servidor.</p>';
    }
});

// [U] UPDATE / PUT: Função de Edição (Mudar Endereço)
window.editarEndereco = async function(pedidoId, enderecoAtual) {
    const novoEndereco = prompt(`Editar endereço do Pedido:\n\nEndereço atual: ${enderecoAtual}\n\nDigite o novo endereço:`);

    if (!novoEndereco || novoEndereco === enderecoAtual) return;

    try {
        const res = await fetch(`${API}/pedidos/${pedidoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endereco: novoEndereco })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            alert('Endereço do Pedido atualizado com sucesso!');
            searchOrdersBtn.click();
        } else {
            alert('Erro ao editar: ' + data.error);
        }
    } catch (err) {
        console.error(err);
        alert('Erro de conexão ao editar pedido.');
    }
};


// [D] DELETE: Função de Exclusão
window.excluirPedido = async function(pedidoId) {
    if (!confirm('Tem certeza que deseja EXCLUIR o Pedido do sistema? Essa ação não pode ser desfeita.')) return;

    try {
        const res = await fetch(`${API}/pedidos/${pedidoId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        
        const data = await res.json();
        
        if (res.ok) {
            alert('Pedido excluído com sucesso!');
            searchOrdersBtn.click();
        } else {
            alert('Erro ao excluir: ' + data.error);
        }
    } catch (err) {
        console.error(err);
        alert('Erro de conexão ao excluir pedido.');
    }
};

document.addEventListener('DOMContentLoaded', ()=>{
    loadCart(); // 3. CARREGA O CARRINHO AO INICIAR A PÁGINA
    renderCart();
});