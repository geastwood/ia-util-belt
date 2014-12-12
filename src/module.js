var api,
    fs      = require('fs'),
    path    = require('path'),
    prompt  = require('prompt'),
    exec    = require('child_process').exec,
    spawn   = require('child_process').spawn,
    IA      = require(__dirname + '/ia'),
    util    = require(__dirname + '/util');

/**
 * called by api
 * @private
 */
var getModuleName = function(fn) {
    prompt.get([{
        name: 'moduleName',
        description: 'What is the module name?',
        message: 'module name can only be of `a-z` (small letters).',
        required: true,
        pattern: /^[a-z]+$/
    }],
    function(err, inputs) {
        if (err) {
            util.print('error', 'error', err);
            return;
        }
        fn(inputs);
    });
},

/**
 * create the module folder
 */
createModule = function(name, fn) {
    var modulePath = resolver.getModuleFolder(name);

    if (fs.existsSync(modulePath)) {
        util.print('error', 'fail', 'Module with the name "%s" exists.', name);
        fn(false);
    } else {
        util.print('info', 'info', 'Module with the name "%s" can be created(no name conflict).', name);
        exec('mkdir ' + modulePath, function(err, stdout) {
            if (err) {
                throw err;
            }
            util.stdout(stdout);
            util.print('success', 'created', 'Folder "%s" is created at %s.', name, path.dirname(modulePath));
            fn(true);
        });
    }
},

                            /*****************/
                            /* path resolver */
                            /*****************/
/**
 * @private
 * @util
 */
resolver = {
    getDefinition: function() {
        return IA().path.getLibBasePath('templates', 'module', 'definitions');
    },
    getLocalMoldule: function() {
        return IA().path.getLibBasePath('templates', 'module');
    },
    getModuleFolder: function(name) {
        return path.join(IA({app: 'frontend', branch: 'trunk'}).path.getBasePath('application', 'modules'), name);
    }
},

/**
 * Process definition
 *
 */
processDefinition = function(name, moduleName) {
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
},

/**
 * receive options from process definition
 *
 * @param {Object} options {definitionName:String, modulePath:String, moduleName:String}
 * @return {Object} Interface, which receive detail of the action
 */
actionFactory = function(options) {
    var moduleFolder = resolver.getModuleFolder(options.moduleName),
        moduleName = options.moduleName;

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
                content = fs.readFileSync(path.join(resolver.getLocalMoldule(), configs.contentFrom), 'utf8');
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
                fromPath = path.join(resolver.getLocalMoldule(), configs.from);

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
 */
api = module.exports = function() {
    return {
        create: function() {
            getModuleName(function(inputs) {
                // create module root folder
                createModule(inputs.moduleName, function(status) {
                    if (!status) {
                        return;
                    }
                    // process definition's action
                    processDefinition('normal', inputs.moduleName);
                });

            });
        }
    };
};
