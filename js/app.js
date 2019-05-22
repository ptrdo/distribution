import Config from "./config";
import Index from "./index.js";

let index = new Index();
let element;

const init = function () {
  
  element = document.getElementById("main");
  index.render(element);
  
};

document.addEventListener("DOMContentLoaded", init);