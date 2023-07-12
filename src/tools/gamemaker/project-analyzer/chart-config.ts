import type { ChartConfiguration } from 'chart.js';

const chartColors = [
  '#A22633',
  '#BE4A2F',
  '#E4A672',
  '#63C74D',
  '#FEAE34',
  '#265C42',
  '#124E89',
  '#C0CBDC',
  '#5A6988',
  '#FF0044',
  '#68386C',
  '#B55088',
  '#F6757A',
  '#E8B796'
];

export function getPieConfig(labels: string[], data: number[]): ChartConfiguration<'pie', number[], string> {
  return {
    type: 'pie',
    options: {
      responsive: true,
      maintainAspectRatio: false
    },
    data: {
      labels,
      datasets: [
        {
          label: 'Asset Counts',
          data,
          backgroundColor: chartColors,
          borderWidth: 0
        }
      ]
    }
  };
}

export function getBarConfig(labels: string[], data: number[]): ChartConfiguration<'bar', number[], string> {
  return {
    type: 'bar',
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    },
    data: {
      labels,
      datasets: [
        {
          label: 'Asset Counts',
          data,
          backgroundColor: chartColors
        }
      ]
    }
  };
}
