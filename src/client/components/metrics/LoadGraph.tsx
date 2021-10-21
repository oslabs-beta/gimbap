import React from 'react';
import { LoadData } from '../../../shared/types';

import {
  Axis,
  Grid,
  LineSeries,
  XYChart,
  Tooltip,
} from '@visx/xychart';

export default function LoadGraph({
  loadData,
}: {
  loadData: LoadData;
}) {

  const data = loadData.x.map((x, i) => [x, loadData.y[i]]);
  const accessors = {
    xAccessor: d => d[0],
    yAccessor: d => d[1],
  };

  // TODO add legends, title, axis labels

  return (
    <XYChart height={300} xScale={{ type: 'band' }} yScale={{ type: 'linear' }}>
      <Axis orientation="bottom" />
      <Grid columns={false} numTicks={4} />
      <LineSeries dataKey="Line 1" data={data} {...accessors} />
      <Tooltip
        snapTooltipToDatumX
        snapTooltipToDatumY
        showVerticalCrosshair
        showSeriesGlyphs
        renderTooltip={({ tooltipData, colorScale }) => (
          <div>
            <div style={{ color: colorScale(tooltipData.nearestDatum.key) }}>
              {tooltipData.nearestDatum.key}
            </div>
            {accessors.xAccessor(tooltipData.nearestDatum.datum)}
            {', '}
            {accessors.yAccessor(tooltipData.nearestDatum.datum)}
          </div>
        )}
      />
    </XYChart>
  );
}
