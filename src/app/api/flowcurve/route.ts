import { NextResponse } from 'next/server';

function calculateTransport(salinityDrop: number): number {
  const maxTransport = 18.0;
  const steepness = 12.0;
  const criticalPoint = 1.5;

  return maxTransport / (1 + Math.exp(steepness * (salinityDrop - criticalPoint)));
}

export async function GET() {
  const data = [];
  for (let drop = 0; drop <= 3.0; drop += 0.05) {
    data.push({
      freshwaterInput: parseFloat(drop.toFixed(2)),
      salinity: parseFloat((35.5 - drop).toFixed(2)),
      transport: parseFloat(calculateTransport(drop).toFixed(2)),
    });
  }

  return NextResponse.json({ data, criticalPoint: 1.5, unit: 'Sv' });
}
