requirejs(['jquery', 'app/main'], function($, Raffler) {

  if (typeof Raffler !== "undefined") {
    Raffler.hideFireworks = function() {
      Raffler.divMainWrapper.prop("z-index", 0);
      Raffler.divItemsCycle.prop("z-index", 0);
      Raffler.btnRaffle.prop("z-index", 0);
      Raffler.canvasFireworks.hide();
    }
    Raffler.displayFireworks = function() {
      if (Raffler.ckOptFireworks.is(":checked")) {
        Raffler.divItemsCycle.prop("z-index", 1000);
        Raffler.btnRaffle.prop("z-index", 1000);
        Raffler.canvasFireworks.prop("z-index", 999);
        Raffler.canvasFireworks.show();
      }
    }
  } else {
    console.log("fx.js: Raffler object undefined");
  }

});
