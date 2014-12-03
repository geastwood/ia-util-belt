var readline = require('readline'),
    fileSystem = require('fs'),
    reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }),
    frontendPath = "/data/intelliAd/Frontend/Release/",
    servicePath = "/data/intelliAd/Service/Release/",
    majorRelease,
    minorRelease,
    calendarWeek,
    fullVersion,
    releaseVersions = {};

console.log('[1] create new release');
console.log('[2] switch to release');
console.log('[3] remove release');
console.log('[4] list all releases');

reader.question('operation: ', function(data) {
    switch (parseInt(data, 10)) {
        case 1 :
            createNewRelease();
            break;
        case 2:
            listRelease(switchToRelease);
            break;
        case 3:
            listRelease(removeRelease);
            break;
        case 4:
            listRelease();
            break;
        default :
            console.log('unknown operation');

        process.exit();
    }
});

listRelease = function(callback) {
    var key;
    fileSystem.readdir(frontendPath, function(error, data) {
        for (key in data) {
            folder = data[key];

            releaseVersions[key] = data[key];
        }

        if (callback == undefined) {
            process.exit();
        } else {
            printVersion();
            callback();
        }
    });
};

printVersion = function(){
    for(element in releaseVersions){
        console.log("["+ element +"]\t" + releaseVersions[element]);
    }
}

switchToRelease = function() {
    reader.question('switch to version: ', function(data) {
        var versionNumber = releaseVersions[data];

        switchSymlinks(frontendPath, versionNumber);
        switchSymlinks(servicePath, versionNumber);

        process.exit();
    });
};

removeRelease = function() {
    reader.question('delete version: ', function(data) {
        var versionNumber = releaseVersions[data];

        removeLink(frontendPath, versionNumber);
        removeLink(servicePath, versionNumber);

        process.exit();
    });
};

createNewRelease = function() {
    reader.question('major release: ', function(data) {
        majorRelease = data;

        reader.question('minor release: ', function(data) {
            minorRelease = data;

            reader.question('calendar week: ', function(data) {
                calendarWeek = data;

                fullVersion = createFullVersionName();

                createStructure(frontendPath, fullVersion);
                createStructure(servicePath, fullVersion);

                process.exit();
            });
        });
    });
};

createFullVersionName = function() {
    return majorRelease + "." + minorRelease + "." + calendarWeek + "/";
};

createStructure = function(path, version) {
    fileSystem.mkdir(path + version);

    switchSymlinks(path, version);
};

switchSymlinks = function(path, version) {
    fileSystem.unlink(path + '../Current');
    fileSystem.symlink(path + version, path + '../Current');
};

removeLink = function(path, version) {
    fileSystem.rmdir(path + version);
};

