import Config from "./config";
import chart from "../distribution.js";

class Index {

  constructor() {
    console.log("The Index module has been constructed!");
  };

  render(rootElement=document) {
   
    let refresh = rootElement.querySelector("button.refresh");
    let options = rootElement.querySelector("select[name=source]");
    let dataurl = "data/Simulations-x.json";
    let chartId = "RuntimeDistribution";
    
    refresh.addEventListener("click", function (event) {
      event.preventDefault();
      chart.render(chartId, dataurl.replace("x", options.value||33));
    });
  };

  load() {};
  unload() {};
}

export default Index;