import * as util from './util';
import * as mapping from './mapping';

const route = (request, response, connection) => {
    const routerMap = mapping.default.getRouterMap();

    if (routerMap.has(util.default.getUrlConfig(request.method, request.url))) {
        routerMap.get(util.default.getUrlConfig(request.method, request.url))(request, response, connection);
        return;
    }

    response.writeHead(404);
    response.end(JSON.stringify({ error: "Resource not found" }));
};

export default { route };