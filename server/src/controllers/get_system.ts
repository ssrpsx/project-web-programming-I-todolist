import type { Response } from "express";
import { db } from "../server";
import type { RowDataPacket } from "mysql2";
import { AuthRequest } from "../middleware/auth.js";

interface UserRow extends RowDataPacket {
    ID: number;
    USERNAME: string;
    EXP: number;
}

export const get_user = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.ID;

        /* ---------- user ---------- */
        const [[user]] = await db.query<UserRow[]>(
            "SELECT USERNAME, EXP FROM user WHERE ID = ?",
            [userId]
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        /* ---------- correct ---------- */
        const [[correctRow]] = await db.query<RowDataPacket[]>(
            "SELECT COUNT(ID) AS correct FROM tasks WHERE COMPLETE = 1 AND USER_ID = ?",
            [userId]
        );

        /* ---------- streak ---------- */
        const [streakRows] = await db.query<RowDataPacket[]>(
            `
            SELECT DISTINCT DATE(updated_at) AS done_date
            FROM tasks
            WHERE COMPLETE = 1
            AND DATE(updated_at) <= CURDATE()
            AND USER_ID = ?
            ORDER BY done_date DESC
            `,
            [userId]
        );

        let streak = 0;
        let current = new Date();
        current.setHours(0, 0, 0, 0);

        for (const row of streakRows) {
            const doneDate = new Date(row.done_date);
            doneDate.setHours(0, 0, 0, 0);

            const diff =
                (current.getTime() - doneDate.getTime()) /
                (1000 * 60 * 60 * 24);

            if (diff === 0 || diff === 1) {
                streak++;
                current.setDate(current.getDate() - 1);
            } else {
                break;
            }
        }

        /* ---------- achievement ---------- */
        const [achievement] = await db.query<RowDataPacket[]>(
            `
            SELECT *
            FROM achievement
            WHERE USER_ID = ?
            ORDER BY COMPLETE ASC, created_at ASC
            `,
            [userId]
        );

        /* ---------- response (format เดิม) ---------- */
        return res.status(200).json({
            user: {
                username: user.USERNAME,
                exp: user.EXP,
            },
            correct: correctRow.correct ?? 0,
            streak,
            achievement,
        });

    }
    catch (err) {
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

        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT * FROM tasks WHERE USER_ID = ?",
            [userId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "No tasks found for this user" });
        }

        return res.status(200).json(rows);
    }
    catch (err) {
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

        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT * FROM notes WHERE USER_ID = ?",
            [userId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "No note found for this user" });
        }

        return res.status(200).json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};