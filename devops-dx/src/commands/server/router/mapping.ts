import * as util from './util';

const getRouterMap = () => {
    const routerMap = new Map();

    routerMap.set(util.default.getUrlConfig('POST', '/home'), util.default.handlePostRequest);
    routerMap.set(util.default.getUrlConfig('GET', '/home'), util.default.getMainPage);
    routerMap.set(util.default.getUrlConfig('GET', '/loginInfo'), util.default.getLoginInfo);
    routerMap.set(util.default.getUrlConfig('GET', '/companyInfo'), util.default.getCompanyInformation);
    routerMap.set(util.default.getUrlConfig('GET', '/limits'), util.default.getLimits);

    return routerMap;
};

export default { getRouterMap };