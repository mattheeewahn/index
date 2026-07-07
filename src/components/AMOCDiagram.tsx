'use client';

interface AMOCDiagramProps {
  transportRatio: number;
  status: 'normal' | 'weakened' | 'collapsed';
}

export default function AMOCDiagram({ transportRatio, status }: AMOCDiagramProps) {
  const flowOpacity = Math.max(0.1, transportRatio / 100);
  const arrowSpeed = status === 'collapsed' ? 0 : status === 'weakened' ? 8 : 4;

  const surfaceColor = status === 'normal' ? '#c62828' : status === 'weakened' ? '#e65100' : '#757575';
  const deepColor = status === 'normal' ? '#1565c0' : status === 'weakened' ? '#4a7fb5' : '#9e9e9e';

  return (
    <div className="amoc-diagram">
      <svg viewBox="0 0 700 340" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
        {/* 배경: 해양 단면 */}
        <defs>
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e3f2fd" />
            <stop offset="40%" stopColor="#bbdefb" />
            <stop offset="100%" stopColor="#1a237e" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="surfaceFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={surfaceColor} stopOpacity={flowOpacity} />
            <stop offset="100%" stopColor={surfaceColor} stopOpacity={flowOpacity * 0.6} />
          </linearGradient>
          <linearGradient id="deepFlow" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={deepColor} stopOpacity={flowOpacity} />
            <stop offset="100%" stopColor={deepColor} stopOpacity={flowOpacity * 0.6} />
          </linearGradient>
        </defs>

        {/* 해양 배경 */}
        <rect x="40" y="50" width="620" height="260" fill="url(#oceanGrad)" stroke="#90a4ae" strokeWidth="1" />

        {/* 수심 구분선 */}
        <line x1="40" y1="120" x2="660" y2="120" stroke="#90a4ae" strokeWidth="0.5" strokeDasharray="4,4" />
        <text x="46" y="68" fontSize="10" fill="#546e7a">표층 (0~200m)</text>
        <text x="46" y="138" fontSize="10" fill="#546e7a">중층</text>
        <text x="46" y="278" fontSize="10" fill="#37474f">심층 (2000m~)</text>

        {/* 대륙 표시 */}
        <rect x="40" y="30" width="120" height="20" fill="#8d6e63" rx="2" />
        <text x="70" y="44" fontSize="11" fill="#fff" fontWeight="600">그린란드</text>

        <rect x="540" y="30" width="120" height="20" fill="#8d6e63" rx="2" />
        <text x="572" y="44" fontSize="11" fill="#fff" fontWeight="600">적도 해역</text>

        {/* 표층 해류 (따뜻한 물, 북상) */}
        <path
          d="M 600 80 C 500 75, 350 75, 180 82"
          fill="none"
          stroke={surfaceColor}
          strokeWidth={Math.max(1, 6 * flowOpacity)}
          opacity={flowOpacity}
          strokeLinecap="round"
        >
          {arrowSpeed > 0 && (
            <animate attributeName="stroke-dashoffset" from="40" to="0" dur={`${arrowSpeed}s`} repeatCount="indefinite" />
          )}
        </path>
        {flowOpacity > 0.2 && (
          <polygon points="185,76 175,82 185,88" fill={surfaceColor} opacity={flowOpacity} />
        )}
        <text x="360" y="68" fontSize="10" fill={surfaceColor} textAnchor="middle" opacity={Math.max(0.4, flowOpacity)}>
          표층류 (따뜻하고 염분 높음)
        </text>

        {/* 침강 영역 */}
        <path
          d="M 150 90 C 145 140, 145 200, 155 260"
          fill="none"
          stroke={deepColor}
          strokeWidth={Math.max(1, 5 * flowOpacity)}
          opacity={flowOpacity}
          strokeLinecap="round"
          strokeDasharray={status === 'collapsed' ? '4,8' : 'none'}
        />
        {flowOpacity > 0.2 && (
          <polygon points="149,255 155,268 161,255" fill={deepColor} opacity={flowOpacity} />
        )}

        {/* 침강 영역 라벨 */}
        <rect x="90" y="160" width="80" height="36" fill="none" stroke={deepColor} strokeWidth="1" strokeDasharray="3,3" opacity={flowOpacity} rx="2" />
        <text x="130" y="176" fontSize="9" fill={deepColor} textAnchor="middle" opacity={Math.max(0.3, flowOpacity)}>침강 해역</text>
        <text x="130" y="190" fontSize="9" fill={deepColor} textAnchor="middle" opacity={Math.max(0.3, flowOpacity)}>(밀도 증가)</text>

        {/* 심층류 (차갑고 밀도 높음, 남하) */}
        <path
          d="M 170 270 C 300 275, 450 275, 590 265"
          fill="none"
          stroke={deepColor}
          strokeWidth={Math.max(1, 5 * flowOpacity)}
          opacity={flowOpacity}
          strokeLinecap="round"
        >
          {arrowSpeed > 0 && (
            <animate attributeName="stroke-dashoffset" from="0" to="40" dur={`${arrowSpeed}s`} repeatCount="indefinite" />
          )}
        </path>
        {flowOpacity > 0.2 && (
          <polygon points="585,259 598,265 585,271" fill={deepColor} opacity={flowOpacity} />
        )}
        <text x="380" y="292" fontSize="10" fill={deepColor} textAnchor="middle" opacity={Math.max(0.4, flowOpacity)}>
          심층류 (차갑고 밀도 높음)
        </text>

        {/* 담수 유입 표시 */}
        {status !== 'normal' && (
          <>
            <path d="M 100 30 L 110 55 L 95 55 Z" fill="#42a5f5" opacity="0.7" />
            <path d="M 120 30 L 130 55 L 115 55 Z" fill="#42a5f5" opacity="0.5" />
            <path d="M 140 30 L 148 55 L 132 55 Z" fill="#42a5f5" opacity="0.6" />
            <text x="125" y="22" fontSize="9" fill="#1976d2" textAnchor="middle">담수 유입</text>
          </>
        )}

        {/* 상태 표시 */}
        <rect x="460" y="130" width="180" height="60" fill="#fff" stroke="#bdbdbd" strokeWidth="0.8" rx="2" />
        <text x="550" y="150" fontSize="10" fill="#546e7a" textAnchor="middle">순환 수송량</text>
        <text x="550" y="172" fontSize="16" fill={status === 'normal' ? '#1a4d2e' : status === 'weakened' ? '#5c4200' : '#7a1a1a'} textAnchor="middle" fontWeight="600" fontFamily="Courier New">
          {(transportRatio * 0.18).toFixed(1)} Sv ({transportRatio.toFixed(0)}%)
        </text>
      </svg>
    </div>
  );
}
