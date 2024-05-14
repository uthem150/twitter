import { useEffect, useRef } from "react";

interface StarOptions {
  x: number;
  y: number;
}

//하늘에 고정된 별. 화면 왼쪽으로 천천히 이동(왼쪽 끝에 도달하면 오른쪽 끝에서 다시 시작)
class Star {
  size: number;
  speed: number;
  x: number;
  y: number;

  constructor(options: StarOptions) {
    this.size = Math.random() * 2;
    this.speed = Math.random() * 0.1;
    this.x = options.x;
    this.y = options.y;
  }

  reset() {
    this.size = Math.random() * 2;
    this.speed = Math.random() * 0.1;
    this.x = window.innerWidth;
    this.y = Math.random() * document.body.offsetHeight;
  }

  update(bgCtx: CanvasRenderingContext2D) {
    this.x -= this.speed;
    if (this.x < 0) {
      this.reset();
    } else {
      bgCtx.fillRect(this.x, this.y, this.size, this.size);
    }
  }
}

//유성 - 대기 시간이 지나면 활성 상태가 되어 화면을 가로질러 이동(화면 끝에 도달하면 위치가 재설정)
class ShootingStar {
  x: number = 0;
  y: number = 0;
  len: number = 0;
  speed: number = 0;
  size: number = 0;
  waitTime: number = 0;
  active: boolean = false;

  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * window.innerWidth;
    this.y = 0;
    this.len = Math.random() * 80 + 10;
    this.speed = Math.random() * 10 + 6;
    this.size = Math.random() * 1 + 0.1;
    this.waitTime = new Date().getTime() + Math.random() * 3000 + 500;
    this.active = false;
  }

  update(bgCtx: CanvasRenderingContext2D, height: number) {
    if (this.active) {
      this.x -= this.speed;
      this.y += this.speed;
      if (this.x < 0 || this.y >= height) {
        this.reset();
      } else {
        bgCtx.lineWidth = this.size;
        bgCtx.beginPath();
        bgCtx.moveTo(this.x, this.y);
        bgCtx.lineTo(this.x + this.len, this.y - this.len);
        bgCtx.stroke();
      }
    } else {
      if (this.waitTime < new Date().getTime()) {
        this.active = true;
      }
    }
  }
}

export default function BackgroundAnimation() {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null); //별, 유성을 그리는 배경
  const terCanvasRef = useRef<HTMLCanvasElement>(null); //지형을 그리는 용도

  useEffect(() => {
    const terrain = terCanvasRef.current!;
    const background = bgCanvasRef.current!;
    const terCtx = terrain.getContext("2d")!;
    const bgCtx = background.getContext("2d")!;
    const width = window.innerWidth;
    let height = document.body.offsetHeight;
    height = height < 900 || height > 1100 ? 900 : height;
    //height = height < 400 ? 400 : height;

    terrain.width = background.width = width;
    terrain.height = background.height = height;

    const points: number[] = [];
    let displacement = 140;
    const power = Math.pow(2, Math.ceil(Math.log(width) / Math.log(2)));

    points[0] = height - (Math.random() * height) / 2 - displacement;
    points[power] = height - (Math.random() * height) / 2 - displacement;

    for (let i = 1; i < power; i *= 2) {
      for (let j = power / i / 2; j < power; j += power / i) {
        points[j] =
          (points[j - power / i / 2] + points[j + power / i / 2]) / 2 +
          Math.floor(Math.random() * -displacement + displacement);
      }
      displacement *= 0.6;
    }

    terCtx.beginPath();
    for (let i = 0; i <= width; i++) {
      if (i === 0) {
        terCtx.moveTo(0, points[0]);
      } else if (points[i] !== undefined) {
        terCtx.lineTo(i, points[i]);
      }
    }

    terCtx.lineTo(width, terrain.height);
    terCtx.lineTo(0, terrain.height);
    terCtx.lineTo(0, points[0]);
    terCtx.fill();

    bgCtx.fillStyle = "#05004c";
    bgCtx.fillRect(0, 0, width, height);

    const entities: (Star | ShootingStar)[] = [];

    for (let i = 0; i < height; i++) {
      entities.push(
        new Star({ x: Math.random() * width, y: Math.random() * height })
      );
    }

    entities.push(new ShootingStar());
    entities.push(new ShootingStar());

    //requestAnimationFrame을 사용하여 별과 유성이 화면을 가로지르도록 함
    function animate() {
      bgCtx.fillStyle = "#05004c";
      bgCtx.fillRect(0, 0, width, height);
      bgCtx.fillStyle = "#ffffff";
      bgCtx.strokeStyle = "#ffffff";

      entities.forEach((entity) => {
        if (entity instanceof Star) {
          entity.update(bgCtx);
        } else {
          entity.update(bgCtx, height);
        }
      });

      requestAnimationFrame(animate);
    }
    animate();
  }, []);

  return (
    <>
      {/* 페이지의 다른 요소들이 캔버스 위에 오도록 zIndex : -1로 설정 */}
      <canvas
        ref={bgCanvasRef}
        id="bgCanvas"
        style={{ position: "absolute", top: 0, left: 0, zIndex: -1 }}
      ></canvas>
      <canvas
        ref={terCanvasRef}
        id="terCanvas"
        style={{ position: "absolute", top: 0, left: 0, zIndex: -1 }}
      ></canvas>
    </>
  );
}
