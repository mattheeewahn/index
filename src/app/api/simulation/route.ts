import { NextRequest, NextResponse } from 'next/server';

function calculateDensity(temperature: number, salinity: number): number {
  const rho0 = 999.842594;
  const a1 = 6.793952e-2;
  const a2 = -9.095290e-3;
  const a3 = 1.001685e-4;
  const b1 = 0.824493;
  const b2 = -4.0899e-3;
  const b3 = 7.6438e-5;

  const rhoFresh = rho0 + a1 * temperature + a2 * Math.pow(temperature, 2) + a3 * Math.pow(temperature, 3);
  const rhoSaline = rhoFresh + (b1 + b2 * temperature + b3 * Math.pow(temperature, 2)) * salinity;

  return rhoSaline;
}

function calculateTransport(salinityDrop: number): number {
  const maxTransport = 18.0;
  const steepness = 12.0;
  const criticalPoint = 1.5;

  return maxTransport / (1 + Math.exp(steepness * (salinityDrop - criticalPoint)));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const freshwaterInput = parseFloat(searchParams.get('freshwaterInput') || '0');

  const baseSalinity = 35.5;
  const baseTemperature = 2.0;

  const currentSalinity = baseSalinity - freshwaterInput;
  const currentTemperature = baseTemperature + freshwaterInput * 0.8;

  const density = calculateDensity(currentTemperature, currentSalinity);
  const baseDensity = calculateDensity(baseTemperature, baseSalinity);
  const transport = calculateTransport(freshwaterInput);

  return NextResponse.json({
    parameters: {
      freshwaterInput: parseFloat(freshwaterInput.toFixed(2)),
      baseSalinity,
      baseTemperature,
    },
    result: {
      currentSalinity: parseFloat(currentSalinity.toFixed(2)),
      currentTemperature: parseFloat(currentTemperature.toFixed(2)),
      currentDensity: parseFloat(density.toFixed(3)),
      baseDensity: parseFloat(baseDensity.toFixed(3)),
      densityAnomaly: parseFloat((density - baseDensity).toFixed(3)),
      transport: parseFloat(transport.toFixed(2)),
      transportRatio: parseFloat(((transport / 18.0) * 100).toFixed(1)),
    },
    status: transport > 14 ? 'normal' : transport > 5 ? 'weakened' : 'collapsed',
  });
}
