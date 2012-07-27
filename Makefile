dev:
	@ make compass clean
	@ cd build && node buk-builder dev
build:
	@ make compass clean
	@ cd build && node buk-builder build
compass:
	@ echo -- compiling sass files
	@ compass compile
clean:
	@ echo -- removing dist files
	@ rm -fv public/dist/*.{js,css}