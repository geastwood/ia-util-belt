var fs          = require('fs');
var path        = require('path');
var inquirer    = require('inquirer');
var Q           = require('q');
var exec        = require('child_process').exec;
var spawn       = require('child_process').spawn;
var IA          = require('./ia');
var util        = require('./util');
var api;

/**
 * path resolver
 * @private
 * @util
 */
var resolver = {
    getDefinition: function() {
        return IA().path.getLibBase('templates', 'module', 'definitions');
    },
    getLocalModule: function() {
        return IA().path.getLibBase('templates', 'module');
    },
    getModuleFolder: function(name) {
        return path.join(IA({app: 'frontend', branch: 'trunk'}).path.getBase('application', 'modules'), name);
    }
};

/**
 * get Module Name in async mode
 * @returns {promise|*|Q.promise}
 */
var getModuleName = function() {
    var defer = Q.defer();
    inquirer.prompt([{
        name: 'moduleName',
        message: 'What is the module name?',
        validate: function(v) {
            var pattern = /^[a-z]+$/;
            if (!pattern.test(v)) {
                return 'module name can only be of `a-z` (small letters).';
            }
            return true;
        }
    }], function(answers) {
        defer.resolve(answers.moduleName);
    });

    return defer.promise;
};

/**
 * create module
 *
 * @param {String} name
 * @returns {Promise}
 */
var createModule = function(name) {
    var defer = Q.defer();
    var modulePath = resolver.getModuleFolder(name);

    fs.exists(modulePath, function(exists) {
        defer[ exists ? 'reject' : 'resolve' ](name);
    });

    return defer.promise.then(function(name) {
        util.print('info', 'info', 'Module with the name "%s" can be created(no name conflict).', name);
        exec('mkdir ' + modulePath, function(err, stdout) {
            if (err) {
                throw err;
            }
            util.stdout(stdout);
            util.print('success', 'created', 'Folder "%s" is created at %s.', name, path.dirname(modulePath));
            processDefinition('normal', name);
        });
    }).catch(function(name) {
        util.print('error', 'fail', 'Module with the name "%s" exists.', name);
    });
};

/**
 * Process definition
 */
var processDefinition = function(name, moduleName) {
    var definition = require(path.join(resolver.getDefinition(), name)),
        defName = definition.name,
        actions = definition.actions;

    util.print('info', 'info', 'Processing definition "%s".', defName);
    actions.forEach(function(action) {
        // TODO add check on available actions
        actionFactory({
            definitionName: defName,
            moduleName: moduleName,
            modulePath: resolver.getModuleFolder(moduleName)
        })[action.type](action);
    });
};

/**
 * receive options from process definition
 *
 * @param {Object} options {definitionName:String, modulePath:String, moduleName:String}
 * @return {Object} Interface, which receive detail of the action
 */
var actionFactory = function(options) {
    var moduleFolder = resolver.getModuleFolder(options.moduleName);

    return {
        createFolder: function(configs) {
            var targetPath = path.join(moduleFolder, configs.target);

            util.print('info', 'create', 'Creating folder "%s".', configs.target);

            exec('mkdir -p ' + targetPath, function(err, stdout) {
                if (err) {
                    throw 'create(mkdir) failed.';
                }
                util.stdout(stdout);
                util.print('success', 'created', 'Folder "%s".', configs.target);
            });
        },
        createFile: function(configs) {
            var targetFile, // filename
                targetPath, // full path to module
                content = configs.content || '/* Created by script at ' + (new Date()) + '*/';

            if (configs.dynamicName) {
                targetFile = util.interpolate(configs.target, options);
            } else {
                targetFile = configs.target;
            }

            if (configs.contentFrom) {
                content = fs.readFileSync(path.join(resolver.getLocalModule(), configs.contentFrom), 'utf8');
                content = util.interpolate(content, options);
            }

            targetPath = path.join(moduleFolder, targetFile);

            if (!fs.existsSync(targetPath)) {
                spawn('mkdir', ['-p', path.dirname(targetPath)]);
            }

            util.print('info', 'create', 'Creating file "%s".', targetFile);
            exec(['touch', targetPath].join(' '), function(err, stdout) {
                if (err) {
                    throw 'create file(touch) failed.';
                }
                fs.writeFileSync(targetPath, content, 'utf8');
                util.stdout(stdout);
                util.print('success', 'file created', 'File "%s" is created.', targetFile);
            });
        },
        copy: function(configs) {
            var targetPath = path.join(moduleFolder, configs.target),
                fromPath = path.join(resolver.getLocalModule(), configs.from);

            util.print('info', 'copy', 'Copy file "%s" to "%s".', configs.from, configs.target);
            exec(['cp', fromPath, targetPath].join(' '), function(err, stdout) {
                if (err) {
                    throw 'copy(cp) failed.';
                }
                util.stdout(stdout);
                util.print('success', 'copied', 'file "%s" is copied to "%s".', configs.from, configs.target);
            });
        }
    };
};

/**
 * @public
 * @type {Function}
 */
api = module.exports = function() {
    return {
        create: function() {
            getModuleName().then(createModule);
        }
    };
};
