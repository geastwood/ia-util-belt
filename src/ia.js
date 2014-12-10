var configs = require(__dirname + '/../config/config.json'),
    homeFolder = process.env.HOME,
    path = require('path'),
    userConfig,
    getUserConfigFolder = function() {
        var parts = [homeFolder, '.ia'];
        [].forEach.call(arguments, function(arg) {
            parts.push(arg);
        });
        return path.join.apply(null, parts);
    };

var api = function(opts) {
    opts = opts || {};

    // app  = [frontend|backend]
    // branch = [trunk|current|release]
    var app  = opts.app || 'frontend',
        branch = opts.branch || 'trunk';

    return {
        path: {
            getRootPath: function() {
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
            }
        },
        jira: {
            getBaseUrl: function() {
                return configs.jira.baseUrl;
            },
            getTicketView: function() {
                return this.getBaseUrl() + '/browse/';
            }
        },
        util: {
            getUser: function() {
                userConfig = require(homeFolder + '/.ia/user.config.json');
                return userConfig.username;
            },
            getPassword: function() {
                userConfig = require(homeFolder + '/.ia/user.config.json');
                return userConfig.password;
            },
            getSvnCommandFlags: function() {
                return ['--username', this.getUser(), '--password', this.getPassword(), '--no-auth-cache'].join(' ');
            },
            getUserConfigFolder: getUserConfigFolder,
            getScriptFile: function(file) {
                if (!file) {
                    throw 'file must supply';
                }
                return this.getUserConfigFolder('scripts', file);
            },
            isTruckFolder: function(path) {
                return path.indexOf(configs.workingCopies.trunk.frontend) >= 0  ||
                       configs.workingCopies.trunk.backend === path;
            }
        },
        svn: {
            getBase: function() {
                return configs.cvs.svn.url + configs.cvs.svn[app];
            },
            getBranchFolder: function() {
                return this.getBase() + '/branches';
            },
            getUserBranchFolder: function() {
                userConfig = require(homeFolder + '/.ia/user.config.json');
                var config = {username: userConfig.username};
                return (configs.cvs.svn.userUrl + configs.cvs.svn[app] + '/').replace(/\{\{(\S+)}}/, function(a, match) {
                    return config[match];
                });
            }
        }
    };
};

module.exports = function(opts) {
    return api(opts);
};
