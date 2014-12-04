var configs = require(__dirname + '/../config/config.json'),
    path = require('path'),
    homeFolder = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    userConfig = require(homeFolder + '/.ia/user.config.json');

var resolver = function(data, opts) {

    var app  = opts.app || 'frontend',
        repo = opts.repo || 'trunk';

    return {
        path: {
            // app  = [frontend|backend]
            // repo = [trunk|current|release]
            getBasePath: function() {
                var folder = data.workingCopies.frontendFolder;
                if (app === 'backend') {
                    folder = data.workingCopies.backendFolder;
                }
                return path.join(data.workingCopies.baseUrl, folder, data.workingCopies[repo][app]);
            },
            getAppIni: function() {
                return this.getBasePath() + '/application/configs/application.ini';
            },
            getComponentBuildConfig: function() {
                return this.getBasePath() + '/buildconfig/build.jsb2';
            },
            getModuleBuildConfig: function() {
                return this.getBasePath() + '/buildconfig/build_modules.jsb2';
            }
        },
        jira: {
            getBaseUrl: function() {
                return data.jira.baseUrl;
            },
            getTicketView: function() {
                return this.getBaseUrl() + '/browse/';
            }
        },
        util: {
            getUser: function() {
                return userConfig.user;
            },
            isTruckFolder: function(path) {
                return path.indexOf(data.workingCopies.trunk.frontend) >= 0  ||
                       data.workingCopies.trunk.backend === path;
            }
        },
        svn: {
            getBase: function() {
                return data.cvs.svn.url + data.cvs.svn[app];
            },
            getBranchFolder: function() {
                return this.getBase() + '/branches';
            },
            getUserBranchFolder: function() {
                var config = {username: userConfig.user};
                return (data.cvs.svn.userUrl + data.cvs.svn[app] + '/').replace(/\{\{(\S+)}}/, function(a, match) {
                    return config[match];
                });
            }
        }
    };
};

module.exports = resolver(configs, {app: 'frontend'});
