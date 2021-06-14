all: 
	wasm-pack build --release
	cd www/ && npm run start
build: 
	wasm-pack build --release
run: 
	cd www/ && npm run start