const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const port = 3000;

const db = require('./banco/database');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração da Sessão (Necessária para o carrinho funcionar)
app.use(session({
  secret: 'techup_secret_key_123',
  resave: false,
  saveUninitialized: true
}));

// Rota Inicial (Home)
app.get('/', (req, res) => {
  db.all('SELECT * FROM produtos', [], (erro, produtos) => {
    if (erro) {
      console.error('Erro ao consultar banco de dados:', erro.message);
      return res.render('index', { produtos: [] });
    }
    res.render('index', { produtos: produtos || [] });
  });
});

// Rota de Produtos (Geral)
app.get('/produtos', (req, res) => {
  db.all('SELECT * FROM produtos', [], (erro, produtos) => {
    if (erro) {
      console.error('Erro ao consultar banco de dados:', erro.message);
      return res.render('produtos', { produtos: [] });
    }
    res.render('produtos', { produtos: produtos || [] });
  });
});

// Rota de Detalhes do Produto Individual
app.get('/produto/:id', (req, res) => {
  const produtoId = req.params.id;

  db.get('SELECT * FROM produtos WHERE id = ?', [produtoId], (erro, produto) => {
    if (erro || !produto) {
      console.error('Erro ao buscar produto ou não encontrado:', erro ? erro.message : 'ID inválido');
      return res.status(404).send('Produto não encontrado.');
    }

    const categoriaFiltro = produto.categoria || produto.tipo || '';
    db.all(
      'SELECT * FROM produtos WHERE (categoria = ? OR tipo = ?) AND id != ? LIMIT 4',
      [categoriaFiltro, categoriaFiltro, produtoId],
      (errRel, relacionados) => {
        if (errRel) {
          relacionados = [];
        }

        res.render('produto', {
          produto: produto,
          relacionados: relacionados || []
        });
      }
    );
  });
});

// Rotas do Admin
const appAdmin = require('./rotas/admin');
app.use('/admin', appAdmin);

// Rotas do Carrinho (Conectando o arquivo de rotas do carrinho na URL /carrinho)
const appCarrinho = require('./rotas-carrinho');
app.use('/carrinho', appCarrinho);

// Inicialização do Servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${port}`);
});