const http = require('http');
const { URL } = require('url');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log("Unable to connect to MongoDB");
    }
}
connectDB();

async function onRequest(req, res) {
    const myURL = new URL(req.url, `http://${req.headers.host}`);
    const path = myURL.pathname;
    const nm = myURL.searchParams.get('nm');
    const em = myURL.searchParams.get('em');

    if (path === '/insert') {
        await insert(req, res, nm, em);
    } else if (path === '/delete') {
        await deleted(req, res, nm);
    } else if (path === '/update') {
        await updated(req, res, nm, em);
    } else if (path === '/read') {
        await read(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}

async function insert(req, res, nm, em) {
    try {
        const coln = client.db('data').collection('info');
        const d = { nm, em };
        const result = await coln.insertOne(d);
        console.log(`${result.insertedCount} document(s) inserted`);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Insert successful');
    } catch (error) {
        console.log("Unable to insert");
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Insert failed');
    }
}

async function deleted(req, res, nm) {
    try {
        const coln = client.db('data').collection('info');
        const filter = { nm: nm };
        const result = await coln.deleteOne(filter);
        console.log(`${result.deletedCount} document(s) deleted`);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Delete successful');
    } catch (error) {
        console.log("Unable to delete");
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Delete failed');
    }
}

async function updated(req, res, nm, em) {
    try {
        const coln = client.db('data').collection('info');
        const filter = { nm: nm };
        const up = { $set: { em: em } };
        const result = await coln.updateOne(filter, up);
        console.log(`${result.modifiedCount} document(s) updated`);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Update successful');
    } catch (error) {
        console.log("Unable to update");
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Update failed');
    }
}

async function read(req, res) {
    try {
        const coln = client.db('data').collection('info');
        const cursor = coln.find({});
        const emp = await cursor.toArray();
        let table = `<html>
        <body>
        <table border="1">
        <tr><th>Name</th><th>Email</th></tr>`;
        emp.forEach(emps => {
            table += `<tr><td>${emps.nm}</td><td>${emps.em}</td></tr>`;
        });
        table += `</table></body></html>`;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(table);
    } catch (error) {
        console.log('Unable to read');
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Read failed');
    }
}

http.createServer(onRequest).listen(1234);
console.log("Server running on http://localhost:1234");
