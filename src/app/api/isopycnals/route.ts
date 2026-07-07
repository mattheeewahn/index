import { NextResponse } from 'next/server';

export async function GET() {
  const lines = [];
  for (let sigma = 25.0; sigma <= 28.5; sigma += 0.5) {
    const points = [];
    for (let s = 32.0; s <= 37.0; s += 0.1) {
      const targetRho = sigma + 1000;
      const t = (999.842594 + 0.824493 * s - targetRho) / (9.095290e-3 - 6.793952e-2);
      if (t >= -2 && t <= 15) {
        points.push({ salinity: parseFloat(s.toFixed(1)), temperature: parseFloat(t.toFixed(2)) });
      }
    }
    if (points.length > 1) {
      lines.push({ sigma: sigma.toFixed(1), points });
    }
  }

  return NextResponse.json({ lines });
}
