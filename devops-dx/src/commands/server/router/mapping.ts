import * as util from './util';

const getRouterMap = () => {
    const routerMap = new Map();

    routerMap.set(util.default.getUrlConfig('POST', '/home'), util.default.handlePostRequest);
    routerMap.set(util.default.getUrlConfig('GET', '/home'), util.default.getMainPage);

    return routerMap;
};

export default { getRouterMap };