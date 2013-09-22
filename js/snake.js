Function.prototype.bind=Function.prototype.bind||function(b){if(typeof this!=="function"){throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");}var a=Array.prototype.slice,f=a.call(arguments,1),e=this,c=function(){},d=function(){return e.apply(this instanceof c?this:b||window,f.concat(a.call(arguments)));};c.prototype=this.prototype;d.prototype=new c();return d;};

Bacon.Observable.prototype.slidingWindowBy = function(lengthObs) {
  var self = this
  return new Bacon.EventStream(function(sink) {
    var buf = [];
    var length = 0;

    lengthObs.onValue(function(n) {
      length = n;
    });

    self.onValue(function(x) {
      buf.unshift(x);
      buf = buf.slice(0, length);
      sink(new Bacon.Next(buf));
    });

    return function() { };
  });
}

var Snake = {};

Snake.Vector = function(x,y,dx,dy) {
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
}

Snake.size = new Snake.Vector(20, 20, 0, 0);

Snake.Vector.prototype.equals = function(vector) {
  return this.x === vector.x && this.y === vector.y;
}

Snake.Vector.prototype.add = function(vector) {
  return new Snake.Vector((this.x + vector.dx + Snake.size.x) % Snake.size.x,
                          (this.y + vector.dy + Snake.size.y) % Snake.size.y,
                          this.dx, this.dy);
}

Snake.Vector.prototype.rotateRight = function(vector) {
  return new Snake.Vector(vector.x, vector.y, -vector.dy, vector.dx);
}

Snake.Vector.prototype.rotateLeft = function(vector) {
  return new Snake.Vector(vector.x, vector.y, vector.dy, -vector.dx);
}

Snake.apply = function(x,fn) { return fn(x); };
Snake.add2 = function(x,y) { return x + y; };

var alphaStopsForRGBColor = function(red, green, blue, numStops) {
  var stops = []; var alpha;

  for ( var i = numStops; i >= 0; i -= 1 ) {
    alpha = i / numStops;
    stops.push(['rgba(', [red, green, blue, alpha].join(','), ')'].join(''));
  }

  return stops;
}

Snake.drawSnake = function(vectors) {
  $('table.snake-board td.snake').removeAttr('style').removeAttr('class');
  var colorStops = alphaStopsForRGBColor(0, 128, 0, vectors.length);
  var i = 0;
  vectors.map(function(vector) {
    Snake.cellAt(vector).attr('class', 'snake')
                        .attr('style', 'background: ' + colorStops[i]);
    i += 1;
  });
}

Snake.drawApple = function(vector) {
  $('table.snake-board td.apple').removeAttr('class');
  Snake.cellAt(vector).attr('class', 'apple');
}

Snake.cellAt = function(vector) {
  var row = $('table.snake-board tbody tr')[vector.y];
  return $($(row).find('td')[vector.x]);
}

Snake.nextApplePosition = function() {
  return new Snake.Vector(Math.floor(Math.random() * Snake.size.x),
                          Math.floor(Math.random() * Snake.size.y),
                          0,0);
}

Snake.apple = function(position) {
  var applePosition = Snake.nextApplePosition();
  return position
        .filter(function(p) { return p.equals(applePosition); })
        .take(1)
        .flatMapLatest(Snake.apple.bind(null, position))
        .toProperty(applePosition);
}

Snake.drawBoard = function() {
  $('table.snake-board').remove();
  $(document.body).append('<table class="snake-board"><tbody></tbody></table>');
  for ( var row = 0; row < Snake.size.y; row += 1 ) {
    $('table.snake-board tbody').append('<tr></tr>');
    for ( var column = 0; column < Snake.size.x; column += 1 ) {
      $('table.snake-board tbody tr').last().append('<td></td>');
    }
  }
}

Snake.start = function(root) {
  this.drawBoard();
  document.ontouchmove = function(e) { e.preventDefault(); }

  var lefts = Arrows.lefts().merge(Swipes.lefts());
  var rights = Arrows.rights().merge(Swipes.rights());
  var tick = Bacon.interval(100);

  var actions = lefts.map(function() {
    return Snake.Vector.prototype.rotateLeft;
  }).merge(rights.map(function() {
    return Snake.Vector.prototype.rotateRight;
  }));

  var startVector = new Snake.Vector(0,0,0,1);

  var direction = actions.scan(startVector, Snake.apply);
  var position = direction.sampledBy(tick)
                          .scan(startVector, function(x, y) {
                            return x.add(y);
                          });

  var apple = Snake.apple(position);
  var snakeLength = apple.map(1).scan(9, Snake.add2);
  var score = apple.map(1).scan(-1, Snake.add2);
  var snake = position.slidingWindowBy(snakeLength);

  snake.onValue(Snake.drawSnake);
  apple.onValue(Snake.drawApple);
  score.assign($('.score'), 'text');
}

$(document).ready(function() { Snake.start(); });
