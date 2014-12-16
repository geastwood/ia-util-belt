# IA Utility belt

## How to install

1. **node** needs to be installed first.
2. `git clone http://git-1.rz1.intelliad.com/fliu/ia-util-belt.git`
3. `cd ia`
4. `make` // make the execuable

## How to update

1. go to the folder where it has the git repo, or clone the latest repo from git server[(How to install)](README#how-to-install)

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
