require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const path = require('path');

// Importar as Rotas
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();

// --- O ESPIÃO (LOG DE PEDIDOS) ---
// Isto vai mostrar no terminal TUDO o que o site pede
app.use((req, res, next) => {
    console.log(`📢 [${new Date().toLocaleTimeString()}] PEDIDO RECEBIDO: ${req.method} ${req.url}`);
    next();
});
// ---------------------------------

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

// Ligar as Rotas
app.use('/api/auth', authRoutes);
app.use('/api/veiculos', vehicleRoutes);
app.use('/api/reservas', reservationRoutes);

// Teste de ligação à BD
db.query('SELECT 1')
  .then(() => {
    console.log('✅ Base de dados ligada com sucesso!');
  })
  .catch(err => console.error('❌ Erro ao ligar à BD:', err));

// Porta do Servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
    console.log(`Abre o site aqui: http://localhost:${PORT}`);
    // ... outras importações
const publicRoutes = require('./routes/publicRoutes'); // Adiciona isto

// ...
app.use('/api/auth', authRoutes);
app.use('/api/veiculos', vehicleRoutes);
app.use('/api/reservas', reservationRoutes);
app.use('/api/public', publicRoutes); // Adiciona isto (O teu Web Service ficará em /api/public/...)
});
