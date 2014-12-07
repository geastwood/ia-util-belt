var configs = require(__dirname + '/../config/config.json'),
    path = require('path'),
    homeFolder = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    userConfig;

var resolver = function(opts) {
    opts = opts || {};

    var app  = opts.app || 'frontend',
        branch = opts.branch || 'trunk';

    return {
        path: {
            // app  = [frontend|backend]
            // branch = [trunk|current|release]
            getRootPath: function() {
                return path.join(configs.workingCopies.baseUrl);
            },
            getBasePath: function() {
                var parts = [this.getAppPath(), configs.workingCopies[branch][app]];
                [].forEach.call(arguments, function(arg) {
                    parts.push(arg);
                });
                return path.join.apply(null, parts);
            },
            getAppPath: function() {
                var folder = configs.workingCopies.frontendFolder;
                if (app === 'service') {
                    folder = configs.workingCopies.serviceFolder;
                }
                return path.join(configs.workingCopies.baseUrl, folder);
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
                return userConfig.user;
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
                var config = {username: userConfig.user};
                return (configs.cvs.svn.userUrl + configs.cvs.svn[app] + '/').replace(/\{\{(\S+)}}/, function(a, match) {
                    return config[match];
                });
            }
        }
    };
};

module.exports = function(opts) {
    return resolver(opts);
};
