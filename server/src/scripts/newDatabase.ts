import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function createDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            multipleStatements: true
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS Project_Webpro`);
        console.log("✔ DATABASE 'Project' created / already exists");

        await connection.query(`USE Project_Webpro`);


        const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS user (
	ID INT AUTO_INCREMENT PRIMARY KEY,
    USERNAME VARCHAR(255) NOT NULL,
    PASSWORD VARCHAR(255) NOT NULL,
    EXP INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tasks (
	ID INT AUTO_INCREMENT PRIMARY KEY,
    USER_ID INT NOT NULL,
    TASK VARCHAR(255) NOT NULL,
    LEVEL ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    COMPLETE BOOL NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (USER_ID) REFERENCES user(ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
	ID INT AUTO_INCREMENT PRIMARY KEY,
    USER_ID INT NOT NULL,
    TITLE VARCHAR(255) NOT NULL,
    CONTENT TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (USER_ID) REFERENCES user(ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Achievement (
	ID INT AUTO_INCREMENT PRIMARY KEY,
    USER_ID INT NOT NULL,
    TITLE TEXT NOT NULL,
    DESCRIPTION TEXT NOT NULL,
    ICON VARCHAR(255) NOT NULL,
    COMPLETE BOOL NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (USER_ID) REFERENCES user(ID) ON DELETE CASCADE
);
                                    `;

        await connection.query(createTablesSQL);
        console.log("✔ All tables created!");
        
        await connection.end();
    }
    catch (err) {
        console.error("❌ ERROR:", err);
    }
}

createDatabase();