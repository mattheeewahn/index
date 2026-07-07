'use client';

export default function References() {
  return (
    <div className="page-container">
      <header style={{ marginBottom: 36, borderBottom: '2px solid var(--color-text)', paddingBottom: 18 }}>
        <h1 style={{ fontSize: 20, marginBottom: 6 }}>참고 문헌</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          본 시뮬레이션의 이론적 근거 및 데이터 출처
        </p>
      </header>

      <section style={{ marginBottom: 36 }}>
        <h2 className="section-title">주요 참고 문헌</h2>
        <ol style={{ fontSize: 13, color: 'var(--color-text-secondary)', paddingLeft: 24, lineHeight: 2.6 }}>
          <li style={{ marginBottom: 12 }}>
            <span style={{ color: 'var(--color-text)' }}>박용안, 오재호, 서애숙 외</span><br />
            《바다의 과학 해양학 원론》, 시그마프레스<br />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              - 해양 열염순환 기본 원리, T-S도 분석법, 북대서양 심층수 형성 메커니즘
            </span>
          </li>
          <li style={{ marginBottom: 12 }}>
            <span style={{ color: 'var(--color-text)' }}>Van Westen, R.M., Kliphuis, M., Dijkstra, H.A. (2024)</span><br />
            &quot;Physics-based early warning signal shows that AMOC is on tipping course.&quot;
            <em> Science Advances</em>, 10(6).<br />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              - AMOC 임계점(tipping point) 존재의 물리적 증거, 비선형 붕괴 모델의 이론적 토대
            </span>
          </li>
          <li style={{ marginBottom: 12 }}>
            <span style={{ color: 'var(--color-text)' }}>RAPID-MOCHA Monitoring Array (2004~현재)</span><br />
            National Oceanography Centre, UK / NOAA, USA<br />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              - 26.5°N에서의 AMOC 연속 관측 자료. 정상 상태 수송량 약 17~18 Sv 기준값 산출 근거
            </span>
          </li>
          <li style={{ marginBottom: 12 }}>
            <span style={{ color: 'var(--color-text)' }}>UNESCO (1981)</span><br />
            &quot;Tenth Report of the Joint Panel on Oceanographic Tables and Standards.&quot;
            <em> UNESCO Technical Papers in Marine Science</em>, No. 36.<br />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              - 국제 해수 상태 방정식(EOS-80) 정의. 해수 밀도 계산의 국제 표준
            </span>
          </li>
          <li style={{ marginBottom: 12 }}>
            <span style={{ color: 'var(--color-text)' }}>Stommel, H. (1961)</span><br />
            &quot;Thermohaline convection with two stable regimes of flow.&quot;
            <em> Tellus</em>, 13(2), 224-230.<br />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              - 열염순환의 다중 안정 상태(bistability) 개념 최초 제시. 담수 섭동에 의한 순환 붕괴 이론의 기초
            </span>
          </li>
          <li style={{ marginBottom: 12 }}>
            <span style={{ color: 'var(--color-text)' }}>Rahmstorf, S. (2002)</span><br />
            &quot;Ocean circulation and climate during the past 120,000 years.&quot;
            <em> Nature</em>, 419, 207-214.<br />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              - 과거 빙하기~간빙기 전환 시 AMOC 급변 사건(Heinrich Events)의 고해양학적 증거
            </span>
          </li>
        </ol>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 className="section-title">사용 데이터 및 매개변수 근거</h2>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', marginTop: 12 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>매개변수</th>
              <th style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>값</th>
              <th style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>출처</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px 12px' }}>정상 상태 표층 염분</td>
              <td style={{ padding: '8px 12px', fontFamily: 'Courier New' }}>35.5 psu</td>
              <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>해양학 원론 / WOA 기후값</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px 12px' }}>정상 상태 표층 수온</td>
              <td style={{ padding: '8px 12px', fontFamily: 'Courier New' }}>2.0 °C</td>
              <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>북대서양 심층수 형성 해역 평균</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px 12px' }}>정상 수송량</td>
              <td style={{ padding: '8px 12px', fontFamily: 'Courier New' }}>18.0 Sv</td>
              <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>RAPID Array (2004~2020 평균)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px 12px' }}>임계 염분 감소폭</td>
              <td style={{ padding: '8px 12px', fontFamily: 'Courier New' }}>1.5 psu</td>
              <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>Van Westen et al. (2024) 추정</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px 12px' }}>전이 급경사도 (k)</td>
              <td style={{ padding: '8px 12px', fontFamily: 'Courier New' }}>12.0</td>
              <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>모델 보정값 (비선형성 정도)</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
