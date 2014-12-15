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
	echo 'Copy scripts to user folder'
	@cp -r scripts/* ~/.ia/scripts
	@ln -s $(PACKAGEDIR)/ia.js $(BINDIR)/$(PACKAGE)
	@rm -Rf /etc/bash_completion.d/ia
	@if [[ $(SHELL) == *'sh'* ]] || [[ $(SHELL) == *'bash'* ]]; then \
		echo 'Copy autocomplete file to /etc/bash_completion.d/ia'; \
		@cp autocomplete/ia /etc/bash_completion.d/ia; \
		fi

clean:
	echo 'Remove old packages and link'
	@rm -Rf $(PACKAGEDIR)
	@rm -Rf $(BINDIR)/$(PACKAGE)

.PHONY: build
