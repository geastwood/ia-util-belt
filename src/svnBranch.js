var BranchInfo = function(raw) {
    this.raw = raw;
    this.lines = [];
};
BranchInfo.prototype.collect = function() {
    if (this.lines.length === 0) {
        this.lines = this.raw.split(/\n/).filter(function(line) {
            return line.length > 0;
        }).map(function(line) {
            var sepIndex;
            line = line.trim();
            sepIndex = line.indexOf(':'); // find the first `:`, split from there

            return {
                name: line.slice(0, sepIndex).trim(),
                value: line.slice(sepIndex + 1, line.length).trim()
            };
        });
    }
    return this.lines;

};
BranchInfo.prototype.getByName = function(name) {
    var map = {
        "path"          : "Path",
        "rootPath"      : "Working Copy Root Path",
        "url"           : "URL",
        "relativeUrl"   : "Relative URL",
        "repoRoot"      : "Repository Root",
        "repoUUID"      : "Repository UUID",
        "revision"      : "Revision",
        "nodeKind"      : "Node Kind",
        "schedule"      : "Schedule",
        "lcAuthor"      : "Last Changed Author",
        "lcRev"         : "Last Changed Rev",
        "lcDate"        : "Last Changed Date"
    }, rst = null;

    rst = this.collect().filter(function(row) {
        return row.name === map[name];
    });

    return rst;
};

/**********/
/* BRANCH */
/**********/
var Branches = function(raw) {
    this.raw = raw;
    this.lines = [];
};

Branches.prototype.collect = function() {
    var folderReg = /[^.]\/$/, raw = this.raw;

    if (this.lines.length === 0) {
        this.lines = raw.split('\n').map(function(line) {
            line = line.trim();
            if (folderReg.test(line)) {
                return new BranchLine(line);
            }
            return null;
        }).filter(function(line) {
            return line !== null;
        });
    }
    return this.lines;
};
Branches.prototype.getRawOuput = function() {
    return this.raw;
};
Branches.prototype.format = function() {
    var prefix = 'Branch #';

    // if is empty, collect data first
    if (this.lines.length === 0) {
        this.collect();
    }

    return this.lines.map(function(line) {
        var month = line.getByName('month'),
            day = line.getByName('day'),
            year = line.getByName('time'),
            branchName = line.getByName('branch');

        year = year.indexOf(':') === -1 ? year : (new Date()).getFullYear();

        return {
            branch: branchName.slice(0, branchName.length - 1), // trim the `/` at end
            date: [month, day, year].join(' ')
        };
    }).sort(function(a, b) { // sort them according to `date`
        return Date.parse(b.date) - Date.parse(a.date);
    }).map(function(entry, count) {
        return {
            prefix: prefix + (count + 1),
            branch: entry.branch, date: entry.date
        };
    });
};

var BranchLine = function(line) {
    this.line = line;
    this.parts = [];
};

BranchLine.prototype.getByName = function(name) {
    var rst = null;
    if (this.parts.length === 0) {
        this.parse();
    }
    this.parts.some(function(part) {
        if (part.name === name) {
            rst = part.value;
            return true;
        }
    });

    return rst;
};

BranchLine.prototype.parse = function() {
    var parts, columns;
    if (this.parts.length > 0) {
        return this.parts;
    } else {
        parts = this.line.split(/\s+/).map(function(part) {
            return part.trim();
        });
        columns = ['revision', 'author', 'month', 'day', 'time', 'branch'];
        this.parts = columns.map(function(column, i) {
            return { name: column, value: parts[i] };
        });
        return this.parts;
    }
};
var LocalBranches = function(path, app) {
    this.path = path || '/Volumes/intelliAd/Frontend/';
    this.app = app || 'frontend';
    this.branches = [];
};
LocalBranches.prototype.collect = function() {
    var fs = require('fs');
    var path = require('path');
    var that = this, files;

    if (this.branches.length === 0) {
        files = fs.readdirSync(this.path);
        this.branches = files.filter(function(file) {
            var stat = fs.statSync(path.join(that.path, file));
            return stat && stat.isDirectory();
        });
    }

    return this.branches;
};
LocalBranches.prototype.format = function() {
    var that = this;
    return this.collect().map(function(file) {
        return {path: that.path, filename: file};
    });
};
// var t = new LocalBranches();
// console.log(t.format());

module.exports.Branches = Branches;
module.exports.BranchInfo = BranchInfo;
