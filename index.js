import path from "path";
import express from "express";
import fs from "fs";
import puppeteer from "puppeteer"
//const { exec } = require('child_process');
const app = express();

// Utiliser le port du process (Electron peut le passer) ou 3000
const PORT = process.env.PORT || 3001;

// Servir les fichiers statiques
app.use(express.static("public"));

// Route spécifique pour /interface
app.get("/interface", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "interface.html"));
});

// API pour mise à jour
/*app.post('/api/update', express.json(), (req, res) => {
  const dataPath = path.join(process.cwd(), "public", "param.json");
  req.body.base = Number(req.body.base);
  fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2), 'utf-8');
  res.json({ status: 'ok' });
});*/

app.post('/api/update', express.json(), async (req, res) => {
  try {

    const paramPath = path.join(
      process.cwd(),
      'public',
      'param.json'
    );

    const param = JSON.parse(
      await fs.promises.readFile(
        paramPath,
        'utf8'
      )
    );

    const dataFilePath = path.join(
      process.cwd(),
      'public',
      'data',
      param.file
    );

    await fs.promises.writeFile(
      dataFilePath,
      JSON.stringify(req.body, null, 2),
      'utf8'
    );

    res.json({ status: 'ok' });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});
// API pour récupérer les données
app.get("/api/data", (req, res) => {
  const dataPath = path.join(process.cwd(), "public", "param.json");

  if (fs.existsSync(dataPath)) {
    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    res.json(data);
  } else {
    res.json({ url: "http://localhost:" + PORT, label: "", base: "" });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Express → http://localhost:${PORT}/interface`);
});
(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('http://localhost:3001/interface/');
  await page.setViewport({width: 750, height: 800});
})();