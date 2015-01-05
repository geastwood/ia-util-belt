SHELL := /bin/bash
PACKAGE = ia
DISTDIR = /usr/local
LIBDIR = $(DISTDIR)/lib
BINDIR = $(DISTDIR)/bin
PACKAGEDIR = $(LIBDIR)/$(PACKAGE)
TICKETDIR = $(PACKAGEDIR)/lib/ticket-template-core

linux: clean base
	@echo "build for linux"
	@rm -Rf /etc/bash_completion.d/ia
	@echo 'Copy autocomplete file to /etc/bash_completion.d/ia'
	@cp autocomplete/ia /etc/bash_completion.d/ia

mac: clean base
	@echo "build for mac"
	@sed -i '' 's/var pageSize = 7/var pageSize = 100/' $(PACKAGEDIR)/node_modules/inquirer/lib/objects/choices.js
	@sed -i '' 's/var pageSize = 7/var pageSize = 100/' $(TICKETDIR)/node_modules/inquirer/lib/objects/choices.js

base:
	@if [ ! -d ~/.ia ]; then mkdir -p ~/.ia; echo "Create User config folder ~/.ia"; fi
	@mkdir -p $(PACKAGEDIR)
	@echo "PACKAGE EXTRACTED TO: \""$(PACKAGEDIR)\"
	@cp -r * $(PACKAGEDIR)
	@cd $(PACKAGEDIR); npm install
	@mkdir -p ~/.ia/scripts
	@mkdir -p ~/.ia/data/templates
	@echo 'Copy scripts to user folder'
	@cp -r scripts/* ~/.ia/scripts
	@ln -s $(PACKAGEDIR)/ia.js $(BINDIR)/$(PACKAGE)
	@echo 'Installing dependency at '$(TICKETDIR)
	@cd $(TICKETDIR); npm install

clean:
	@echo 'Remove old packages and link'
	@rm -Rf $(PACKAGEDIR)
	@rm -Rf $(BINDIR)/$(PACKAGE)

.PHONY: build
