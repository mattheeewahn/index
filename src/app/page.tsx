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
  ReferenceDot,
} from 'recharts';
import AMOCDiagram from '@/components/AMOCDiagram';

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

const SCENARIOS = [
  { label: '정상 상태', value: 0, desc: '현재 관측 평균 (35.5 psu)' },
  { label: '현재(2024)', value: 0.3, desc: 'RAPID 관측 기반 추정' },
  { label: 'RCP 4.5', value: 0.9, desc: '2100년 중간 배출 시나리오' },
  { label: 'RCP 8.5', value: 1.8, desc: '2100년 고배출 시나리오' },
  { label: '극단 시나리오', value: 2.5, desc: '완전 붕괴 가정' },
];

export default function Home() {
  const [freshwaterInput, setFreshwaterInput] = useState(0);
  const [activeScenario, setActiveScenario] = useState(0);
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
    const val = parseFloat(e.target.value);
    setFreshwaterInput(val);
    setActiveScenario(-1);
  };

  const handleScenario = (index: number) => {
    setActiveScenario(index);
    setFreshwaterInput(SCENARIOS[index].value);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'normal': return '정상 순환';
      case 'weakened': return '순환 약화';
      case 'collapsed': return '순환 붕괴';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'var(--color-safe)';
      case 'weakened': return 'var(--color-warning)';
      case 'collapsed': return 'var(--color-danger)';
      default: return 'var(--color-text)';
    }
  };

  const getDynamicAnalysis = () => {
    if (!simulation) return '';
    const { currentSalinity, currentTemperature, transport, transportRatio, densityAnomaly } = simulation.result;

    if (simulation.status === 'normal') {
      return `현재 표층 염분 ${currentSalinity.toFixed(2)} psu, 수온 ${currentTemperature.toFixed(1)}°C 조건에서 해수 밀도는 정상 범위를 유지하고 있다. 심층 순환 수송량은 ${transport.toFixed(1)} Sv로 기준 대비 ${transportRatio.toFixed(0)}% 수준이며, 북대서양 심층수 형성이 정상적으로 이루어지고 있는 상태이다.`;
    } else if (simulation.status === 'weakened') {
      return `담수 유입으로 인해 표층 염분이 ${currentSalinity.toFixed(2)} psu로 감소하였으며, 수온은 ${currentTemperature.toFixed(1)}°C로 상승하였다. 해수 밀도 편차는 ${densityAnomaly.toFixed(3)} kg/m³로 나타나 침강 조건이 약화되고 있다. 수송량이 ${transport.toFixed(1)} Sv(${transportRatio.toFixed(0)}%)로 줄어들었으며, 임계점에 접근 중이다.`;
    } else {
      return `표층 염분이 ${currentSalinity.toFixed(2)} psu까지 감소하면서 해수 밀도가 임계 수준 이하로 떨어졌다. 밀도 편차 ${densityAnomaly.toFixed(3)} kg/m³는 심층수 형성을 사실상 불가능하게 만들며, 수송량은 ${transport.toFixed(1)} Sv(${transportRatio.toFixed(0)}%)로 순환이 거의 정지한 상태이다. 이는 비가역적 붕괴 구간에 해당한다.`;
    }
  };

  const currentPoint = simulation
    ? [{ salinity: simulation.result.currentSalinity, temperature: simulation.result.currentTemperature, z: 150 }]
    : [];

  const basePoint = [{ salinity: 35.5, temperature: 2.0, z: 100 }];

  // 이동 경로 (기준점 → 현재점)
  const pathPoints = simulation
    ? Array.from({ length: 10 }, (_, i) => ({
        salinity: 35.5 + (simulation.result.currentSalinity - 35.5) * (i / 9),
        temperature: 2.0 + (simulation.result.currentTemperature - 2.0) * (i / 9),
        z: 20,
      }))
    : [];

  return (
    <div className="page-container">
      {/* 제목 */}
      <header style={{ marginBottom: 36, borderBottom: '2px solid var(--color-text)', paddingBottom: 18 }}>
        <h1 style={{ fontSize: 20, marginBottom: 6, letterSpacing: '-0.3px' }}>
          북대서양 심층 순환(AMOC) 담수 유입에 따른 비선형 붕괴 시뮬레이션
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          그린란드 빙하 융해수 유입량 변화에 따른 표층 염분, 해수 밀도, 심층 순환 수송량의 상관관계 분석
        </p>
      </header>

      {/* 연구 배경 */}
      <section style={{ marginBottom: 32 }}>
        <h2 className="section-title">연구 배경</h2>
        <p className="method-text">
          지구 온난화가 가속화됨에 따라 그린란드 대륙의 빙하가 빠르게 녹아내리고 있으며, 이로 인해 많은 양의
          담수가 북대서양 침강 해역으로 유입되는 담수화 현상이 발생하고 있다. 정상 상태의 북대서양 표층 해수는 약
          35.5psu로 평균보다 0.5 더 높은 염분을 유지하지만, 표층 수온이 상승하고 빙하가 녹아 담수가 유입되어 염분이
          34.0psu로 감소하면 해수의 밀도는 심해로 가라앉기에 부족한 상태가 된다. 본 시뮬레이션은 담수 유입량에 따른
          염분과 순환 세기의 상관관계를 분석하여, 순환의 약화가 담수의 유입에 비례하여 선형적으로 줄어드는 형태가
          아닌, 임계점을 중심으로 급격히 붕괴하는 비선형 양상임을 검증한다.
        </p>
      </section>

      {/* AMOC 순환 개념도 */}
      <section className="section-card">
        <h2 className="section-title">대서양 자오면 순환(AMOC) 개념도</h2>
        <p className="section-desc">
          표층류의 북상과 심층류의 남하로 구성되는 열염순환의 단면 모식도. 담수 유입에 따른 순환 세기 변화가 반영된다.
        </p>
        {simulation && (
          <AMOCDiagram transportRatio={simulation.result.transportRatio} status={simulation.status} />
        )}
      </section>

      {/* 시나리오 프리셋 + 변수 제어 */}
      <section className="section-card">
        <h2 className="section-title">변수 제어</h2>

        {/* 시나리오 버튼 */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10 }}>기후 시나리오 프리셋</p>
          <div className="scenario-group">
            {SCENARIOS.map((s, i) => (
              <button
                key={i}
                className={`scenario-btn ${activeScenario === i ? 'active' : ''}`}
                onClick={() => handleScenario(i)}
                title={s.desc}
              >
                {s.label}
              </button>
            ))}
          </div>
          {activeScenario >= 0 && (
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
              {SCENARIOS[activeScenario].desc} (염분 감소폭: {SCENARIOS[activeScenario].value} psu)
            </p>
          )}
        </div>

        {/* 슬라이더 */}
        <div style={{ marginBottom: 18 }}>
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
            <span style={{ fontFamily: 'Courier New, monospace', fontSize: 15, fontWeight: 600, minWidth: 80, textAlign: 'right' }}>
              {freshwaterInput.toFixed(2)} psu
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
            <span>0.00 (정상 상태)</span>
            <span>1.50 (임계 구간)</span>
            <span>3.00 (최대 유입)</span>
          </div>
        </div>

        {/* 결과 수치 */}
        {simulation && (
          <div className="data-grid">
            <div className="data-cell">
              <div className="data-label">현재 표층 염분</div>
              <div className="data-value">{simulation.result.currentSalinity.toFixed(2)} psu</div>
            </div>
            <div className="data-cell">
              <div className="data-label">현재 표층 수온</div>
              <div className="data-value">{simulation.result.currentTemperature.toFixed(2)} °C</div>
            </div>
            <div className="data-cell">
              <div className="data-label">해수 밀도</div>
              <div className="data-value">{simulation.result.currentDensity.toFixed(3)} kg/m³</div>
            </div>
            <div className="data-cell" style={{ borderColor: getStatusColor(simulation.status) }}>
              <div className="data-label">심층 순환 수송량</div>
              <div className="data-value" style={{ color: getStatusColor(simulation.status) }}>
                {simulation.result.transport.toFixed(1)} Sv
              </div>
              <div style={{ fontSize: 11, marginTop: 2, color: getStatusColor(simulation.status) }}>
                {getStatusLabel(simulation.status)} ({simulation.result.transportRatio}%)
              </div>
            </div>
          </div>
        )}

        {/* 동적 해석 */}
        {simulation && (
          <div className="analysis-dynamic">{getDynamicAnalysis()}</div>
        )}
      </section>

      {/* T-S도 */}
      <section className="section-card">
        <h2 className="section-title">수온-염분도 (T-S Diagram)</h2>
        <p className="section-desc">
          회색 선: 등밀도선 (sigma-t, 라벨 표기) / 검은 점: 정상 상태 기준점 (35.5 psu, 2.0°C) / 점선: 상태 이동 경로 / 색상 점: 현재 상태
        </p>
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 35, left: 55 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis
              dataKey="salinity"
              type="number"
              domain={[32, 37]}
              name="염분"
              unit=" psu"
              label={{ value: '표층 염분 (psu)', position: 'bottom', offset: 12, style: { fontSize: 12, fill: '#4a4a4a' } }}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              dataKey="temperature"
              type="number"
              domain={[-1, 10]}
              name="수온"
              unit=" °C"
              label={{ value: '표층 수온 (°C)', angle: -90, position: 'insideLeft', offset: -40, style: { fontSize: 12, fill: '#4a4a4a' } }}
              tick={{ fontSize: 11 }}
            />
            <ZAxis dataKey="z" range={[20, 150]} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === '염분') return [value.toFixed(2) + ' psu', '염분'];
                if (name === '수온') return [value.toFixed(2) + ' °C', '수온'];
                return [value, name];
              }}
            />
            {/* 등밀도선 */}
            {isopycnals.map((line) => (
              <Scatter
                key={`iso-${line.sigma}`}
                data={line.points.map((p) => ({ ...p, z: 5 }))}
                fill="none"
                stroke="#aaa"
                strokeWidth={0.8}
                line={{ strokeWidth: 0.8, strokeDasharray: '2,2' }}
                shape={() => <></>}
                name={`σt=${line.sigma}`}
                legendType="none"
              />
            ))}
            {/* 이동 경로 */}
            {pathPoints.length > 0 && freshwaterInput > 0 && (
              <Scatter
                data={pathPoints}
                fill="none"
                stroke="#999"
                strokeWidth={1}
                line={{ strokeWidth: 1, strokeDasharray: '3,3' }}
                shape={() => <></>}
                legendType="none"
              />
            )}
            {/* 기준점 */}
            <Scatter name="기준점" data={basePoint} fill="#1a1a1a" shape="circle" />
            {/* 현재 상태 */}
            <Scatter
              name="현재 상태"
              data={currentPoint}
              fill={getStatusColor(simulation?.status || 'normal')}
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
        {/* 등밀도선 라벨 범례 */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, paddingLeft: 55 }}>
          {isopycnals.map((line) => (
            <span key={line.sigma} style={{ fontSize: 10, color: '#888' }}>
              σt = {line.sigma}
            </span>
          ))}
        </div>
      </section>

      {/* 붕괴 곡선 */}
      <section className="section-card">
        <h2 className="section-title">담수 유입량 대비 심층 순환 수송량 변화</h2>
        <p className="section-desc">
          빨간 점선: 임계점 (1.5 psu 감소폭) / 원형 점: 현재 시뮬레이션 상태 위치
        </p>
        {flowCurve && simulation && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={flowCurve.data} margin={{ top: 10, right: 30, bottom: 35, left: 55 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis
                dataKey="freshwaterInput"
                type="number"
                domain={[0, 3]}
                label={{ value: '담수 유입량 (psu 감소폭)', position: 'bottom', offset: 12, style: { fontSize: 12, fill: '#4a4a4a' } }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                domain={[0, 20]}
                label={{ value: '수송량 (Sv)', angle: -90, position: 'insideLeft', offset: -40, style: { fontSize: 12, fill: '#4a4a4a' } }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number) => [value.toFixed(2) + ' Sv', '수송량']}
                labelFormatter={(label: number) => `감소폭: ${Number(label).toFixed(2)} psu`}
              />
              <ReferenceLine x={1.5} stroke="#7a1a1a" strokeDasharray="5 5" strokeWidth={1.2} label={{ value: '임계점', position: 'top', fontSize: 10, fill: '#7a1a1a' }} />
              <Line type="monotone" dataKey="transport" stroke="#1a3a5c" strokeWidth={2} dot={false} />
              {/* 현재 위치 점 */}
              <ReferenceDot
                x={freshwaterInput}
                y={simulation.result.transport}
                r={6}
                fill={getStatusColor(simulation.status)}
                stroke="#fff"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* 분석 결과 */}
      <section style={{ marginBottom: 32 }}>
        <h2 className="section-title">분석 결과</h2>
        <p className="method-text">
          해상 관측 수치 데이터 및 시뮬레이션 자료를 기반으로 담수 유입량에 따른 염분과 순환 세기의 상관관계를
          분석한 결과, 순환의 약화가 담수의 유입에 비례하여 줄어드는 형태로 나타나지 않음을 확인하였다. 담수
          유입량이 점진적으로 늘어나더라도 일정 수준까지는 정상적인 순환 세기를 유지하지만, 염분이 계속 낮아져
          특정 한계치(약 34.0 psu)를 넘어서는 순간 해수의 수송이 급격하게 감소한다. T-S도 상에서 상태점이
          왼쪽 위로 이동하여 밀도가 낮아지는 양상이 관찰되며, 이는 심층수 형성에 필요한 밀도 조건이 충족되지
          않음을 의미한다.
        </p>
      </section>
    </div>
  );
}
