drop table tasks;
drop table users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status TEXT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

INSERT INTO users (id, username, password)
VALUES
(1, "Jimmy", "hihihi");

INSERT INTO tasks (id, name, description, location, end_time, status, user_id)
VALUES
(1, "hw1", "It is the first homework.", "N/A", '2024-12-08 14:30:00', "DONE", 1),
(2, "hw2", "I will enjoy this.", "Tate Hall", '2024-12-31 23:59:59', "TODO", 1),
(3, "interview", "you got this", "pantagon", '2025-01-05 08:15:00', "TODO", 1),
(4, "task139", "I love my job", "prospect park", '2025-02-14 19:00:00', "DONE", 1);