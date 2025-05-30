const http = require('http');
const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const hostname = '127.0.0.1';
const port = 8080;
const filePath = path.join(__dirname, 'docs/index.html');
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

function resEnd(res, requestId, startTime, method, url, statusCode, headers, content) {
    const endTime = new Date();
    const endTimeString = endTime.toLocaleString('ja-JP', { timeZone: tz });
    const duration = endTime - startTime;
    res.statusCode = statusCode;
    for (const header of headers) {
        res.setHeader(header.name, header.value);
    }
    res.end(content);
    console.log(`[${endTimeString}]\t${requestId}\tEND\t${method}\t${url}\t${statusCode}\t${duration}ms`);
}

const server = http.createServer((req, res) => {
    const requestId = uuid();
    const startTime = new Date();
    const method = req.method;
    const url = req.url;
    const startTimeString = startTime.toLocaleString('ja-JP', { timeZone: tz });
    console.log(`[${startTimeString}]\t${requestId}\tSTART\t${method}\t${url}`);

    if (req.url == '/') {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                resEnd(res, requestId, startTime, method, url, 500, [{
                    name: 'Content-Type', value: 'text/plain'
                }], 'Internal Server Error');
                console.error(err);
                return;
            }
            resEnd(res, requestId, startTime, method, url, 200, [{
                name: 'Content-Type', value: 'text/html'
            }], data);
        });
    } else {
        resEnd(res, requestId, startTime, method, url, 400, [{
            name: 'Content-Type', value: 'text/plain'
        }], 'Not Found');
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});