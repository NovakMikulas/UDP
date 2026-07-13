export function unrollTso(list, valueKeys) {
  if (list.length === 0) return [];
  const startTs = list[0];
  const groupSize = valueKeys.length + 1;
  const points = [];
  for (let i = 1; i < list.length; i += groupSize) {
    const point = { timestamp: startTs + list[i] };
    for (let j = 0; j < valueKeys.length; j += 1) {
      point[valueKeys[j]] = list[i + 1 + j];
    }
    points.push(point);
  }
  return points;
}
