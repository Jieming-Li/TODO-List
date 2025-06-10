const data = require("./data")
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();

app.use("/css", express.static("resources/css/"));
app.use("/js", express.static("resources/js/"));
app.use(express.json());
app.set("views", "templates");
app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true
}));

const port = 4131;

const loggerMiddleware = (req, res, next) => {
    res.on('finish', () => {
        const method = req.method;
        const url = req.originalUrl;
        const statusCode = res.statusCode;

        console.log(`${method} ${url} - Status: ${statusCode}`);
    });

    next();
};
app.use(loggerMiddleware);

app.get(['/', '/main'], async (req , res) => {
    if (!req.session.userId) {
        return res.status(403).render("warning.pug");
    }
    let query = req.query.query || "";
    const jsondata = {
        query:query,
        user_id:req.session.userId
    }
    const tasks = await data.getTaskTable(jsondata);
    res.status(200).render('mainpage',{tasks:tasks});
});

app.get('/task/:id', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).render("warning.pug");
    }
    const taskId = parseInt(req.params.id, 10);
    
  
    if (isNaN(taskId)) {
      res.status(404).render('404.pug');
      return;
    }

    const jsondata = {
        id:taskId,
        user_id:req.session.userId
    }
  
    const task = await data.getTask(jsondata);
    if (task.length === 0) {
        res.status(400).send("not today");
    }
  
    if (task) {
      res.status(200).render('task', {task:task[0]});
    } else {
      res.status(404).render('404.pug');
    }
});

app.get('/create', (req, res) => {
    if (!req.session.userId) {
        return res.status(403).render("warning.pug");
    }
    res.status(200).render('create.pug');
});

app.post('/create', (req, res) => {
    if (!req.session.userId) {
        return res.status(403).render("warning.pug");
    }
    const task_data = req.body;
    task_data.user_id = req.session.userId;

    const success = addNewTask(task_data);

    if (success) {
        res.status(200).render('success.pug');
    } else {
        res.status(400).render('fail.pug');
    }
});

async function addNewTask(task_data) {
    const requiredFields = ['name', 'deadline'];

    for (const field of requiredFields) {
        if (!task_data[field] || task_data[field].trim() === '') {
            console.log('Missing or empty field:', field);
            return false;
        }
    }

    const deadline = new Date(task_data['deadline']);
    if (deadline < new Date()) {
        console.log('Deadline is in the past');
        return false;
    }

    if (task_data['description'] === '') {
        task_data['description'] = 'N/A';
    }
    if (task_data['location'] === '') {
        task_data['location'] = 'N/A';
    }

    // let isoString = task_data['deadline'] + "T00:00:00Z";
    // task_data['deadline'] = isoString.replace("T", " ").replace("Z", "");
    let isoString = deadline.toISOString();
    task_data['deadline'] = isoString.replace("T", " ").replace("Z", "");

    const id = data.addTask(task_data);

    return true;
}

app.delete('/api/delete_task', (req, res) => {

    if (!req.body || req.headers['content-type'] !== 'application/json') {
        return res.status(400).json({
            data: null,
            status: 400,
            error: 'Invalid request. Expected Content-Type: application/json.'
        });
    }

    const task_data = req.body;

    const status = removeTask(task_data);

    if (status === 400) {
        return res.status(400).json({
            data: null,
            status: 400,
            error: 'Bad Request. Missing or invalid fields.'
        });
    } else if (status === 404) {
        return res.status(404).json({
            data: null,
            status: 404,
            error: 'Not Found. Task does not exist.'
        });
    } else if (status === 204) {
        return res.status(204).json({
            data: null,
            status: 204,
            message: 'Task deleted successfully.'
        });
    }
});

function removeTask(task_data) {

    if (typeof task_data !== 'object' || task_data === null) {
        return 400;
    }

    if (!task_data.hasOwnProperty('id') || !task_data['id']) {
        return 400;
    }

    const result = data.deleteTask(task_data['id']);

    if (result) {
      return 204;
    }else{
      return 404;
    }
}

app.post('/api/check_task', async (req, res) => {
    const task_data = req.body;
    const success = await data.checkTask(task_data);
    if (success) {
        return res.status(204).json({
            data: null,
            status: 204,
            message: 'Task updated successfully.'
        });
    } else{
        return res.status(400).json({
            data: null,
            status: 400,
            error: 'Bad Request. Missing or invalid fields.'
        });
    }
});

app.get('/login', (req, res) => {
    res.status(200).render('login.pug');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const result = await data.getUser(username);

    if (result.length === 0) {
        return res.status(401).send('Invalid credentials');
    }

    if (password !== result[0]["password"]) {
        return res.status(401).send('Invalid credentials');
    }
    
    req.session.userId = result[0]["id"];
    req.session.username = username;
    res.status(200).render("login_success.pug");
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.status(200).render('logout.pug');
    });
});

app.get('/register', (req, res) => {
    res.status(200).render('register.pug');
});

app.post('/register', async (req, res) => {
    const jsondata = req.body;

    const success = await data.Register(jsondata);

    if (success) {
        res.status(200).render("register_success.pug");
    } else {
        res.status(500).send('Error registrating');
    }
});

app.get('/table', (req , res) => {
    res.sendFile('table.js', { root: './resources/js' });
});

app.use((req, res) => {
    res.status(404).render('404.pug');
});

app.listen(port , () => {
    console.log(`bidding app listening on port ${port}`);
});