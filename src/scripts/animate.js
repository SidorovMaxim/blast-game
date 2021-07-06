export default function animate({action, draw, duration}, ...rest) {
  let start = performance.now();

  let timing = (action === 'move') ? makeEaseOut(bounce) : linear;

  requestAnimationFrame(function animate(time) {
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;

    let progress = timing(timeFraction);

    draw(progress, ...rest);

    if (timeFraction < 1) requestAnimationFrame(animate);
  });
}


function makeEaseOut(timing) {
  return function(timeFraction) {
    return 1 - timing(1 - timeFraction);
  }
}

function linear(timeFraction) {
  return timeFraction;
}

function bounce(timeFraction) {
  for (let a = 0, b = 1, result; 1; a += b, b /= 2) {
    if (timeFraction >= (7 - 4 * a) / 11) {
      return -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2)
    }
  }
}