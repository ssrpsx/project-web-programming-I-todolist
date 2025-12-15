import type { Request, Response } from "express";
import { db } from "../server";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface UserRow extends RowDataPacket {
    ID: number;
    USERNAME: string;
    PASSWORD: string;
}

export const register = async (req: Request, res: Response) => {
    try {
        const { username, password, confirmPassword } = req.body

        const usernameNormalized = username.trim().toLowerCase();

        const [rows] = await db.query<UserRow[]>(
            "SELECT * FROM user WHERE USERNAME = ?",
            [usernameNormalized]
        );

        const users = rows[0];

        if (!username || !password || !confirmPassword) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        if (users) {
            return res.status(409).json({ message: "User already exists!" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO user (USERNAME, PASSWORD) VALUES (?, ?)',
            [username, hashedPassword]
        );

        const userId = result.insertId;

        const achievements = [
            ["On fire", "Be productive for 5 days streak!", "fa-solid fa-fire"],
            ["Hardcore", "Finish 3 task with 'Hard' difficulty", "fa-solid fa-check"],
            ["King", "Reach level 5", "fas fa-crown"],
            ["Scribe", "Make 3 new notes", "fa-solid fa-note-sticky"],
            ["Time Keeper", "Finish 1 Pomodoro session", "fa-regular fa-clock"],
            ["High Flyer", "Reach rank Kid", "fa-solid fa-angles-up"]
        ];

        for (const [title, desc, icon] of achievements) {
            await db.query(
                `
                    INSERT INTO achievement (USER_ID, TITLE, DESCRIPTION, ICON)
                    VALUES (?, ?, ?, ?)
                `,
                [userId, title, desc, icon]
            );
        }


        res.status(200).json({ message: "Register Success!!" })
    }
    catch (err) {
        console.log(err)
        res.status(500).send("Server Error")
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password, remember } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const usernameNormalized = username.trim().toLowerCase();

        const [rows] = await db.query<UserRow[]>(
            "SELECT * FROM user WHERE USERNAME = ?",
            [usernameNormalized]
        );

        const user = rows[0];

        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, user.PASSWORD);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const payload = {
            ID: user.ID,
            username: user.USERNAME,
        };

        const expiresIn = remember ? "3d" : "1h";

        const token = jwt.sign(
            payload,
            "jwtsecret",
            { expiresIn }
        );

        return res.json({
            message: "Login Successfully",
            token,
            expiresIn,
            user: payload
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};