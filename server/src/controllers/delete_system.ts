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

export const delete_task = async (req: Request, res: Response) => {
    try {
        const taskId = req.params.id;

        await db.query(
            "DELETE FROM tasks WHERE ID = ?",
            [taskId]
        );
        
        return res.json({ message: "Task deleted" });
    }
    catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const delete_note = async (req: Request, res: Response) => {
    try {
        console.log("loaded")

        const id = req.params.id;

        await db.query(
            "DELETE FROM notes WHERE ID = ?",
            [id]
        );

        return res.json({ message: "Note deleted" });
    }
    catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};
