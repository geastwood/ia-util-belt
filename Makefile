HASNODEJS = $(if $(shell test -f /usr/bin/nodejs && echo "true"), "true", "false");

PACKAGE = 'ia'
DISTDIR = '/usr/local/'
LIBDIR = $(DISTDIR)/lib
NODEPATH = '/usr/local/bin/node'

build:
	@if [ ! -x $(NODEPATH) ]; then echo "not"; else echo "good"; fi
	echo $(HASNODEJS)
	echo "fei"

.PHONY: build

