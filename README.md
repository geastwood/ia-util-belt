# IA Utility belt

## How to install

1. **node** needs to be installed first.
2. `git clone --recursive http://git-1.rz1.intelliad.com/fliu/ia-util-belt.git ia`
3. `cd ia`
4. `make` // make the execuable

## How to use

### Global flags

There are two sets of global conventions used in this tool, defining **application** and **branch** respectively.

1. which application **frontend** or **service**?

    * `-f --frontend`
    * `-s --service`


2. which branch/environment **trunk**, **current** or **release**?

    * `-t --trunk`
    * `-c --current`
    * `-r --release`

**Examples**

* ia build `-ft` => means build **frontend** **trunk**
* ia build `-sc` => means build **service** **current**
* ia devmode `-t` is => means to show the status of **trunk** devmode, return either **ON** or **OFF**

### Available commands

Here list all the commands available of this utility tool. They are

*   **runscript [options]**       =>    run a user specified script
*   **setup**                     walk thought some very basic setup steps
*   **branch [options] <cmd>**    svn branch commands [checkout|switch|update]
*   **build [options]**           Build process releated command
*   **watch [options]**           small watch function, watch `application/javascripts` folder for changes, if there is a change
trigger the build process. If there is a change within the build process, the build process will restart.
*   **devmode [options] <cmd>**   [on|off|is] switch dev mode
*   **buildconfig [options]**     build config related commands
*   **find [options] <pattern>**  a `grep` wrapper exclude some temp folders, such as *library*, *legacy*, *test*, *.svn*
*   **apache <cmd>**              apache commands wrapper, delegate to service apache2
*   **module <cmd>**              contains frontend module related functions, e.g, create empty module

#### Overview

| command | subcommand | flags  | examples |
| -------- | -------- | ------- | --------- |
| **runscript**     | n/a   |  `-f --file` specify the script name to run, `-a -args` specify arguments for script, `-s --slience` disable interactive mode | `ia runscript -f dev_dependency.sh` // run a custom shell script |
| **setup**         | n/a  |  n/a    | n/a |
| **branch**        | `checkout`, `switch`, `update` | `-t --trunk`, if specified, no **branches** will be prompt | `ia branch checkout --trunk` |
| **build**         | n/a | `-t --trunk`, `-c --current`, `-r --release`, `-f --frontend`, `-s --service`,`-p --part`, `-d --development`, `-l --legacy`, `-v --serviceclient`, `-m --module` | `ia build -ftd` |
| **watch**         | n/a  |`-t --trunk`, `-c --current`, `-r --release` | `ia watch -t` // watch for `trunk/frontend/application/javascripts` |
| **devmode**       | `ls`, `on`, `off`  |`-t --trunk`, `-c --current`, `-r --release` | `ia devmode -t is` // check the devmode of `trunk`|
| **apache**        | `start`, `stop`, `restart` (support all apache commands, here lists the often-used ones)|n/a| `ia apache restart` // restart apache2 service|
| **module**        | `create` | n/a | `ia module create` // create empty frontend module|
| **buildconfig**   | n/a | `-g --grep <string>`, `-d --delete`, `-m --module`, `-t --trunk'`, `-r --release`, `-c --current` | `ia buildconfig -tgd google` // prompt to delete module contains name *google* in build config file|
| **find**          | n/a | `-d --definition`, `-f --frontend`, `-s --service`, `-t --trunk`, `-r --release`, `-c --current`| `ia find -dt google` // find in frontend trunk Ext classes name contains *google*|

#### `runscript` command

To exec script using *runscript* command a file must be specified, e.g. *ia runscript -f debug.sh*. All scripts file are located under *~/.ia/scripts/*. If to pass additional arguments, specify **-a** flag, e.g. *ia runscript -f debug.sh -a 'path/to/a/file'*

There are two types of scripts can be run with this command,

1. .sh => bash scripts
2. .js => javasript script

All predefined scripts are under [scripts](scripts), which will be copied to *~/.ia/scripts* folder during **make** process. When this command is run, it will search scripts by name in *~/ia/scripts* folder.

**Often used script**

* `ia runscript -s -f clean_repo.sh -a "current"` // remove **frontend** and **services** from /data/intelliad/current/
* `ia runscript -s -f clean_repo.sh -a "release"` // remove **frontend** and **services** from /data/intelliad/current/
* `ia runscript -f fr_post_checkout.js` // add two user config `config.user.php` and `config.important.inc.php`
* `ia runscript -f service_post_checkout.js` // create **log/application.log** chmod `log` folder recursively

### Get help by `-h` or `--help`

It's always possible specify `-h` or `--help` for a detailed help section. For example

* `ia -h` // will show an overview of this cli tool
* `ia build -h` // will show an overview off all `build` command

## How to update

1. navigate to the folder where you have the git repo, or clone the latest repo from git server[(How to install)](#how-to-install)
2. `make` which will clean the symbolic link and lib folder, copy again files to library folder.
It will not touch user config file under `~/.ia`, it may copy additional *scripts* to `~/.ia/scripts` folder

## Where it installed

* library at `/usr/local/lib/ia`
* user specific config under `~/.ia/`
* symbolic link `/usr/local/bin/ia -> /usr/local/lib/ia`

The library folder `ia` is created under `/usr/local/lib/` during `make` command, all library files are copied.
`~/.ia` contains user specific data


## Changelog
* 2014-12-12 (Add) create module via script
* 2014-12-15 (Add) auto complete basic commands
* 2014-12-15 (Modify) better auto complete
* 2014-12-15 (Fix) escape svn password
* 2014-12-15 (Fix) hide the password                                (v0.1.14)
* 2014-12-15 (Fix) fix a bug of build command
* 2014-12-15 (Modify) remove devmode underscore
* 2014-12-15 (Modify) add more help on build command
* 2014-12-15 (Modify) add `application.log` on service checkout     (v0.1.15)
* 2014-12-16 (Add) add working copies folder overwrite
* 2014-12-16 (Fix) replace all prompt colors                        (v0.1.16)
* 2014-12-17 (Add) Add remove repo scripts                          (v0.1.17)
* 2014-12-17 (Add) Add frontend and service config && chmod log     (v0.1.18)
* 2014-12-17 (Add) Add `ia branch update` for updating rpos         (v0.1.20)
* 2014-01-05 (Add) Add ticket template related functions            (v0.1.21)
