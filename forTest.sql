CREATE DATABASE IF NOT EXISTS Project_Webpro;

USE project_webpro;

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
                                    
SELECT * FROM achievement;

SELECT * FROM notes;

SELECT * FROM tasks;

SELECT * FROM user;

UPDATE achievement SET COMPLETE = 1 WHERE ID = 6;

SELECT * FROM tasks WHERE USER_ID =3;

INSERT INTO notes(USER_ID, TITLE, CONTENT) VALUES('1', 'สวัสดีวันจันทร์', 'วันนี้พระจันทร์สวยจัง');

DELETE FROM user WHERE id = 1;

SELECT count(ID) FROM tasks WHERE COMPLETE = 1 AND USER_ID = 1;

SELECT DISTINCT DATE(updated_at) AS done_date
  FROM tasks
  WHERE COMPLETE = 1
  AND DATE(updated_at) <= CURDATE()
  AND USER_ID = 1
  ORDER BY done_date DESC;

INSERT INTO tasks(USER_ID, TASK, LEVEL) VALUES(2, 'abc', "Medium");

UPDATE user SET EXP = 20770 WHERE ID = 2;

DELETE FROM achievement WHERE USER_ID = 1;

INSERT INTO tasks (USER_ID, TASK, LEVEL, COMPLETE, created_at, updated_at) VALUES
(10, 'Day 1 task', 'Easy',   1, CURDATE() - INTERVAL 4 DAY, CURDATE() - INTERVAL 4 DAY),
(10, 'Day 2 task', 'Medium', 1, CURDATE() - INTERVAL 3 DAY, CURDATE() - INTERVAL 3 DAY),
(10, 'Day 3 task', 'Medium', 1, CURDATE() - INTERVAL 2 DAY, CURDATE() - INTERVAL 2 DAY),
(10, 'Day 4 task', 'Hard',   1, CURDATE() - INTERVAL 1 DAY, CURDATE() - INTERVAL 1 DAY),
(10, 'Day 5 task', 'Easy',   1, CURDATE(),                  CURDATE());

INSERT INTO achievement(USER_ID, TITLE, DESCRIPTION, ICON) VALUES
(1, "On fire", "Be productive for 5 days streak!", "fa-solid fa-fire"),
(1, "Hardcore", "Finish 3 task with 'Hard' difficulty", "fa-solid fa-check"),
(1, "King", "Reach level 5", "fas fa-crown"),
(1, "Scribe", "Make 3 new notes", "fa-solid fa-note-sticky"),
(1, "Time Keeper", "Finish 1 Pomodoro session", "fa-regular fa-clock"),
(1, "High Flyer", "Reach rank Kid", "fa-solid fa-angles-up");