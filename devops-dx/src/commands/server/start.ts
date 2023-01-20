import * as os from 'os';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as http from 'http';
import * as open from 'open';
import * as route from './router/main';

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('devops-dx', 'start');

export default class Start extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');
  public static examples = messages.getMessage('examples').split(os.EOL);
  public static args = [{ name: 'file' }];

  protected static flagsConfig = {
    portnumber: flags.string({
      char: 'p',
      description: messages.getMessage('portNumberDescription'),
    })
  };

  protected static requiresUsername = true;
  protected static supportsDevhubUsername = false;
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    const host = 'localhost';
    const port = this.flags.portnumber || 8000;

    const requestListener = function (request, response) {
      console.log(this.org);
      const connection = this.org.getConnection();
      console.log(connection);
      route.default.route(request, response, connection);
    }.bind(this);

    const server = http.createServer(requestListener);
    let message = `Server is running on http://${host}:${port}`;
    server.listen(port, host, () => {
      console.log(message);
      open(`http://${host}:${port}/home`, { app: 'chrome' });
    });

    return { message};
  }
}
