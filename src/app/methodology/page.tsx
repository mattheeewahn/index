'use client';

export default function Methodology() {
  return (
    <div className="page-container">
      <header style={{ marginBottom: 36, borderBottom: '2px solid var(--color-text)', paddingBottom: 18 }}>
        <h1 style={{ fontSize: 20, marginBottom: 6 }}>방법론</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          본 시뮬레이션에 사용된 수치 모델 및 수식의 이론적 근거
        </p>
      </header>

      {/* 밀도 계산 */}
      <section style={{ marginBottom: 36 }}>
        <h2 className="section-title">해수 밀도 계산: UNESCO EOS-80 근사식</h2>
        <p className="method-text">
          해수의 밀도는 수온, 염분, 압력의 함수로 결정된다. 본 시뮬레이션에서는 표층(0 dbar) 조건을 가정하고,
          UNESCO(1981)에서 채택한 국제 해수 상태 방정식(EOS-80)의 간략 근사식을 적용하여 밀도를 산출하였다.
          이 근사식은 해양학에서 표준적으로 사용되는 밀도 계산 방법이며, 실제 관측 환경에서 충분한 정확도를
          제공한다.
        </p>

        <div className="formula-block">
          <p style={{ marginBottom: 8, color: 'var(--color-text-muted)', fontSize: 11 }}>순수(담수) 밀도:</p>
          <p>ρ_fw(T) = 999.842594 + 6.793952×10⁻² T - 9.095290×10⁻³ T² + 1.001685×10⁻⁴ T³</p>
          <br />
          <p style={{ marginBottom: 8, color: 'var(--color-text-muted)', fontSize: 11 }}>해수 밀도 (염분 보정):</p>
          <p>ρ(T, S) = ρ_fw(T) + (0.824493 - 4.0899×10⁻³ T + 7.6438×10⁻⁵ T²) × S</p>
          <br />
          <p style={{ marginBottom: 8, color: 'var(--color-text-muted)', fontSize: 11 }}>여기서:</p>
          <p>T = 수온 (°C), S = 염분 (psu), ρ = 밀도 (kg/m³)</p>
        </div>

        <p className="method-text">
          이 근사식에서 염분(S)이 감소하면 밀도항의 양의 기여가 줄어들어 전체 밀도가 낮아진다. 동시에 수온(T)이
          상승하면 순수 밀도 항에서 2차 이상의 음의 기여가 커져 밀도가 추가로 감소한다. 두 효과가 동시에
          작용할 때 밀도 감소폭이 가속된다.
        </p>
      </section>

      {/* 수송량 모델 */}
      <section style={{ marginBottom: 36 }}>
        <h2 className="section-title">심층 순환 수송량: 시그모이드 붕괴 모델</h2>
        <p className="method-text">
          AMOC의 수송량은 담수 유입에 대해 비선형적으로 반응한다. Van Westen et al.(2024)의 연구에서
          확인된 바와 같이, 순환 세기는 일정 임계점까지 거의 유지되다가 해당 지점을 지나면 급격히 감소하는
          양상을 보인다. 이를 수학적으로 모사하기 위해 시그모이드(로지스틱) 함수를 채택하였다.
        </p>

        <div className="formula-block">
          <p style={{ marginBottom: 8, color: 'var(--color-text-muted)', fontSize: 11 }}>수송량 함수:</p>
          <p>Q(ΔS) = Q_max / (1 + exp(k × (ΔS - ΔS_c)))</p>
          <br />
          <p style={{ marginBottom: 8, color: 'var(--color-text-muted)', fontSize: 11 }}>매개변수:</p>
          <p>Q_max = 18.0 Sv (정상 상태 최대 수송량, RAPID 관측 기반)</p>
          <p>k = 12.0 (전이 급경사도, 비선형성 정도)</p>
          <p>ΔS_c = 1.5 psu (임계 염분 감소폭)</p>
          <br />
          <p style={{ marginBottom: 8, color: 'var(--color-text-muted)', fontSize: 11 }}>여기서:</p>
          <p>ΔS = 담수 유입에 의한 염분 감소폭 (psu)</p>
          <p>Q = 심층 순환 수송량 (Sv, 1 Sv = 10⁶ m³/s)</p>
        </div>

        <p className="method-text">
          이 함수의 핵심 특성은 ΔS가 임계점(1.5 psu) 이하일 때 수송량이 거의 최대치를 유지하다가,
          임계점을 초과하는 순간 지수적으로 급감한다는 것이다. k값이 클수록 전이가 급격하며, 이는
          실제 기후 시스템에서 관측되는 tipping point 거동과 일치한다.
        </p>
      </section>

      {/* T-S도 */}
      <section style={{ marginBottom: 36 }}>
        <h2 className="section-title">T-S도 분석 방법</h2>
        <p className="method-text">
          수온-염분도(T-S Diagram)는 해수의 물리적 특성을 2차원 평면에 투영하여 수괴(water mass)의
          성질을 파악하는 해양학의 기본 분석 도구이다. 등밀도선(isopycnal)은 동일 밀도를 갖는
          수온-염분 조합의 궤적으로, sigma-t(σt = ρ - 1000 kg/m³) 값으로 표기한다.
        </p>

        <div className="formula-block">
          <p style={{ marginBottom: 8, color: 'var(--color-text-muted)', fontSize: 11 }}>등밀도선 조건:</p>
          <p>σt = ρ(T, S) - 1000 = constant</p>
          <br />
          <p style={{ marginBottom: 8, color: 'var(--color-text-muted)', fontSize: 11 }}>침강 조건:</p>
          <p>ρ_surface &gt; ρ_subsurface → 침강 발생 (불안정 성층)</p>
          <p>ρ_surface &lt; ρ_subsurface → 침강 불가 (안정 성층)</p>
          <br />
          <p style={{ marginBottom: 8, color: 'var(--color-text-muted)', fontSize: 11 }}>정상 상태 기준점:</p>
          <p>S₀ = 35.5 psu, T₀ = 2.0 °C → σt ≈ 27.8 (심층수 형성 가능)</p>
        </div>

        <p className="method-text">
          담수가 유입되면 T-S도 상의 상태점이 왼쪽(저염분)으로 이동하며, 동시에 수온 상승으로
          위쪽으로도 이동한다. 이 이동은 상태점을 더 낮은 σt 등밀도선 쪽으로 옮기게 되어,
          밀도가 감소함을 시각적으로 확인할 수 있다.
        </p>
      </section>

      {/* 가정과 한계 */}
      <section style={{ marginBottom: 36 }}>
        <h2 className="section-title">모델의 가정 및 한계</h2>
        <ul style={{ fontSize: 14, color: 'var(--color-text-secondary)', paddingLeft: 20, lineHeight: 2.2 }}>
          <li>표층 압력(0 dbar) 조건만을 고려하며, 심해 압력 효과는 반영하지 않는다.</li>
          <li>담수 유입과 수온 상승을 선형 관계(ΔT = 0.8 × ΔS)로 단순화하였다.</li>
          <li>공간적 분포를 고려하지 않은 단일 상자 모델(box model)이다.</li>
          <li>해빙 형성, 증발, 강수 등 기타 담수 수지 요인은 배제하였다.</li>
          <li>붕괴의 비가역성(hysteresis) 효과는 본 모델에 포함되지 않는다.</li>
        </ul>
      </section>
    </div>
  );
}
