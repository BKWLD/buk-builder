# Define vars
BUILDER = cd build && node buk-builder
DIST_DIR = public/dist

# Run builder for local development
# `make` or `make dev`
# builder options:
#   mode=(banner|build)
#   label=text
#   base=path
#   config=file.js
.PHONY: dev
dev:
	@ $(BUILDER) mode=banner label=development
	@ make sass clean
	@ $(BUILDER) config=config/builder.js

# Create a build with file hashing for production
# `make build`
.PHONY: build
build:
	@ $(BUILDER) mode=banner label=build
	@ make sass clean
	@ $(BUILDER) mode=build config=config/builder.js
	@ git add $(DIST_DIR)

# Pre-process sass files to get latest css
# `make sass`
.PHONY: sass
sass:
	@ echo -- pre-process sass files
	@ compass compile
	
# Remove js / css files in the dist directory
# `make clean`
.PHONY: clean
clean:
	@ if [ ! -d $(DIST_DIR) ]; then \
		echo 'make: directory does not exist: $(DIST_DIR)'; \
		exit 1; \
	fi;
	@ echo -- remove old dist files
	@ rm -f $(DIST_DIR)/*.{js,css}
	@ git rm -f --ignore-unmatch $(DIST_DIR)/*.{js,css}
