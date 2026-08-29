export function addToStatFabric(stats) {
  return (stat, type, value = 1) => {
    if (!type) {
      stats[stat] = (stats[stat] ?? 0) + value;
      return;
    }

    stats[stat] ??= {};

    stats[stat][type] = (stats[stat][type] ?? 0) + value;
  };
}
