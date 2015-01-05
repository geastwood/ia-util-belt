SHELL := /bin/bash
PACKAGE = ia
DISTDIR = /usr/local
LIBDIR = $(DISTDIR)/lib
BINDIR = $(DISTDIR)/bin
PACKAGEDIR = $(LIBDIR)/$(PACKAGE)
TICKETDIR = $(PACKAGEDIR)/lib/ticket-template-core/

build: clean
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
	@rm -Rf /etc/bash_completion.d/ia
	@if [[ $(SHELL) == "bin/sh" ]] || [[ $(SHELL) == "bin/bash" ]]; then \
		echo 'Copy autocomplete file to /etc/bash_completion.d/ia'; \
		cp autocomplete/ia /etc/bash_completion.d/ia; \
		fi
	@echo 'Installing dependency at '$(TICKETDIR)
	@cd $(TICKETDIR); npm install
	# super hacky
	@cd $(PACKAGEDIR); sed -i '' 's/var pageSize = 7/var pageSize = 100/' node_modules/inquirer/lib/objects/choices.js
	@cd $(TICKETDIR); sed -i '' 's/var pageSize = 7/var pageSize = 100/' lib/ticket-template-core/node_modules/inquirer/lib/objects/choices.js

clean:
	echo 'Remove old packages and link'
	@rm -Rf $(PACKAGEDIR)
	@rm -Rf $(BINDIR)/$(PACKAGE)

.PHONY: build
