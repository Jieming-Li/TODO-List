const mysql = require(`mysql-await`); // npm install mysql-await

var connPool = mysql.createPool({
  connectionLimit: 5,
  host: "127.0.0.1",// this will work
//   host: "cse-mysql-classes-01.cse.umn.edu",
  user: "C4131F24U75",
  database: "C4131F24U75",
  password: "5675",
});

async function addTask(data) {
    const {name, description, location, deadline, user_id} = data;
    const query = "INSERT INTO tasks (name, description, location, end_time, status, user_id) VALUES (?, ?, ?, ?, ?, ?);"
    const result = await connPool.awaitQuery(query, [name, description, location, deadline, "TODO", user_id]);
    const newListingId = result.insertId;
    console.log("Task added with ID:", newListingId);
    return newListingId;
}

async function deleteTask(id) {
    const result = await connPool.awaitQuery("DELETE FROM tasks WHERE id = ?", [id]);
    const isDeleted = result.affectedRows > 0;
    if (isDeleted) {
      console.log(`Task with ID ${id} deleted.`);
    } else {
      console.log(`Task with ID ${id} not found.`);
    }
    return isDeleted;
}

async function getTask(data) {
    const {id, user_id} = data;
    const taskResult = await connPool.awaitQuery("SELECT * from tasks where id = ? AND user_id = ?",[id, user_id]);
    return taskResult;
}
  

async function getTaskTable(data) {
    const {query, user_id} = data;
    const sql = "SELECT * FROM tasks WHERE name LIKE ? AND user_id = ?";
    const result = await connPool.awaitQuery(sql, [`%${query}%`, user_id]);
    return result;
}

async function checkTask(data) {
    const {id, status} = data;
    const sql = "UPDATE tasks SET status = ? WHERE id = ?"
    const result = await connPool.awaitQuery(sql, [status, id]);
    const updated = result.affectedRows > 0;
    if (updated) {
        console.log(`Task with ID ${id} updated.`);
    } else {
        console.log(`Task with ID ${id} not found.`);
    }
    return updated;
}

async function getUser(username) {
    const sql = "SELECT * FROM users WHERE username = ?";
    const result = await connPool.awaitQuery(sql, [username]);
    return result;
}

async function Register(data) {
    const {username, password} = data;
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    const result = await connPool.awaitQuery(sql, [username, password]);
    const updated = result.affectedRows > 0;
    if (updated) {
        console.log(`User added`);
    } else {
        console.log(`User not added`);
    }
    return updated;
}

  module.exports = {
    getTaskTable,
    getTask,
    addTask,
    deleteTask,
    checkTask,
    getUser,
    Register
};