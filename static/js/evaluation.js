// A one-meter 2D outline illustrates surface metrics; these are not benchmark results.
(() => {
  const svg = document.getElementById('eval-surface');
  if (!svg) return;
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const reference = [];
  for (let i = 0; i <= 10; i++) reference.push([i / 10, 0], [i / 10, 1]);
  for (let i = 1; i < 10; i++) reference.push([0, i / 10], [1, i / 10]);
  const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const nearest = (a, points) => points.reduce((best, p) => distance(a, p) < distance(a, best) ? p : best, points[0]);
  const mean = values => values.reduce((sum, n) => sum + n, 0) / values.length;
  function add(tag, attrs) {
    const element = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    svg.append(element);
  }
  function draw() {
    const shiftCm = Number($('eval-offset').value);
    const gapCm = Number($('eval-tolerance').value);
    const missing = $('eval-missing').checked;
    const retained = missing ? reference.filter(([x, y]) => !(y === 1 && x > 0.2 && x < 0.8)) : reference;
    const prediction = retained.map(([x, y]) => [x + shiftCm / 100, y]);
    const forward = prediction.map(p => distance(p, nearest(p, reference)));
    const backward = reference.map(p => distance(p, nearest(p, prediction)));
    const predictedMatches = forward.filter(d => d <= gapCm / 100 + 1e-9).length;
    const referenceMatches = backward.filter(d => d <= gapCm / 100 + 1e-9).length;
    const precision = predictedMatches / prediction.length;
    const recall = referenceMatches / reference.length;
    const fscore = precision + recall ? 2 * precision * recall / (precision + recall) : 0;
    $('eval-offset-value').textContent = `${shiftCm} cm`;
    $('eval-tolerance-value').textContent = `${gapCm} cm`;
    $('eval-offset').setAttribute('aria-valuetext', `${shiftCm} centimeters`);
    $('eval-tolerance').setAttribute('aria-valuetext', `${gapCm} centimeters`);
    $('eval-cd').textContent = `${((mean(forward) + mean(backward)) * 100).toFixed(1)} cm`;
    $('eval-fscore').textContent = `${(fscore * 100).toFixed(1)}%`;
    $('eval-precision').textContent = `${predictedMatches} of ${prediction.length}`;
    $('eval-recall').textContent = `${referenceMatches} of ${reference.length}`;
    let explanation;
    if (shiftCm === 0 && !missing) {
      explanation = 'The outlines match. Every dot is covered, so CD is zero and F-score is 100%.';
    } else if (shiftCm === 0 && missing) {
      explanation = 'Every remaining gold dot matches, but part of the blue outline is uncovered. Precision stays at 100%, while recall and F-score fall.';
    } else if (fscore === 1) {
      explanation = 'Every dot passes the allowed gap, so F-score is 100% even though the outlines are shifted. CD still detects a difference.';
    } else {
      explanation = 'Hollow gold dots are too far from the reference to count as matches. Increase the allowed gap: F-score can rise while CD stays unchanged.';
    }
    $('eval-explanation').textContent = explanation;
    svg.setAttribute('aria-label', `A blue one-meter reference outline and a gold prediction shifted ${shiftCm} centimeters, ${missing ? 'with part of its bottom edge missing' : 'with all edges present'}. Lines connect nearest dots. Hollow gold dots fail the ${gapCm}-centimeter matching tolerance.`);
    svg.replaceChildren();
    const point = ([x, y]) => [220 + x * 210, 28 + y * 210];
    prediction.forEach(p => {
      const [x, y] = point(p), [rx, ry] = point(nearest(p, reference));
      add('line', {x1: x, y1: y, x2: rx, y2: ry, stroke: '#bcb6aa', 'stroke-width': 1.5});
    });
    reference.forEach(p => {
      const [x, y] = point(p);
      add('circle', {cx: x, cy: y, r: 5, fill: '#5b8db8'});
    });
    prediction.forEach((p, i) => {
      const [x, y] = point(p);
      add('circle', {cx: x, cy: y, r: 3.2, fill: forward[i] <= gapCm / 100 + 1e-9 ? '#cf9d39' : '#fefdfb', stroke: '#af7c22', 'stroke-width': 1.3});
    });
  }
  $('eval-offset').addEventListener('input', draw);
  $('eval-tolerance').addEventListener('input', draw);
  $('eval-missing').addEventListener('change', draw);
  draw();
})();
