dev:
	@ touch sass/style.scss
	@ cd build && node buk-builder dev
test:
	@ cd build && node buk-builder test
reset:
	git show HEAD:build/config.json > build/config.json
