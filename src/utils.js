export function callIfChanged(prev, current, callback) {
    const isChanged = prev.length !== current.length || prev.some((uid, index) => current[index] !== uid);

    if (isChanged) {
        callback(current);
    }
}


export function getContainerDimensions({
  rowsCount,
  columnsCount,
  columnWidth,
  rowHeight,
}) {
  const containerHeight = rowsCount * rowHeight;
  const containerWidth = columnsCount * columnWidth;

  return [containerHeight, containerWidth];
}

export function getIndex(rowIndex, columnIndex, columnsCount) {
  return columnsCount * rowIndex + columnIndex;
}

export function getStartingIndex(scrollPosition, cellSize, tolerance) {
  return Math.max(0, Math.floor(scrollPosition / cellSize) - tolerance);
}

export function getEndingIndex(
  scrollPosition,
  size,
  cellSize,
  count,
  tolerance) {
  return Math.min(
    count,
    Math.floor((scrollPosition + size) / cellSize) + tolerance
  );
}

export function calculatePositions({
  startingRowIndex,
  endingRowIndex,
  startingColumnIndex,
  endingColumnIndex,
  rowHeight,
  columnWidth,
  columnsCount,
}) {
  const items = [];
  for (let i = startingRowIndex; i < endingRowIndex; i++) {
    for (let j = startingColumnIndex; j < endingColumnIndex; j++) {
      const top = i * rowHeight;
      const left = j * columnWidth;
      const index = getIndex(i, j, columnsCount);

      items.push({
        index: index,
        rowIndex: i,
        columnIndex: j,
        top: top,
        left: left,
      });
    }
  }

  return items;
}

export function calculateVisible({
  items,
  scrollTop,
  scrollLeft,
  height,
  width,
  rowHeight,
  columnWidth,
}) {
  const visible = items
    .filter((item) => {
      const isVisible =
        scrollTop - item.top <= rowHeight &&
        scrollTop + height - item.top >= 0 &&
        scrollLeft - item.left <= columnWidth &&
        scrollLeft + width - item.left >= 0;

      return isVisible;
    })
    .map((item) => item.index);

  return visible;
}
