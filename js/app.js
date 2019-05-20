import Config from "./config";
import Index from "./index.js";

let index = new Index();
let element;

const hello = function () {
  alert("Welcome!");
};

const init = function () {
  element = document.getElementById("dashboard");
  index.render(element);
  if (!("demo" in window)) {
    window["demo"] = {};
  }
};

document.addEventListener("DOMContentLoaded", init);