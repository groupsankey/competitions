import React, { useMemo, useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { evaluate } from 'mathjs';

interface Equation2D {
  id: string;
  expression: string;
  color: string;
}

interface Graph2DProps {
  equations: Equation2D[];
  xRange: [number, number];
}

const Graph2D: React.FC<Graph2DProps> = ({ equations }) => {
  const [currentRange, setCurrentRange] = useState<{ x: [number, number]; y: [number, number] }>({
    x: [-10, 10],
    y: [-10, 10]
  });

  const generatePoints = useCallback((range: [number, number], density: number) => {
    const span = range[1] - range[0];
    const step = span / density;
    return Array.from({ length: density + 1 }, (_, i) => range[0] + i * step);
  }, []);

  const data = useMemo(() => {
    const basePoints = 2000;
    const rangeSpan = Math.abs(currentRange.x[1] - currentRange.x[0]);
    const points = Math.ceil(basePoints * (rangeSpan / 10));
    const x = generatePoints(currentRange.x, points);
    
    return equations.map(eq => {
      const y = x.map(xVal => {
        try {
          const result = evaluate(eq.expression, { x: xVal });
          return result;
        } catch {
          return null;
        }
      });

      return {
        x,
        y,
        type: 'scatter',
        mode: 'lines',
        name: eq.expression,
        line: { color: eq.color, width: 2 },
        hoverinfo: 'x+y+name',
      };
    });
  }, [equations, currentRange, generatePoints]);

  const handleRelayout = (event: Plotly.PlotRelayoutEvent) => {
    if (event['xaxis.range[0]'] !== undefined) {
      const xMin = event['xaxis.range[0]'];
      const xMax = event['xaxis.range[1]'];
      const yMin = event['yaxis.range[0]'];
      const yMax = event['yaxis.range[1]'];
      
      // Calculate the range span
      const xSpan = Math.abs(xMax - xMin);
      const ySpan = Math.abs(yMax - yMin);
      
      // Use the larger span to maintain aspect ratio
      const span = Math.max(xSpan, ySpan);
      const xCenter = (xMin + xMax) / 2;
      const yCenter = (yMin + yMax) / 2;

      setCurrentRange({
        x: [xCenter - span/2, xCenter + span/2],
        y: [yCenter - span/2, yCenter + span/2]
      });
    } else if (event.autosize || event['xaxis.autorange']) {
      setCurrentRange({
        x: [-10, 10],
        y: [-10, 10]
      });
    }
  };

  return (
    <Plot
      data={data}
      layout={{
        title: '2D Graph',
        xaxis: { 
          title: 'x',
          gridcolor: '#888888',
          zerolinecolor: '#404040',
          zerolinewidth: 2,
          range: currentRange.x,
          scaleanchor: 'y',
          scaleratio: 1,
          showgrid: true,
          zeroline: true,
          mirror: true,
          linewidth: 2,
          linecolor: '#404040',
          constrain: 'domain',
        },
        yaxis: { 
          title: 'y',
          gridcolor: '#888888',
          zerolinecolor: '#404040',
          zerolinewidth: 2,
          range: currentRange.y,
          scaleanchor: 'x',
          scaleratio: 1,
          showgrid: true,
          zeroline: true,
          mirror: true,
          linewidth: 2,
          linecolor: '#404040',
          constrain: 'domain',
        },
        plot_bgcolor: '#f0f0f0',
        paper_bgcolor: '#f0f0f0',
        autosize: true,
        height: 700,
        margin: { l: 50, r: 50, t: 50, b: 50 },
        showlegend: true,
        hovermode: 'closest',
        legend: {
          x: 0,
          y: 1,
          traceorder: 'normal',
          bgcolor: '#ffffff',
          bordercolor: '#f0f0f0',
          borderwidth: 1,
        },
        dragmode: 'pan',
        shapes: [
          {
            type: 'line',
            x0: currentRange.x[0],
            y0: 0,
            x1: currentRange.x[1],
            y1: 0,
            line: {
              color: '#404040',
              width: 2,
            }
          },
          {
            type: 'line',
            x0: 0,
            y0: currentRange.y[0],
            x1: 0,
            y1: currentRange.y[1],
            line: {
              color: '#404040',
              width: 2,
            }
          }
        ],
        aspectratio: { x: 1, y: 1 },
      }}
      useResizeHandler
      style={{ width: '100%', height: '100%' }}
      config={{
        scrollZoom: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToAdd: ['pan2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d'],
        toImageButtonOptions: {
          format: 'png',
          filename: '2d_graph',
          height: 1400,
          width: 1400,
          scale: 2
        }
      }}
      onRelayout={handleRelayout}
    />
  );
};

export default Graph2D;