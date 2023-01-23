const LIMIT_MAX_THRESHOLD_WARNING = 60;
const LIMIT_MAX_THRESHOLD_ALERT = 90;

const ENDPOINT_LIMITS = '/services/data/v56.0/limits';
const ENDPOINT_TRUST_STATUS = 'https://api.status.salesforce.com/v1/instances/{instanceName}/status';

export default { LIMIT_MAX_THRESHOLD_WARNING, LIMIT_MAX_THRESHOLD_ALERT, ENDPOINT_LIMITS, ENDPOINT_TRUST_STATUS };