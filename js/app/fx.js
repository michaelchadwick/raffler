/* fx */
/* extra fluff to make it look and sound cool */

if (typeof Raffler !== "undefined") {
  //Raffler._notify("fx.js: Loaded!");

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
      Raffler.canvasFireworks.prop("z-index", 1001);
      Raffler.canvasFireworks.show();
    }
  }
  Raffler._playSound = function(soundId) {
    if (Raffler.ckOptSound.is(":checked")) {
      document.getElementById(soundId).play();
    }
  }
} else {
  Raffler._notify("fx.js: Could not load. Raffler object undefined");
}
