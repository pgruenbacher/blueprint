/**
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 * Licensed under the BSD-3 License as modified (the “License”); you may obtain a copy
 * of the license at https://github.com/palantir/blueprint/blob/master/LICENSE
 * and https://github.com/palantir/blueprint/blob/master/PATENTS
 */

import { IRegion, RegionCardinality, Regions } from "../../regions";

export function getScrollPositionForRegion(
    region: IRegion,
    currScrollLeft: number,
    currScrollTop: number,
    getLeftOffset: (columnIndex: number) => number,
    getTopOffset: (rowIndex: number) => number,
    numFrozenRows: number = 0,
    numFrozenColumns: number = 0,
) {
    const cardinality = Regions.getRegionCardinality(region);

    let scrollTop = currScrollTop;
    let scrollLeft = currScrollLeft;

    // if these were max-frozen-index values, we would have added 1 before passing to the get*Offset
    // functions, but the counts are already 1-indexed, so we can just pass those.
    const frozenColumnsCumulativeWidth = getLeftOffset(numFrozenColumns);
    const frozenRowsCumulativeHeight = getTopOffset(numFrozenRows);

    switch (cardinality) {
        case RegionCardinality.CELLS: {
            // scroll to the top-left corner of the block of cells
            const topOffset = getTopOffset(region.rows[0]);
            const leftOffset = getLeftOffset(region.cols[0]);
            scrollTop = getClampedScrollPosition(topOffset, frozenRowsCumulativeHeight);
            scrollLeft = getClampedScrollPosition(leftOffset, frozenColumnsCumulativeWidth);
            break;
        }
        case RegionCardinality.FULL_ROWS: {
            // scroll to the top of the row block
            const topOffset = getTopOffset(region.rows[0]);
            scrollTop = getClampedScrollPosition(topOffset, frozenRowsCumulativeHeight);
            break;
        }
        case RegionCardinality.FULL_COLUMNS: {
            // scroll to the left side of the column block
            const leftOffset = getLeftOffset(region.cols[0]);
            scrollLeft = getClampedScrollPosition(leftOffset, frozenColumnsCumulativeWidth);
            break;
        }
        default: {
            // if it's a FULL_TABLE region, scroll back to the top-left cell of the table
            scrollTop = 0;
            scrollLeft = 0;
            break;
        }
    }

    return { scrollLeft, scrollTop };
}

/**
 * Adjust the scroll position to align content just beyond the frozen region, if necessary.
 */
function getClampedScrollPosition(scrollOffset: number, frozenRegionCumulativeSize: number) {
    // if the new scroll offset falls within the frozen region, clamp it to 0
    return Math.max(scrollOffset - frozenRegionCumulativeSize, 0);
}