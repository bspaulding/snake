var Swipes = {};

Swipes.lefts = function() {
  return new Bacon.EventStream(function(subscriber) {
    Hammer(document.body).on("swipeleft", function() {
      subscriber(new Bacon.Next(arguments));
    });

    return function() {};
  });
}

Swipes.rights = function() {
  return new Bacon.EventStream(function(subscriber) {
    Hammer(document.body).on("swiperight", function() {
      subscriber(new Bacon.Next(arguments));
    });

    return function() {};
  });
}
