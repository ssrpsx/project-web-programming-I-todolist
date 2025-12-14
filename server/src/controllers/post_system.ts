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

export const post_task = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.ID;
        const { TASK, LEVEL } = req.body;

        await db.query(
            "INSERT INTO tasks (USER_ID, TASK, LEVEL) VALUES (?, ?, ?)",
            [userId, TASK, LEVEL]
        );

        return res.status(201).json({ message: "Added successfully" });
    } 
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
};