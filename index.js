import path from "path";
import express from "express";
import fs from "fs";

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
    const dataPath = path.join(process.cwd(), 'public', 'param.json');

    await fs.promises.writeFile(
      dataPath,
      JSON.stringify(req.body, null, 2),
      'utf8'
    );

    res.json({ status: 'ok' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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
