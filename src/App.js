import React from "react";
import { VirtualScroll } from "./VirtualScroll";

function Cell({ index, rowIndex, columnIndex, style }) {
  return (
    <div key={`${rowIndex}-${columnIndex}`} style={style} className="Cell">
      r {rowIndex}, c {columnIndex}, i {index}
    </div>
  );
}

function App() {
  const ref = React.useRef({ scrollTo: () => {} });
  const onVisibilityChange = React.useCallback((...args) => window.console.log("Visible items:", ...args), []);

  return (
    <div>
      <button
        className="Button"
        type="button"
        onClick={() => ref.current.scrollTo(8, 8)}
      >
        Scroll to (8, 8)
      </button>

      <VirtualScroll
        ref={ref}
        onVisibilityChange={onVisibilityChange}
        rowsCount={1000}
        columnsCount={2}
        height={667}
        width={375}
        rowHeight={240}
        columnWidth={187}
        tolerance={2}
      >
        {Cell}
      </VirtualScroll>
    </div>
  );
}

export default App;
