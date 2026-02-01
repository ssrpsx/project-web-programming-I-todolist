import express from 'express'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import authRoutes from './routes/auth.js'
import systemRoutes from './routes/system.js'
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from "cookie-parser";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true,
}));

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

export const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

async function connectWithRetry(attempts = 5) {
  while (attempts > 0) {
    try {
      const connection = await db.query("SELECT 1");
      console.log("✅ Database connected!");
      return connection;
    }
    catch (err) {
      console.log(`❌ Connection failed, retrying... (${attempts} left)`);
      attempts--;
      await new Promise(res => setTimeout(res, 3000));
    }
  }
  throw new Error("Could not connect to DB after multiple retries");
}

connectWithRetry()

app.use(cookieParser());

app.use('/api', systemRoutes);
app.use('/api/auth/', authRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});