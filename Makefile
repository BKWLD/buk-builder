# Name phony targets to avoid name conflicts
.PHONY: dev build sass clean

# Run builder for local development
dev:
	@ make sass clean
	@ cd build && node buk-builder dev

# Create a build with file hashing for production
build:
	@ make sass clean
	@ cd build && node buk-builder build

# Pre-process sass files to get latest css
sass:
	@ echo -- pre-process sass files
	@ compass compile
	
# Remove js / css files in the dist directory
clean:
	@ echo -- clean old dist files
	@ rm -fv public/dist/*.{js,css}