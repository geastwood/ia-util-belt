# IA Utility belt

## How to install

1. **node** needs to be installed first.
2. `git clone http://git-1.rz1.intelliad.com/fliu/ia-util-belt.git`
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
*   **branch [options] <cmd>**    svn branch commands [checkout|switch]
*   **build [options]**           Build process releated command
*   **watch [options]**           small watch function, watch `application/javascripts` folder for changes, if there is a change
trigger the build process. If there is a change within the build process, the build process will restart.
*   **devmode [options] <cmd>**   [on|off|is] switch dev mode
*   **buildconfig [options]**     build config related commands
*   **find [options] <pattern>**  a `grep` wrapper
*   **apache <cmd>**              apache commands
*   **module <cmd>**              contains frontend module related functions, e.g, create empty module

#### Overview

| command | subcommand | flags  | examples |
| -------- | -------- | ------- | --------- |
| **runscript**     | n/a   |  `-f --file` specify the script name to run  | `ia runscript -f dev_dependency.sh` // run a custom shell script |
| **setup**         | n/a  |  n/a    | n/a |
| **branch**        | `checkout`, `switch` | `-t --trunk`, if specified, no **branches** will be prompt | `ia branch checkout --trunk` |
| **build**         | n/a | `-t --trunk`, `-c --current`, `-r --release`, `-f --frontent`, `-s --service`,`-p --part`, `-d --development`, `-l --legacy`, `-v --serviceclient`, `-m --module` | `ia build -ftd` |
| **watch**         | n/a  |`-t --trunk`, `-c --current`, `-r --release` | `ia watch -t` // watch for `trunk/frontend/application/javascripts` |
| **devmode**       | `ls`, `on`, `off`  |`-t --trunk`, `-c --current`, `-r --release` | `ia devmode -t is` // check the devmode of `trunk`|
| **apache**        | `start`, `stop`, `restart` (support all apache commands, here lists the often-used ones)|n/a| `ia apache restart` // restart apache2 service|
| **module**        | `create` |n/a| `ia module create` // create empty frontend module|

### Get help by `-h` or `--help`

It's always possible specify `-h` or `--help` for a detailed help section. For example

`ia -h` // will show an overview of this cli tool
`ia build -h` // will show an overview off all `build` command

## How to update

1. navigate to the folder where it has the git repo, or clone the latest repo from git server[(How to install)](#how-to-install)
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
* 2014-12-16 (Add) auto complete basic commands
* 2014-12-16 (Modify) better auto complete
* 2014-12-16 (Fix) escape svn password
* 2014-12-16 (Fix) hide the password                                (v0.1.14)
* 2014-12-16 (Fix) fix a bug of build command
* 2014-12-16 (Modify) remove devmode underscore
* 2014-12-16 (Modify) add more help on build command
* 2014-12-16 (Modify) add `application.log` on service checkout     (v0.1.15)
* 2014-12-16 (Add) add working copies folder overwrite
* 2014-12-17 (Fix) replace all prompt colors                        (v0.1.16)


## Host
* `frontend.trunk.local`
* `services.trunk.local`

---

* `frontend.current.local`
* `services.current.local`

---

* `frontend.release.local`
* `services.release.local`
