import * as fs from 'fs';
import * as https from 'https';
import * as constants from './constants';

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
    fs.promises.readFile(__dirname + '/static/index.html')
        .then(contents => {
            response.setHeader('Content-Type', 'text/html');
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
    response.setHeader('Content-Type', 'application/json');

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
    response.setHeader('Content-Type', 'application/json');
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

const getLimits = (request, response, connection) => {
    response.setHeader('Content-Type', 'application/json');

    const options = {
        host: connection.instanceUrl.substring('https://'.length, connection.instanceUrl.length),
        path: constants.default.ENDPOINT_LIMITS,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + connection.accessToken,
        }
    };

    https.get(options, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            let limits = JSON.parse(data);

            for (const limitName in limits) {
                limits[limitName].Used = limits[limitName].Max === 0 ? 0 : (Math.round((limits[limitName].Max - limits[limitName].Remaining) / limits[limitName].Max * 1000.0) / 10.0);
                limits[limitName].class = limits[limitName].Used > constants.default.LIMIT_MAX_THRESHOLD_ALERT ? 'alert' : (limits[limitName].Used > constants.default.LIMIT_MAX_THRESHOLD_WARNING ? 'warning' : '');
            }
            
            response.write(JSON.stringify(limits));
            response.end();
        });
    }).on('error', (error) => {
        console.error(error.message);
    });
};

export default { handlePostRequest, getMainPage, getUrlConfig, getLoginInfo, getCompanyInformation, getLimits };