const express = require('express'); 
const app = express(); 

app.use(express.json()); // Middleware para interpretar JSON no corpo das requisições

const listaPedidos = []; // Array para armazenar os pedidos

// Função para validar se um dado está preenchido
function validarDados(dado, res) {
    if (dado == null) {
        return res.status(400).json({ mensagem: "Necessário preencher todos os campos." });
    }
}

// Função para validar se um dado é do tipo booleano
function validarBoolean(dado, res) {
    if (typeof dado !== 'boolean') {
        return res.status(400).json({ mensagem: "Campo suporta apenas valores do tipo boolean." });
    }
}

// Função para validar se um dado é do tipo number e maior ou igual a zero
function validarNumber(dado, res) {
    if (typeof dado !== 'number' || dado < 0) {
        return res.status(400).json({ mensagem: "O campo suporta apenas valores do tipo number maior ou igual a zero." });
    }
}

// Função para validar a forma de pagamento
function validarFormaDePagamento(forma_pagamento, res) {
    if (forma_pagamento !== "cartao" && forma_pagamento !== "dinheiro" && forma_pagamento !== "pix") {
        return res.status(400).json({ mensagem: "Forma de Pagamento Inválida." });
    }
}

function validarStatusPedido(status_pedido,res){
    if(status_pedido !== "aceito" && status_pedido !== "pendente" && status_pedido !== "cancelado"){
        return res.status(400).json({message:"Status do pedido inválido! deve ser preenchido com 'aceito','pendente', 'cancelado'"}); 
    }
}
// Rota para criar um novo pedido
app.post('/pedidos', (req, res) => {
    // Desestrutura os dados da requisição
    const { nome_cliente, data_pedido, pedido_enviado, status_pedido, itens_pedido, total_pedido, forma_pagamento, endereco_entrega, quantidade } = req.body;

    // Valida se todos os campos estão preenchidos
    validarDados(nome_cliente, res);
    validarDados(data_pedido, res);
    validarDados(pedido_enviado, res);
    validarDados(status_pedido, res);
    validarDados(itens_pedido, res);
    validarDados(quantidade, res);
    validarDados(total_pedido, res);
    validarDados(forma_pagamento, res);
    validarDados(endereco_entrega, res);

    // Valida se total_pedido e quantidade são números válidos
    validarNumber(total_pedido, res);
    validarNumber(quantidade, res);

    // Valida se pedido_enviado é booleano
    validarBoolean(pedido_enviado, res);

    // Valida a forma de pagamento
    validarFormaDePagamento(forma_pagamento, res);

    //Valida status do pedido
    validarStatusPedido(status_pedido,res); 

    // Cria um novo pedido
    const novoPedido = {
        id: listaPedidos.length + 1, 
        nome_cliente,
        data_pedido,
        pedido_enviado,
        status_pedido,
        itens_pedido,
        quantidade,
        total_pedido,
        forma_pagamento,
        endereco_entrega
    };

    listaPedidos.push(novoPedido);
    res.status(201).json({ mensagem: "Pedido feito com sucesso.", pedido: novoPedido });
});

const port = 3001;
app.listen(port, () => {
    console.log(`Server Running on port ${port}...`);
});


app.get('/pedidos/:id',(req,res)=>{
    const idPedido = parseInt(req.params.id);
    const pedido = listaPedidos.find(pedido=>pedido.id===idPedido); 

    if(!pedido){
        return res.status(200).json({mensagem:"Pedido não existe!"})
    }

    res.json(pedido);
}); 

app.get('/pedidos',(req,res)=>{
    const status = req.query.status ? req.query.status.toLowerCase() : null; 
    let pedidosFiltrados = listaPedidos; 

    if(!pedidosFiltrados){
        res.status(500).json({mensagem:"Erro ao tentar acessar a lista de pedidos."})
    }

    if(status != null){
        pedidosFiltrados = listaPedidos.filter(pedido=> pedido.status_pedido === status);
    }

    const resumoPedidos = pedidosFiltrados.map(pedido=>({
        id:pedido.id,
        nome_cliente: pedido.nome_cliente,
        data_pedido: pedido.data_pedido, 
        status_pedido: pedido.status_pedido,
        total_pedido:pedido.total_pedido
    }))

    res.json(resumoPedidos);

}); 

// Endpoint para atualizar o status de um pedido
app.patch('/pedidos/:id/status', (req, res) => {
    const { id } = req.params;
    const { status_pedido } = req.body;

    const pedido = listaPedidos.find(p => p.id == id);

    if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    if (!status_pedido) {
        return res.status(400).json({ error: 'Status do pedido é obrigatório.' });
    }

    validarStatusPedido(status_pedido,res);

    pedido.status_pedido = status_pedido;

    res.json({ message: 'Status atualizado com sucesso.', pedido });
});



app.delete('/pedidos/:id', (req,res)=>{
    const idPedido = parseInt(req.params.id); 
    const index = listaPedidos.findIndex(pedido=> pedido.id === idPedido); 

    if(index < 0){
        return res.json({mensagem:"Pedido não existe."})
    }else{
        listaPedidos.splice(index,1)
    }

    res.json({mensagem:"Pedido deletado com sucesso."})
    

})



