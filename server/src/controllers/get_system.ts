import type { Request, Response } from "express";
import { db } from "../server";
import type { RowDataPacket } from "mysql2";
import { AuthRequest } from "../middleware/auth.js";

interface UserRow extends RowDataPacket {
    ID: number;
    USERNAME: string;
    PASSWORD: string;
    EXP: number;
}

interface TaskRow extends RowDataPacket {
    ID: number;
    USER_ID: number;
    TASK: string;
    LEVEL: string;
    COMPLETE: boolean;
}

export const get_user = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.ID;

        const [rows] = await db.query<UserRow[]>(
            "SELECT * FROM user WHERE ID = ?",
            [userId]
        );

        const user = rows[0];

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            username: user.USERNAME,
            exp: user.EXP,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const get_task = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.ID;

        const [rows] = await db.query<TaskRow[]>(
            "SELECT * FROM tasks WHERE USER_ID = ?",
            [userId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "No tasks found for this user" });
        }

        return res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const get_note = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.ID;

        const [rows] = await db.query<TaskRow[]>(
            "SELECT * FROM notes WHERE USER_ID = ?",
            [userId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "No note found for this user" });
        }

        return res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};