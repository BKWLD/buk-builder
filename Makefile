# Name phony targets to avoid name conflicts
.PHONY: dev build sass clean

# Define vars
builder = cd build && node buk-builder
dist_dir = public/dist

# Run builder for local development
# `make` or `make dev`
# builder options:
#   mode=(banner|build)
#   label=text
#   base=path
#   config=file.js
dev:
	@ $(builder) mode=banner label=development
	@ make sass clean
	@ $(builder) config=config/builder.js

# Create a build with file hashing for production
# `make build`
build:
	@ $(builder) mode=banner label=build
	@ make sass clean
	@ $(builder) mode=build config=config/builder.js
	@ git add $(dist_dir)

# Pre-process sass files to get latest css
sass:
	@ echo -- pre-process sass files
	@ compass compile
	
# Remove js / css files in the dist directory
clean:
	@ if [ ! -d $(dist_dir) ]; then \
		echo 'make: directory does not exist: $(dist_dir)'; \
		exit 1; \
	fi;
	@ echo -- remove old dist files
	@ rm -f $(dist_dir)/*.{js,css}
	@ git rm -f --ignore-unmatch $(dist_dir)/*.{js,css}