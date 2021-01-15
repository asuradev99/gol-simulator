all: 
	wasm-pack build --release
	cd www/ && npm run start
build: 
	wasm-pack build --release
run: 
	npm run start