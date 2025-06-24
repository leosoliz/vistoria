const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'prefeitura',
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/api/vistoria', upload.array('fotos', 3), (req, res) => {
  const data = req.body;
  const fotos = req.files.map(file => file.filename).join(',');

  const sql = `
    INSERT INTO vistorias
    (nome_obra, localizacao, numero_contrato, empresa_responsavel, engenheiro_responsavel, fiscal_prefeitura, data_vistoria, hora, objetivo, descricao_atividades, situacao, recomendacoes, fotos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    data.nome_obra,
    data.localizacao,
    data.numero_contrato,
    data.empresa_responsavel,
    data.engenheiro_responsavel,
    data.fiscal_prefeitura,
    data.data_vistoria,
    data.hora,
    data.objetivo,
    data.descricao_atividades,
    data.situacao,
    data.recomendacoes,
    fotos
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro ao salvar vistoria.' });
    }
    res.json({ message: 'Vistoria salva com sucesso!' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});