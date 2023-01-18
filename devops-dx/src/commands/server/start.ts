import * as os from 'os';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as http from 'http';
import * as open from 'open';
import * as fs from 'fs';

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('devops-dx', 'start');

export default class Start extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');
  public static examples = messages.getMessage('examples').split(os.EOL);
  public static args = [{ name: 'file' }];

  protected static flagsConfig = {
    name: flags.string({
      char: 'n',
      description: messages.getMessage('nameFlagDescription'),
    }),
    force: flags.boolean({
      char: 'f',
      description: messages.getMessage('forceFlagDescription'),
    }),
  };

  protected static requiresUsername = false;
  protected static supportsDevhubUsername = false;
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    const host = 'localhost';
    const port = 8000;

    const requestListener = function (request, response) {
      if (request.method == 'POST') {
        switch (request.url) {
          case "/home":
            console.log('home post');
            var jsonString = '';

            request.on('data', function (data) {
              jsonString += data;
            });

            request.on('end', function () {
              console.log(JSON.parse(jsonString));
            });
            break;
          default:
            response.writeHead(404);
            response.end(JSON.stringify({ error: "Resource not found" }));
        }
      } else if (request.method == 'GET') {
        console.log('get');
        switch (request.url) {
          case "/home":
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
            break;
          case "/authors":
            response.writeHead(200);
            response.end('not home');
            break;
          default:
            response.writeHead(404);
            response.end(JSON.stringify({ error: "Resource not found" }));
        }
      }
    };

    const server = http.createServer(requestListener);
    server.listen(port, host, () => {
      console.log(`Server is running on http://${host}:${port}`);
      open('http://localhost:8000/home', { app: 'chrome' });
    });

    return { message: 'outputString' };
  }
}
