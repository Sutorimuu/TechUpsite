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

// ==========================================
// ROTAS DE AUTENTICAÇÃO (Login / Registro / Senha)
// ==========================================

// Tela inicial de escolha (Login / Registrar)
app.get('/auth', (req, res) => {
  res.render('logininicio');
});

// Tela do formulário de Login
app.get('/login', (req, res) => {
  res.render('login');
});

// Ação de Login (POST)
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  // Lógica de verificação no banco de dados pode ser inserida aqui
  res.redirect('/');
});

// Tela de Recuperação de Senha - Etapa 1 (E-mail e Data de Nascimento)
app.get('/esqueci-senha', (req, res) => {
  res.render('esqueciasenha');
});

// Tela de Criação/Alteração de Nova Senha
app.get('/nova-senha', (req, res) => {
  res.render('novasenha');
});

app.post('/atualizar-senha', (req, res) => {
  const { senha, confirma_senha } = req.body;
  // Lógica de atualização de senha no banco
  res.redirect('/login');
});

// Tela de Registro - Etapa 1 (Dados Pessoais)
app.get('/registro-etapa1', (req, res) => {
  res.render('registro1');
});

// Tela de Registro - Etapa 2 (Criação de Senha)
app.get('/registro-etapa2', (req, res) => {
  res.render('registro2');
});

app.post('/cadastrar', (req, res) => {
  // Lógica de cadastro no banco
  res.redirect('/login');
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