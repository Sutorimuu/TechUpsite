const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

const db = require('./banco/database');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  db.all('SELECT * FROM produtos', [], (erro, produtos) => {
    if (erro) {
      console.error('Erro ao consultar banco de dados:', erro.message);
      return res.render('index', { produtos: [] });
    }
    
    res.render('index', { produtos: produtos || [] });
  });
});

app.get('/produtos', (req, res) => {
  db.all('SELECT * FROM produtos', [], (erro, produtos) => {
    if (erro) {
      console.error('Erro ao consultar banco de dados:', erro.message);
      return res.render('produtos', { produtos: [] });
    }
    
    res.render('produtos', { produtos: produtos || [] });
  });
});

const appAdmin = require('./rotas/admin');
app.use('/admin', appAdmin);

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${port}`);
});