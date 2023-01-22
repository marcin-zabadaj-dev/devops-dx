import * as fs from 'fs';

const handlePostRequest = (request, response, connection) => {
    var jsonString = '';

    request.on('data', function (data) {
        jsonString += data;
    });

    request.on('end', function () {
        console.log(JSON.parse(jsonString));
    });
};

const getMainPage = (request, response, connection) => {
    fs.promises.readFile(__dirname + "/static/index.html")
        .then(contents => {
            response.setHeader("Content-Type", "text/html");
            response.writeHead(200);
            response.end(contents);
        })
        .catch(err => {
            console.error(err);
            response.writeHead(500);
            response.end('error');
            return;
        });
};

const getLoginInfo = (request, response, connection) => {
    response.setHeader("Content-Type", "application/json");

    response.write(JSON.stringify({
        username: connection.username,
        instanceUrl: connection.instanceUrl,
        orgId: connection.orgId,
        version: connection.version,
        accessToken: connection.accessToken,
    }));
    
    response.end();
};

const getUrlConfig = (requestMethod, url) => {
    return requestMethod + '+' + url;
}

export default { handlePostRequest, getMainPage, getUrlConfig, getLoginInfo };