var configs         = require(__dirname + '/../config/config.json');
var homeFolder      = process.env.HOME;
var fs              = require('fs');
var path            = require('path');
var userConfig;
var getUserConfigFolder = function() {
    var parts = [homeFolder, '.ia'];
    [].forEach.call(arguments, function(arg) {
        parts.push(arg);
    });
    return path.join.apply(null, parts);
};

var api = function(opts) {
    var app, branch;
    opts = opts || {};

    // app  = [frontend|backend]
    // branch = [trunk|current|release]
    app = opts.app || 'frontend';
    branch = opts.branch || 'trunk';

    return {
        path: {
            getRootPath: function() {
                var userConfig;
                if (fs.existsSync(path.join(homeFolder, '/.ia/user.config.json'))) {
                    userConfig = require(homeFolder + '/.ia/user.config.json');
                } else {
                    userConfig = {};
                }

                if (userConfig.overwrites && userConfig.overwrites.workingCopies) {
                    return path.join(userConfig.overwrites.workingCopies.baseUrl);
                }
                return path.join(configs.workingCopies.baseUrl);
            },
            getBasePath: function() {
                var parts = [
                    this.getRootPath(),
                    configs.workingCopies.repos[branch][app],
                    configs.workingCopies[app + 'Folder']
                ];
                [].forEach.call(arguments, function(arg) {
                    parts.push(arg);
                });

                return path.join.apply(null, parts);
            },
            calculateAppPath: function(folderName, app) {
                return path.join(this.getRootPath(), folderName, configs.workingCopies[app + 'Folder']);
            },
            getBuildXml: function() {
                return this.getBasePath('build.xml');
            },
            getAppIni: function() {
                return this.getBasePath('application', 'configs', 'application.ini');
            },
            getComponentBuildConfig: function() {
                return this.getBasePath('buildconfig', 'build.jsb2');
            },
            getModuleBuildConfig: function() {
                return this.getBasePath('buildconfig', 'build_modules.jsb2');
            },
            getAppJsFolder: function() {
                return this.getBasePath('application', 'javascripts', 'application');
            },
            getLegacyConfig: function() {
                return this.getBasePath('legacy', 'config', 'user');
            },
            getLibBasePath: function() {
                var base = path.join(__dirname, '/../'), parts = [base];
                [].forEach.call(arguments, function(arg) {
                    parts.push(arg);
                });
                return path.join.apply(null, parts);
            }
        },
        util: {
            getUser: function() {
                userConfig = userConfig || require(homeFolder + '/.ia/user.config.json');
                return userConfig.username;
            },
            getPassword: function() {
                userConfig = userConfig || require(homeFolder + '/.ia/user.config.json');
                return userConfig.password;
            },
            getSvnCommandFlags: function() {
                return ['--username', this.getUser(), '--password', "'" + this.getPassword() + "'", '--no-auth-cache'].join(' ');
            },
            getUserConfigFolder: getUserConfigFolder,
            getScriptFile: function(file) {
                if (!file) {
                    throw 'file must supply';
                }
                return this.getUserConfigFolder('scripts', file);
            },
            getJiraPassword: function() {
                userConfig = userConfig || require(homeFolder + '/.ia/user.config.json');
                return userConfig.jiraPassword;
            }
        }
    };
};

module.exports = function(opts) {
    return api(opts);
};
