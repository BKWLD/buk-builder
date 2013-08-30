# Dev Environment Setup

1. Install NodeJS (0.6 or higher): http://nodejs.org/download/

2. Make sure you've got `make` installed.  
  -- Check availability by running `which make`  
  -- If undefined (on Mac OSX), install [Xcode command line tools](https://developer.apple.com/downloads)  

3. Install Compass for SASS compilation:

  `gem install compass`  
  `gem install rb-fsevent` (optional, improves `watch` latency on OSX)  
  
4. During development, compile SASS with Compass:

  `compass watch`

# Building Front-end JS and CSS

This project uses [Buk Builder](http://github.com/bkwld/buk-builder) to combine and minify JavaScript + CSS.

Buk Builder is run on the command line, using the following commands:

`make dev` or `make` -- Update tags for local development.  
`make build` -- Combine, minify assets and update tags for production.  

See `config/builder.js` or `Makefile` for further details.

## MIT License 

This code may be freely distributed under the [MIT license](http://danro.mit-license.org/).
