PACKAGE = ia
DISTDIR = /usr/local
LIBDIR = $(DISTDIR)/lib
BINDIR = $(DISTDIR)/bin
PACKAGEDIR = $(LIBDIR)/$(PACKAGE)

build: clean
	@if [ ! -d ~/.ia ]; then mkdir -p ~/.ia; echo "Create User config folder ~/.ia"; fi
	@mkdir -p $(PACKAGEDIR)
	@echo "PACKAGE EXTRACTED TO: \""$(PACKAGEDIR)\"
	@cp -r * $(PACKAGEDIR)
	@cd $(PACKAGEDIR)
	@npm install
	@mkdir -p ~/.ia/scripts
	@cp -r scripts/* ~/.ia/scripts
	@ln -s $(PACKAGEDIR)/ia.js $(BINDIR)/$(PACKAGE)

clean:
	@rm -Rf $(PACKAGEDIR)
	@rm -Rf $(BINDIR)/$(PACKAGE)

.PHONY: build
