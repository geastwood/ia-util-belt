var configs         = require(__dirname + '/../config/config.json');
var homeFolder      = process.env.HOME;
var fs              = require('fs');
var path            = require('path');
var userConfig;

var getUserConfigFolder = function(homeFolder) {

    return function() {
        var args = [].reduce.call(arguments, function(rst, arg) {
            rst.push(arg);
            return rst;
        }, [homeFolder, '.ia']);
        return path.join.apply(null, args);
    };
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
            getRoot: function() {
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
            getBase: function() {
                var parts = [
                    this.getRoot(),
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
                return this.getBase('build.xml');
            },
            getAppIni: function() {
                return this.getBase('application', 'configs', 'application.ini');
            },
            getComponentBuildConfig: function() {
                return this.getBase('buildconfig', 'build.jsb2');
            },
            getModuleBuildConfig: function() {
                return this.getBase('buildconfig', 'build_modules.jsb2');
            },
            getAppJsFolder: function() {
                return this.getBase('application', 'javascripts', 'application');
            },
            getLegacyConfig: function() {
                return this.getBase('legacy', 'config', 'user');
            },
            getLibBase: function() {
                return path.join.apply(null, [].reduce.call(arguments, function(rst, arg) {
                    rst.push(arg);
                    return rst;
                }, [path.join(__dirname, '/../')]));
            }
        },
        util: {
            getUser: function() {
                userConfig = userConfig || require(homeFolder + '/.ia/user.config.json');
                return userConfig.username;
            },
            getUserConfigFolder: getUserConfigFolder(process.env.HOME),
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
