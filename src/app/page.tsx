'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

interface SimulationResult {
  parameters: {
    freshwaterInput: number;
    baseSalinity: number;
    baseTemperature: number;
  };
  result: {
    currentSalinity: number;
    currentTemperature: number;
    currentDensity: number;
    baseDensity: number;
    densityAnomaly: number;
    transport: number;
    transportRatio: number;
  };
  status: 'normal' | 'weakened' | 'collapsed';
}

interface FlowCurveData {
  data: { freshwaterInput: number; salinity: number; transport: number }[];
  criticalPoint: number;
}

interface IsopycnalLine {
  sigma: string;
  points: { salinity: number; temperature: number }[];
}

export default function Home() {
  const [freshwaterInput, setFreshwaterInput] = useState(0);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [flowCurve, setFlowCurve] = useState<FlowCurveData | null>(null);
  const [isopycnals, setIsopycnals] = useState<IsopycnalLine[]>([]);

  useEffect(() => {
    fetch('/api/flowcurve')
      .then((res) => res.json())
      .then((data) => setFlowCurve(data))
      .catch(() => {});

    fetch('/api/isopycnals')
      .then((res) => res.json())
      .then((data) => setIsopycnals(data.lines))
      .catch(() => {});
  }, []);

  const fetchSimulation = useCallback((value: number) => {
    fetch(`/api/simulation?freshwaterInput=${value}`)
      .then((res) => res.json())
      .then((data) => setSimulation(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSimulation(freshwaterInput);
  }, [freshwaterInput, fetchSimulation]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFreshwaterInput(parseFloat(e.target.value));
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'normal':
        return '정상 순환';
      case 'weakened':
        return '순환 약화';
      case 'collapsed':
        return '순환 붕괴';
      default:
        return '';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'normal':
        return { color: 'var(--color-safe)', borderColor: 'var(--color-safe)' };
      case 'weakened':
        return { color: 'var(--color-warning)', borderColor: 'var(--color-warning)' };
      case 'collapsed':
        return { color: 'var(--color-danger)', borderColor: 'var(--color-danger)' };
      default:
        return {};
    }
  };

  // T-S도용 현재 위치 데이터
  const currentPoint = simulation
    ? [
        {
          salinity: simulation.result.currentSalinity,
          temperature: simulation.result.currentTemperature,
          z: 120,
        },
      ]
    : [];

  // 기준점 데이터
  const basePoint = [{ salinity: 35.5, temperature: 2.0, z: 80 }];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      {/* 제목 */}
      <header style={{ marginBottom: 40, borderBottom: '2px solid var(--color-text)', paddingBottom: 20 }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>
          북대서양 심층 순환(AMOC) 담수 유입에 따른 비선형 붕괴 시뮬레이션
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          그린란드 빙하 융해수 유입량 변화에 따른 표층 염분, 해수 밀도, 심층 순환 수송량의 상관관계 분석
        </p>
      </header>

      {/* 서론 */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, borderLeft: '3px solid var(--color-accent)', paddingLeft: 10 }}>
          연구 배경
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', textAlign: 'justify' }}>
          지구 온난화가 가속화됨에 따라 그린란드 대륙의 빙하가 빠르게 녹아내리고 있으며, 이로 인해 많은 양의
          담수가 북대서양 침강 해역으로 유입되는 담수화 현상이 발생하고 있다. 정상 상태의 북대서양 표층 해수는 약
          35.5psu로 평균보다 0.5 더 높은 염분을 유지하지만, 표층 수온이 상승하고 빙하가 녹아 담수가 유입되어 염분이
          34.0psu로 감소하면 해수의 밀도는 심해로 가라앉기에 부족한 상태가 된다. 본 시뮬레이션은 담수 유입량에 따른
          염분과 순환 세기의 상관관계를 분석하여, 순환의 약화가 담수의 유입에 비례하여 선형적으로 줄어드는 형태가
          아닌, 임계점을 중심으로 급격히 붕괴하는 비선형 양상임을 검증한다.
        </p>
      </section>

      {/* 제어부 */}
      <section
        style={{
          marginBottom: 36,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          padding: 24,
          borderRadius: 4,
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 16, borderLeft: '3px solid var(--color-accent)', paddingLeft: 10 }}>
          변수 제어
        </h2>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            빙하 융해수(담수) 유입에 의한 염분 감소폭
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <input
              type="range"
              min="0"
              max="3"
              step="0.05"
              value={freshwaterInput}
              onChange={handleSliderChange}
              style={{ flex: 1, cursor: 'pointer' }}
            />
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 15,
                fontWeight: 600,
                minWidth: 80,
                textAlign: 'right',
              }}
            >
              {freshwaterInput.toFixed(2)} psu
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'var(--color-text-muted)',
              marginTop: 4,
            }}
          >
            <span>0.00 (정상 상태)</span>
            <span>1.50 (임계 구간)</span>
            <span>3.00 (최대 유입)</span>
          </div>
        </div>

        {/* 결과 수치 */}
        {simulation && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              marginTop: 20,
            }}
          >
            <div style={{ padding: '12px 16px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 3 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>현재 표층 염분</div>
              <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 600 }}>
                {simulation.result.currentSalinity.toFixed(2)} psu
              </div>
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 3 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>현재 표층 수온</div>
              <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 600 }}>
                {simulation.result.currentTemperature.toFixed(2)} °C
              </div>
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 3 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>해수 밀도</div>
              <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 600 }}>
                {simulation.result.currentDensity.toFixed(3)} kg/m³
              </div>
            </div>
            <div
              style={{
                padding: '12px 16px',
                background: 'var(--color-bg)',
                border: `1px solid`,
                borderRadius: 3,
                ...getStatusStyle(simulation.status),
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>심층 순환 수송량</div>
              <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 600 }}>
                {simulation.result.transport.toFixed(1)} Sv
              </div>
              <div style={{ fontSize: 11, marginTop: 2, ...getStatusStyle(simulation.status) }}>
                {getStatusLabel(simulation.status)} ({simulation.result.transportRatio}%)
              </div>
            </div>
          </div>
        )}
      </section>

      {/* T-S도 */}
      <section
        style={{
          marginBottom: 36,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          padding: 24,
          borderRadius: 4,
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 6, borderLeft: '3px solid var(--color-accent)', paddingLeft: 10 }}>
          수온-염분도 (T-S Diagram)
        </h2>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16, paddingLeft: 13 }}>
          회색 선: 등밀도선 (sigma-t) / 검은 점: 정상 상태 기준점 (35.5 psu, 2.0°C) / 색상 점: 현재 상태
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="salinity"
              type="number"
              domain={[32, 37]}
              name="염분"
              unit=" psu"
              label={{ value: '표층 염분 (psu)', position: 'bottom', offset: 10, style: { fontSize: 12 } }}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              dataKey="temperature"
              type="number"
              domain={[-1, 10]}
              name="수온"
              unit=" °C"
              label={{ value: '표층 수온 (°C)', angle: -90, position: 'insideLeft', offset: -35, style: { fontSize: 12 } }}
              tick={{ fontSize: 11 }}
            />
            <ZAxis dataKey="z" range={[40, 120]} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === '염분') return [value.toFixed(2) + ' psu', '염분'];
                if (name === '수온') return [value.toFixed(2) + ' °C', '수온'];
                return [value, name];
              }}
            />
            {/* 등밀도선 표현 (scatter로 근사) */}
            {isopycnals.map((line) => (
              <Scatter
                key={line.sigma}
                data={line.points.map((p) => ({ ...p, z: 10 }))}
                fill="none"
                stroke="#bbb"
                strokeWidth={1}
                line={{ strokeWidth: 1 }}
                shape={() => <></>}
              />
            ))}
            {/* 기준점 */}
            <Scatter name="기준점" data={basePoint} fill="#1a1a1a" shape="circle" />
            {/* 현재 상태 */}
            <Scatter
              name="현재 상태"
              data={currentPoint}
              fill={
                simulation?.status === 'normal'
                  ? '#1a4d2e'
                  : simulation?.status === 'weakened'
                  ? '#6b4c00'
                  : '#8b1a1a'
              }
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </section>

      {/* 붕괴 곡선 */}
      <section
        style={{
          marginBottom: 36,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          padding: 24,
          borderRadius: 4,
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 6, borderLeft: '3px solid var(--color-accent)', paddingLeft: 10 }}>
          담수 유입량 대비 심층 순환 수송량 변화
        </h2>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16, paddingLeft: 13 }}>
          빨간 점선: 임계점 (1.5 psu 감소폭) / 원형 표시: 현재 시뮬레이션 상태
        </p>
        {flowCurve && (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={flowCurve.data} margin={{ top: 10, right: 30, bottom: 30, left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="freshwaterInput"
                type="number"
                domain={[0, 3]}
                label={{ value: '담수 유입량 (psu 감소폭)', position: 'bottom', offset: 10, style: { fontSize: 12 } }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                domain={[0, 20]}
                label={{ value: '수송량 (Sv)', angle: -90, position: 'insideLeft', offset: -35, style: { fontSize: 12 } }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number) => [value.toFixed(2) + ' Sv', '수송량']}
                labelFormatter={(label: number) => `감소폭: ${label} psu`}
              />
              <ReferenceLine x={1.5} stroke="#8b1a1a" strokeDasharray="5 5" strokeWidth={1.5} />
              <Line
                type="monotone"
                dataKey="transport"
                stroke="#1a3a5c"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              {/* 현재 위치 표시 */}
              {simulation && (
                <ReferenceLine
                  x={freshwaterInput}
                  stroke={simulation.status === 'collapsed' ? '#8b1a1a' : '#1a3a5c'}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* 분석 결과 */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, borderLeft: '3px solid var(--color-accent)', paddingLeft: 10 }}>
          분석 결과
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', textAlign: 'justify' }}>
          해상 관측 수치 데이터 및 시뮬레이션 자료를 기반으로 담수 유입량에 따른 염분과 순환 세기의 상관관계를
          분석한 결과, 순환의 약화가 담수의 유입에 비례하여 줄어드는 형태로 나타나지 않음을 확인하였다. 담수
          유입량이 점진적으로 늘어나더라도 일정 수준까지는 정상적인 순환 세기를 유지하지만, 염분이 계속 낮아져
          특정 한계치(약 34.0 psu)를 넘어서는 순간 해수의 수송이 급격하게 감소한다. T-S도 상에서 상태점이
          왼쪽 위로 이동하여 밀도가 낮아지는 양상이 관찰되며, 이는 심층수 형성에 필요한 밀도 조건이 충족되지
          않음을 의미한다.
        </p>
      </section>

      {/* 참고 문헌 */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: 20,
          marginTop: 40,
        }}
      >
        <h2 style={{ fontSize: 14, marginBottom: 10, fontWeight: 600 }}>참고 문헌</h2>
        <ol style={{ fontSize: 12, color: 'var(--color-text-muted)', paddingLeft: 20, lineHeight: 2 }}>
          <li>박용안 외, 《바다의 과학 해양학 원론》</li>
          <li>RAPID-MOCHA Array 관측 자료 (2004~현재)</li>
          <li>
            Van Westen, R.M. et al. (2024). &quot;Physics-based early warning signal shows that AMOC is on tipping
            course.&quot; <em>Science Advances</em>.
          </li>
        </ol>
      </footer>
    </div>
  );
}
