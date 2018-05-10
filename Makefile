install:
	npm install --silent -g npm
	npm install --silent -g gulp-cli
	npm install --silent -g tsc
	npm install --silent

build: install
	gulp clean
	gulp build

release: install
	gulp clean
	gulp build:release

clean:
	gulp clean
