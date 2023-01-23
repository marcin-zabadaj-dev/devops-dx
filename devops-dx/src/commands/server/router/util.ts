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

const getCompanyInformation = async (request, response, connection) => {
    response.setHeader("Content-Type", "application/json");
    let fields = await getAllFieldsForSObject(connection, 'Organization');

    let query = `SELECT ${Array.from(Object.keys(fields)).join(',')} FROM Organization`;
    const companyInformation = await connection.query(query);

    for (const fieldApiName in fields) {
        if (companyInformation.records[0][fieldApiName] === null) {
            delete fields[fieldApiName]
            continue;
        }
        fields[fieldApiName].value = companyInformation.records[0][fieldApiName];
    }

    response.write(JSON.stringify(fields));
    response.end();
};

const getAllFieldsForSObject = async (connection, objectApiName) => {
    let fields = {};
    let compoundFields = [];

    let sobjectInformation = await connection.describe(objectApiName);
    sobjectInformation.fields.forEach(field => {
        fields[field.name] = {
            label: field.label
        };

        if (field.compoundFieldName) {
            compoundFields.push(field.compoundFieldName);
        }
    });

    compoundFields.forEach(fieldApiName => delete fields[fieldApiName]);

    return fields;
};

export default { handlePostRequest, getMainPage, getUrlConfig, getLoginInfo, getCompanyInformation };