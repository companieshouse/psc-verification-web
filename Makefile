artifact_name       := psc-verification-web
version             := "unversioned"

.PHONY: all
all: build

.PHONY: clean
clean:
	rm -f ./$(artifact_name)-*.zip
	rm -rf ./build-*
	rm -rf ./dist
	rm -f ./build.log

.PHONY: build
build: clean submodules
	export GIT_SSH_COMMAND="ssh" && npm ci
	npm run build

.PHONY: lint
lint:
	npm run lint

.PHONY: sonar
sonar: test
	npm run sonarqube

.PHONY: test
test:
	npm run coverage

.PHONY: test-unit
test-unit:
	npm run test

.PHONY: security-check
security-check:
	npm audit --audit-level=high

.PHONY: package
package: build
ifndef version
	$(error No version given. Aborting)
endif
	$(info Packaging version: $(version))
	$(eval tmpdir := $(shell mktemp -d build-XXXXXXXXXX))
	cp -r ./dist/* $(tmpdir)
	cp -r ./package.json $(tmpdir)
	cp -r ./package-lock.json $(tmpdir)
	cp -r ./locales $(tmpdir)
	mkdir $(tmpdir)/api-enumerations
	cp -r ./api-enumerations/*.yml $(tmpdir)/api-enumerations
	cp ./routes.yaml $(tmpdir)
	cd $(tmpdir) && export GIT_SSH_COMMAND="ssh" && npm ci --production
	rm $(tmpdir)/package.json $(tmpdir)/package-lock.json
	cd $(tmpdir) && zip -r ../$(artifact_name)-$(version).zip .
	rm -rf $(tmpdir)

.PHONY: dist
dist: lint test clean package

.PHONY: submodules
submodules:
	git submodule init
	git submodule update