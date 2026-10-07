const express = require("express");
const appAdmin = express();
const db = require("../banco/database");
const upload = require("../util/imagens");

//================== ROTAS DE LOGIN/INDEX ==================//
appAdmin.get("/index", (req, res) => {
  res.render("admin/index-admin");
});

appAdmin.get("/", (req, res) => {
  res.render("admin/login");
});

appAdmin.post("/login", (req, res) => {
  //algoritmo de autenticação do usuário - FUTURO
  res.redirect("/admin/index");
});

//================== ROTAS DE CATEGORIAS ==================//
appAdmin.get("/categorias", (req, res) => {
  db.all("SELECT * FROM categorias", [], function (erro, categorias) {
    if (erro) {
      console.log(erro.message);
      return res.send("Erro ao consultar categorias.");
    }
    res.render("admin/categorias/lista", { categorias });
  });
});

appAdmin.get("/categorias/form-cadastrar", (req, res) => {
  res.render("admin/categorias/cadastro");
});

appAdmin.post("/categorias/cadastrar", (req, res) => {
  const nome = req.body.nome;
  const descricao = req.body.descricao;

  db.run(
    `INSERT INTO categorias (nome, descricao) VALUES (?, ?)`,
    [nome, descricao],
    function (erro) {
      if (erro) {
        console.log(erro.message);
        return res.send("Erro ao cadastrar categoria.");
      }
      res.redirect("/admin/categorias");
    },
  );
});

//================== ROTAS DE PRODUTOS ==================//

//ROTA PARA CONSULTAR TODOS OS PRODUTOS
appAdmin.get("/produtos", (req, res) => {
  db.all("SELECT * FROM produtos", [], function (erro, produtos) {
    if (erro) {
      console.log(erro.message);
      return res.send("Erro ao consultar produtos.");
    }
    res.render("admin/produtos/lista", { produtos });
  });
});

//ROTA PARA EXIBIR O FORMULÁRIO DE CADASTRO DE PRODUTOS
appAdmin.get("/produtos/form-cadastrar", (req, res) => {
  db.all("SELECT * FROM categorias", [], function (erro, categorias) {
    if (erro) {
      console.log(erro.message);
      return res.send("Erro ao consultar categorias.");
    }
    res.render("admin/produtos/cadastro", { categorias });
  });
});

//ROTA PARA CADASTRAR PRODUTOS
appAdmin.post("/produtos/cadastrar", upload.single("imagem"), (req, res) => {
  const nome = req.body.nome;
  const categoria = req.body.categoria;
  const valor = req.body.valor;
  const estoque = req.body.estoque;
  const marca = req.body.marca;
  const tipo = req.body.tipo;
  const descricao = req.body.descricao;

  const imagem = req.file.filename;

  db.run(
    `INSERT INTO produtos 
        (nome, categoria, valor, estoque, imagem, marca, tipo, descricao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nome, categoria, valor, estoque, imagem, marca, tipo, descricao],
    function (erro) {
      if (erro) {
        console.log(erro.message);
        return res.send("Erro ao cadastrar produto.");
      }
      res.redirect("/admin/produtos");
    },
  );
});

module.exports = appAdmin;