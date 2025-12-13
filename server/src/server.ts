import express from 'express'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import authRoutes from './routes/auth.js'
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
    database: process.env.DB_NAME,
});

(async () => {
    try {
        await db.query("SELECT 1");
        console.log("✅ MySQL Connected!");
    }
    catch (err) {
        console.error("❌ Database connection error:", err);
    }
})();

app.use(cookieParser());

app.use('/api', authRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});