require('dotenv').config(); 
require('./utils/cron');
const express = require('express');
const cors = require('cors');
const db = require('./models'); 
const routes = require('./routes'); 
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json()); 
app.use('/auth', authRoutes);
app.get('/', (req, res) => {
  res.send('API Neuroflux funcionando');
});

app.use(routes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync();
    console.log('DB sincronizado e MySQL conectado!');
  } catch (err) {
    console.warn('MySQL indisponível ou credenciais inválidas. O servidor continuará em execução com o banco desconectado:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Servidor Neuroflux rodando em http://localhost:${PORT}`);
  });
}

startServer(); 