// Auth against a flat file
var net_utils = require('./net_utils');

exports.register = function () {
    this.inherits('auth/auth_base');
}

exports.hook_capabilities = function (next, connection) {
    var config = this.config.get('auth_flat_file.ini');
    // don't allow AUTH unless private IP or encrypted or explicitly allowed in config file
    if (!net_utils.is_rfc1918(connection.remote_ip) &&
        !connection.using_tlsc &&
        !config.core.allow_public_ip_unsecure_auth === 'true') return next();
    var methods = (config.core && config.core.methods ) ? config.core.methods.split(',') : null;
    if(methods && methods.length > 0) {
        connection.capabilities.push('AUTH ' + methods.join(' '));
        connection.notes.allowed_auth_methods = methods;
    }
    next();
};

exports.get_plain_passwd = function (user, cb) {
    var config = this.config.get('auth_flat_file.ini');
    if (config.users[user]) {
        return cb(config.users[user]);
    }
    return cb();
}
