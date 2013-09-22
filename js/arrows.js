var Arrows = {};

Arrows.keyCodes = function() {
  return $(document).asEventStream('keydown').map('.keyCode');
}

Arrows.lefts = function() {
  return Arrows.keyCodes().filter(function(code) {
    return code === 37;
  });
}

Arrows.rights = function() {
  return Arrows.keyCodes().filter(function(code) {
    return code === 39;
  });
}
