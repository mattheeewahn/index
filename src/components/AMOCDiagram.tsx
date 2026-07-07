'use client';

import { useEffect, useRef } from 'react';

interface AMOCDiagramProps {
  transportRatio: number;
  status: 'normal' | 'weakened' | 'collapsed';
  freshwaterInput: number;
}

interface Particle {
  x: number;
  y: number;
  progress: number;
  speed: number;
  type: 'surface' | 'deep' | 'sinking' | 'rising';
  opacity: number;
}

interface Droplet {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
}

export default function AMOCDiagram({ transportRatio, status, freshwaterInput }: AMOCDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const dropletsRef = useRef<Droplet[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 420;
    canvas.width = W;
    canvas.height = H;

    // 순환 경로 정의
    const surfacePath = (t: number) => ({
      x: 680 - t * 520,
      y: 95 + Math.sin(t * Math.PI * 2) * 8,
    });

    const sinkingPath = (t: number) => ({
      x: 155 + Math.sin(t * Math.PI * 0.5) * 5,
      y: 100 + t * 210,
    });

    const deepPath = (t: number) => ({
      x: 160 + t * 520,
      y: 330 - Math.sin(t * Math.PI * 2) * 6,
    });

    const risingPath = (t: number) => ({
      x: 680 - Math.sin(t * Math.PI * 0.5) * 5,
      y: 330 - t * 230,
    });

    // 입자 초기화
    const initParticles = () => {
      const particles: Particle[] = [];
      const count = 35;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: 0, y: 0,
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.001,
          type: ['surface', 'deep', 'sinking', 'rising'][i % 4] as Particle['type'],
          opacity: 0.6 + Math.random() * 0.4,
        });
      }
      return particles;
    };

    if (particlesRef.current.length === 0) {
      particlesRef.current = initParticles();
    }

    const animate = () => {
      timeRef.current += 1;
      ctx.clearRect(0, 0, W, H);

      const flowStrength = transportRatio / 100;
      const meltAmount = freshwaterInput / 3;

      // === 배경: 하늘 ===
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 60);
      skyGrad.addColorStop(0, '#dce8f5');
      skyGrad.addColorStop(1, '#c5ddf0');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, 60);

      // === 배경: 바다 ===
      const oceanGrad = ctx.createLinearGradient(0, 60, 0, H);
      oceanGrad.addColorStop(0, status === 'collapsed' ? '#7ba3b8' : '#4a90b8');
      oceanGrad.addColorStop(0.3, status === 'collapsed' ? '#4a7090' : '#2d6a8a');
      oceanGrad.addColorStop(1, '#0d2137');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 60, W, H - 60);

      // === 그린란드 빙하 ===
      const iceHeight = 65 - meltAmount * 20;
      const iceWidth = 160 - meltAmount * 30;

      // 빙하 본체
      ctx.beginPath();
      ctx.moveTo(20, 60);
      ctx.lineTo(20 + iceWidth * 0.2, 60 - iceHeight);
      ctx.lineTo(20 + iceWidth * 0.5, 60 - iceHeight * 1.1);
      ctx.lineTo(20 + iceWidth * 0.8, 60 - iceHeight * 0.9);
      ctx.lineTo(20 + iceWidth, 60);
      ctx.closePath();

      const iceGrad = ctx.createLinearGradient(20, 60 - iceHeight, 20, 60);
      iceGrad.addColorStop(0, '#f5f9ff');
      iceGrad.addColorStop(0.5, '#d0e4f5');
      iceGrad.addColorStop(1, '#a0c8e8');
      ctx.fillStyle = iceGrad;
      ctx.fill();
      ctx.strokeStyle = '#7aafc8';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 빙하 갈라진 선
      if (meltAmount > 0.3) {
        ctx.strokeStyle = `rgba(80, 150, 200, ${meltAmount * 0.6})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(60, 60 - iceHeight * 0.8);
        ctx.lineTo(55, 60 - iceHeight * 0.4);
        ctx.lineTo(62, 60);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(100, 60 - iceHeight * 0.7);
        ctx.lineTo(105, 60 - iceHeight * 0.3);
        ctx.stroke();
      }

      // 녹는 물방울 효과
      if (freshwaterInput > 0) {
        // 물방울 생성
        if (timeRef.current % Math.max(2, Math.floor(10 - freshwaterInput * 3)) === 0) {
          dropletsRef.current.push({
            x: 30 + Math.random() * iceWidth * 0.8,
            y: 58,
            speed: 0.8 + Math.random() * 0.5,
            size: 1.5 + freshwaterInput * 0.8,
            opacity: 0.7 + Math.random() * 0.3,
          });
        }

        // 물방울 업데이트
        dropletsRef.current = dropletsRef.current.filter((d) => {
          d.y += d.speed;
          d.opacity -= 0.005;
          if (d.y > 120 || d.opacity <= 0) return false;

          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100, 180, 255, ${d.opacity})`;
          ctx.fill();
          return true;
        });

        // 담수 확산 영역 (표층 연한 색)
        const spreadWidth = 100 + freshwaterInput * 60;
        const freshGrad = ctx.createRadialGradient(100, 75, 0, 100, 75, spreadWidth);
        freshGrad.addColorStop(0, `rgba(130, 200, 255, ${meltAmount * 0.35})`);
        freshGrad.addColorStop(1, 'rgba(130, 200, 255, 0)');
        ctx.fillStyle = freshGrad;
        ctx.fillRect(20, 60, spreadWidth * 2, 60);
      }

      // === 수심 구분선 ===
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(180, 210, 230, 0.4)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(20, 160);
      ctx.lineTo(780, 160);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(20, 260);
      ctx.lineTo(780, 260);
      ctx.stroke();
      ctx.setLineDash([]);

      // 수심 라벨
      ctx.font = '10px "Noto Sans KR", sans-serif';
      ctx.fillStyle = 'rgba(200, 220, 240, 0.7)';
      ctx.fillText('표층 0~200m', 700, 75);
      ctx.fillText('중층', 700, 175);
      ctx.fillText('심층 2000m+', 700, 350);

      // === 순환 경로 표시 (흐름 곡선) ===
      // 표층류 (따뜻한, 북상)
      ctx.beginPath();
      ctx.moveTo(680, 95);
      ctx.bezierCurveTo(550, 85, 350, 85, 160, 100);
      ctx.strokeStyle = `rgba(220, 80, 50, ${flowStrength * 0.5})`;
      ctx.lineWidth = Math.max(1, 4 * flowStrength);
      ctx.stroke();

      // 침강
      ctx.beginPath();
      ctx.moveTo(155, 105);
      ctx.bezierCurveTo(150, 180, 150, 260, 160, 330);
      ctx.strokeStyle = `rgba(30, 90, 160, ${flowStrength * 0.5})`;
      ctx.lineWidth = Math.max(1, 3.5 * flowStrength);
      if (status === 'collapsed') {
        ctx.setLineDash([3, 6]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // 심층류 (차갑고, 남하)
      ctx.beginPath();
      ctx.moveTo(165, 330);
      ctx.bezierCurveTo(350, 340, 550, 335, 680, 325);
      ctx.strokeStyle = `rgba(30, 90, 160, ${flowStrength * 0.5})`;
      ctx.lineWidth = Math.max(1, 4 * flowStrength);
      ctx.stroke();

      // 용승
      ctx.beginPath();
      ctx.moveTo(680, 320);
      ctx.bezierCurveTo(685, 240, 685, 160, 680, 100);
      ctx.strokeStyle = `rgba(180, 80, 50, ${flowStrength * 0.3})`;
      ctx.lineWidth = Math.max(0.5, 2 * flowStrength);
      ctx.stroke();

      // === 순환 입자 애니메이션 ===
      particlesRef.current.forEach((p) => {
        // 속도 업데이트 (순환 세기에 비례)
        const effectiveSpeed = p.speed * flowStrength;

        if (status === 'collapsed') {
          // 붕괴 시: 입자 산발적으로 떠다님
          p.x += (Math.random() - 0.5) * 0.5;
          p.y += (Math.random() - 0.5) * 0.3;
          p.opacity = 0.2 + Math.random() * 0.15;
        } else {
          p.progress += effectiveSpeed;
          if (p.progress > 1) p.progress = 0;

          let pos;
          switch (p.type) {
            case 'surface':
              pos = surfacePath(p.progress);
              break;
            case 'sinking':
              pos = sinkingPath(p.progress);
              break;
            case 'deep':
              pos = deepPath(p.progress);
              break;
            case 'rising':
              pos = risingPath(p.progress);
              break;
          }
          p.x = pos.x;
          p.y = pos.y;
          p.opacity = 0.5 + flowStrength * 0.5;
        }

        // 입자 그리기
        const size = p.type === 'surface' || p.type === 'rising' ? 4 : 3.5;
        let color: string;

        if (p.type === 'surface' || p.type === 'rising') {
          color = status === 'normal' ? `rgba(220, 80, 50, ${p.opacity})`
            : status === 'weakened' ? `rgba(200, 120, 50, ${p.opacity})`
            : `rgba(150, 150, 150, ${p.opacity * 0.5})`;
        } else {
          color = status === 'normal' ? `rgba(30, 100, 180, ${p.opacity})`
            : status === 'weakened' ? `rgba(60, 120, 170, ${p.opacity})`
            : `rgba(130, 130, 130, ${p.opacity * 0.5})`;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // 흔적 효과
        if (status !== 'collapsed') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size + 2, 0, Math.PI * 2);
          ctx.fillStyle = color.replace(/[\d.]+\)$/, `${p.opacity * 0.2})`);
          ctx.fill();
        }
      });

      // === 화살표 (방향 표시) ===
      if (flowStrength > 0.1) {
        const arrowOpacity = flowStrength * 0.7;

        // 표층류 화살표 (왼쪽으로)
        drawArrow(ctx, 400, 90, 350, 90, `rgba(220, 80, 50, ${arrowOpacity})`, 2);
        drawArrow(ctx, 280, 93, 230, 95, `rgba(220, 80, 50, ${arrowOpacity})`, 2);

        // 심층류 화살표 (오른쪽으로)
        drawArrow(ctx, 350, 333, 400, 333, `rgba(30, 90, 160, ${arrowOpacity})`, 2);
        drawArrow(ctx, 500, 330, 550, 328, `rgba(30, 90, 160, ${arrowOpacity})`, 2);

        // 침강 화살표
        drawArrow(ctx, 155, 200, 157, 250, `rgba(30, 90, 160, ${arrowOpacity})`, 2);
      }

      // === 라벨 ===
      ctx.font = '11px "Noto Sans KR", sans-serif';

      // 표층류 라벨
      ctx.fillStyle = `rgba(200, 60, 40, ${Math.max(0.4, flowStrength)})`;
      ctx.fillText('표층류 (따뜻한 해수, 북상)', 350, 78);

      // 심층류 라벨
      ctx.fillStyle = `rgba(20, 70, 140, ${Math.max(0.4, flowStrength)})`;
      ctx.fillText('심층류 (차갑고 밀도 높은 해수, 남하)', 300, 360);

      // 침강 라벨
      ctx.fillStyle = `rgba(20, 70, 140, ${Math.max(0.3, flowStrength)})`;
      ctx.save();
      ctx.translate(130, 220);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('침강', 0, 0);
      ctx.restore();

      // === 상태 박스 ===
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.strokeStyle = '#bbb';
      ctx.lineWidth = 0.8;
      roundRect(ctx, 560, 140, 200, 75, 3);
      ctx.fill();
      ctx.stroke();

      ctx.font = '10px "Noto Sans KR", sans-serif';
      ctx.fillStyle = '#666';
      ctx.fillText('AMOC 수송량', 610, 158);

      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillStyle = status === 'normal' ? '#1a4d2e' : status === 'weakened' ? '#5c4200' : '#7a1a1a';
      ctx.fillText(`${(transportRatio * 0.18).toFixed(1)} Sv`, 610, 182);

      ctx.font = '11px "Noto Sans KR", sans-serif';
      ctx.fillStyle = ctx.fillStyle;
      const statusText = status === 'normal' ? '정상 순환' : status === 'weakened' ? '순환 약화 중' : '순환 정지';
      ctx.fillText(`${statusText} (${transportRatio.toFixed(0)}%)`, 610, 202);

      // === 붕괴 시 효과 (입자 정체, 표층 정체수 표현) ===
      if (status === 'collapsed') {
        // 표층에 정체된 물 표현 (움직이지 않는 연한 영역)
        const stagnantGrad = ctx.createLinearGradient(100, 65, 700, 65);
        stagnantGrad.addColorStop(0, 'rgba(160, 190, 210, 0.25)');
        stagnantGrad.addColorStop(0.5, 'rgba(140, 170, 200, 0.2)');
        stagnantGrad.addColorStop(1, 'rgba(160, 190, 210, 0.15)');
        ctx.fillStyle = stagnantGrad;
        ctx.fillRect(100, 62, 600, 50);

        // 침강 영역에 밀도 부족 표시 (연한 색 영역)
        ctx.fillStyle = 'rgba(180, 210, 240, 0.2)';
        ctx.beginPath();
        ctx.ellipse(155, 200, 30, 80, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '10px "Noto Sans KR", sans-serif';
        ctx.fillStyle = 'rgba(100, 50, 50, 0.7)';
        ctx.fillText('밀도 부족 - 침강 불가', 100, 295);
      }

      // === 그린란드 라벨 ===
      ctx.font = '11px "Noto Sans KR", sans-serif';
      ctx.fillStyle = '#445';
      ctx.fillText('그린란드', 50, 60 - iceHeight - 10);

      // 적도 해역 표시
      ctx.fillStyle = '#445';
      ctx.fillText('적도 해역', 710, 75);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [transportRatio, status, freshwaterInput]);

  return (
    <div className="amoc-diagram">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 'auto', borderRadius: 3, border: '1px solid var(--color-border)' }}
      />
    </div>
  );
}

function drawArrow(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string, width: number) {
  const headLen = 8;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
