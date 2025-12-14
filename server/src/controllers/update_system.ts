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

export const update_task = async (req: AuthRequest, res: Response) => {
    try {
        const taskId = req.params.id;

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.ID;

        await db.query(
            "UPDATE tasks SET COMPLETE = 1 WHERE ID = ? AND USER_ID = ?",
            [taskId, userId]
        );

        const [rows] = await db.query<TaskRow[]>(
            "SELECT LEVEL FROM tasks WHERE ID = ?",
            [taskId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        const level = rows[0].LEVEL;

        let expGain = 0;
        if (level === "Easy") expGain = 15;
        else if (level === "Medium") expGain = 25;
        else if (level === "Hard") expGain = 50;

        await db.query(
            "UPDATE user SET EXP = EXP + ? WHERE ID = ?",
            [expGain, userId]
        );

        return res.json({
            message: "Task completed",
            expGained: expGain
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
