import React from "react";
import { getContainerDimensions, callIfChanged, calculatePositions, calculateVisible, getStartingIndex, getEndingIndex } from "./utils";
import "./VirtualScroll.css";

export function useScroll() {
    const [scrollTop, setScrollTop] = React.useState(0);
    const [scrollLeft, setScrollLeft] = React.useState(0);
    const ref = React.useRef(null);

    React.useEffect(() => {
        let raf = undefined;

        function onScroll(event) {
            raf = requestAnimationFrame(() => {
                setScrollTop(event.target.scrollTop);
                setScrollLeft(event.target.scrollLeft);
            });
        }

        const scrollContainer = ref.current;

        if (scrollContainer) {
            setScrollTop(scrollContainer.scrollTop);
            setScrollLeft(scrollContainer.scrollLeft);
            scrollContainer.addEventListener("scroll", onScroll, { passive: true });
        }

        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener("scroll", onScroll, true);
            }

            if (raf) {
                cancelAnimationFrame(raf);
            }
        };
    }, []);

    return [scrollTop, scrollLeft, ref];
}


export function renderVirtualItems(
    items,
    rowHeight,
    columnWidth,
    render,
) {
    return items.map(item => {
        const style = {
            position: "absolute",
            top: `${item.top}px`,
            left: `${item.left}px`,
            height: rowHeight,
            width: columnWidth,
        };

        return render({
            index: item.index,
            rowIndex: item.rowIndex,
            columnIndex: item.columnIndex,
            style: style,
        });
    });
}


export const VirtualScroll = React.forwardRef(
    (
        {
            width,
            height,
            rowsCount = 1,
            rowHeight,
            columnWidth,
            columnsCount = 1,
            tolerance = 1,
            onVisibilityChange,
            children,
        },
        ref,
    ) => {
        const [scrollTop, scrollLeft, scrollableRef] = useScroll();
        const visibleRef = React.useRef([]);
        const [containerHeight, containerWidth] = getContainerDimensions(
           {
            rowsCount,
            columnsCount,
            columnWidth,
            rowHeight,
           }
        );

        const scrollTo = React.useCallback(
            (columnIndex = 0, rowIndex = 0) => {
                const offsetX = columnWidth * columnIndex;
                const offsetY = rowHeight * rowIndex;

                const container = scrollableRef.current;

                if (container && container.scrollTo) {
                    container.scrollTo(offsetX, offsetY);
                }
            },
            [scrollableRef, columnWidth, rowHeight],
        );

        React.useEffect(() => {
            if (ref) {
                (ref).current = {
                    scrollTo: scrollTo,
                };
            }
        }, [ref, scrollTo]);

        const startingRowIndex = React.useMemo(() => getStartingIndex(scrollTop, rowHeight, tolerance), [
            scrollTop,
            rowHeight,
            tolerance,
        ]);
        const startingColumnIndex = React.useMemo(() => getStartingIndex(scrollLeft, columnWidth, tolerance), [
            scrollLeft,
            columnWidth,
            tolerance,
        ]);

        const endingRowIndex = React.useMemo(() => getEndingIndex(scrollTop, height, rowHeight, rowsCount, tolerance), [
            scrollTop,
            height,
            rowHeight,
            rowsCount,
            tolerance,
        ]);
        const endingColumnIndex = React.useMemo(
            () => getEndingIndex(scrollLeft, width, columnWidth, columnsCount, tolerance),
            [scrollLeft, width, columnWidth, columnsCount, tolerance],
        );

        const items = React.useMemo(
            () =>
                calculatePositions(
                    {
                        startingRowIndex,
                    endingRowIndex,
                    startingColumnIndex,
                    endingColumnIndex,
                    rowHeight,
                    columnWidth,
                    columnsCount,
                    }
                ),
            [
                startingRowIndex,
                endingRowIndex,
                startingColumnIndex,
                endingColumnIndex,
                rowHeight,
                columnWidth,
                columnsCount,
            ],
        );

        const elements = React.useMemo(() => renderVirtualItems(items, rowHeight, columnWidth, children), [
            items,
            rowHeight,
            columnWidth,
            children,
        ]);

        React.useEffect(() => {
            const visible = calculateVisible({ items, scrollTop, scrollLeft, height, width, rowHeight, columnWidth });
            callIfChanged(visibleRef.current, visible, () => {
                onVisibilityChange(visible);
                visibleRef.current = visible;
            });
        }, [visibleRef, items, scrollTop, scrollLeft, width, height, columnWidth, rowHeight, onVisibilityChange]);

        return (
            <div style={{ height: height, width: width }} className="ScrollContainer" ref={scrollableRef}>
                <div
                    style={{
                        height: containerHeight,
                        width: containerWidth,
                    }}
                    className="Container"
                >
                    {elements}
                </div>
            </div>
        );
    },
);
