// A dependency graph that contains any wasm must all be imported
// asynchronously. This `bootstrap.js` file does the single async import, so
// that no one else needs to worry about it again.
let cur_entry = "./render.js"
import("./index-2.js")
  .catch(e => console.error("Error importing `index-2.js`:", e));
