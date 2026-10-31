const express = require("express");
const appAdmin = express();
const db = require("../banco/database");
const upload = require("../util/imagens");

appAdmin.get("/index", (req, res) => {
  res.render("admin/index-admin");
});

appAdmin.get("/", (req, res) => {
  res.render("admin/login");
});

appAdmin.post("/login", (req, res) => {
  res.redirect("/admin/index");
});

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
    }
  );
});

appAdmin.get("/produtos", (req, res) => {
  db.all("SELECT * FROM produtos", [], function (erro, produtos) {
    if (erro) {
      console.log(erro.message);
      return res.send("Erro ao consultar produtos.");
    }
    res.render("admin/produtos/lista", { produtos });
  });
});

appAdmin.get("/produtos/form-cadastrar", (req, res) => {
  db.all("SELECT * FROM categorias", [], function (erro, categorias) {
    if (erro) {
      console.log(erro.message);
      return res.send("Erro ao consultar categorias.");
    }
    res.render("admin/produtos/cadastro", { categorias });
  });
});

appAdmin.post("/produtos/cadastrar", upload.single("imagem"), (req, res) => {
  const nome = req.body.nome;
  const categoria = req.body.categoria;
  const valor = req.body.valor;
  const estoque = req.body.estoque;
  const marca = req.body.marca;
  const tipo = req.body.tipo;
  const descricao = req.body.descricao;
  const imagem = req.file ? req.file.filename : 'default.png';

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
    }
  );
});

appAdmin.get("/produtos/excluir/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM produtos WHERE id = ?", [id], function (erro) {
    if (erro) {
      console.log(erro.message);
      return res.send("Erro ao excluir produto.");
    }
    res.redirect("/admin/produtos");
  });
});
appAdmin.get("/produtos/editar/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM produtos WHERE id = ?", [id], function (erro, produto) {
    if (erro || !produto) {
      return res.send("Produto não encontrado.");
    }
    db.all("SELECT * FROM categorias", [], function (err, categorias) {
      res.render("admin/produtos/editar", { produto, categorias });
    });
  });
});

appAdmin.post("/produtos/atualizar/:id", upload.single("imagem"), (req, res) => {
  const id = req.params.id;
  const { nome, categoria, valor, estoque, marca, tipo, descricao } = req.body;

  if (req.file) {
    const imagem = req.file.filename;
    db.run(
      `UPDATE produtos SET nome=?, categoria=?, valor=?, estoque=?, imagem=?, marca=?, tipo=?, descricao=? WHERE id=?`,
      [nome, categoria, valor, estoque, imagem, marca, tipo, descricao, id],
      function (erro) {
        if (erro) return res.send("Erro ao atualizar produto.");
        res.redirect("/admin/produtos");
      }
    );
  } else {
    db.run(
      `UPDATE produtos SET nome=?, categoria=?, valor=?, estoque=?, marca=?, tipo=?, descricao=? WHERE id=?`,
      [nome, categoria, valor, estoque, marca, tipo, descricao, id],
      function (erro) {
        if (erro) return res.send("Erro ao atualizar produto.");
        res.redirect("/admin/produtos");
      }
    );
  }
});

module.exports = appAdmin;