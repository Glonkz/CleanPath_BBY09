const express = require('express');
const app = express();
const port = 8000;
const path = require('path');

app.use("/scripts", express.static("./scripts"));
app.use("/styles", express.static("./styles"));
app.use("/images", express.static("./icons"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/main.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/Login.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/map.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/settings.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// app.get('/', (req, res) => {
//     res.json({ message: 'Hello World!', timestamp: new Date() });
// });

//Start the server
app.listen(port, () => {
    console.log('Server running at http://localhost:${port}');
});

