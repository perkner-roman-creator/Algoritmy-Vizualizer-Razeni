import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { algorithms, AlgoKey, Step } from '../algorithms/sorting';

const DEFAULT_COUNT = 40;

function randomArray(n = DEFAULT_COUNT, min = 5, max = 100): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

export default function SortingVisualizer() {
  const [data, setData] = useState<number[]>(() => randomArray());
  const [algo, setAlgo] = useState<AlgoKey>('bubble');
  const [speedMs, setSpeedMs] = useState(80);
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(0);
  const stepsRef = useRef<Step[] | null>(null);

  // čas animace
  const [elapsedMs, setElapsedMs] = useState(0);
  const playStartRef = useRef<number | null>(null);
  const elapsedAccRef = useRef(0);

  const current = useMemo(() => {
    const s = stepsRef.current;
    return s ? s[Math.min(idx, s.length - 1)] : null;
  }, [idx]);

  // Přehrávání kroků (timer)
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setIdx((i) => {
        const s = stepsRef.current;
        if (!s) return i;
        return i < s.length - 1 ? i + 1 : i;
      });
    }, speedMs);
    return () => clearInterval(timer);
  }, [playing, speedMs]);

  // Stop na konci
  useEffect(() => {
    const s = stepsRef.current;
    if (playing && s && idx >= s.length - 1) setPlaying(false);
  }, [idx, playing]);

  // evidence času animace při play/pause
  useEffect(() => {
    if (playing) {
      playStartRef.current = performance.now();
    } else if (playStartRef.current != null) {
      const delta = performance.now() - playStartRef.current;
      playStartRef.current = null;
      elapsedAccRef.current += delta;
      setElapsedMs(Math.round(elapsedAccRef.current));
    }
  }, [playing]);

  const ensureSteps = useCallback(() => {
    if (!stepsRef.current) {
      stepsRef.current = algorithms[algo].steps(data);
      setIdx(0);
    }
  }, [algo, data]);

  const handleStart = useCallback(() => {
    ensureSteps();
    setPlaying(true);
  }, [ensureSteps]);

  const handlePause = useCallback(() => setPlaying(false), []);

  const handleStep = useCallback(() => {
    ensureSteps();
    setIdx((i) => {
      const s = stepsRef.current;
      if (!s) return i;
      return i < s.length - 1 ? i + 1 : i;
    });
  }, [ensureSteps]);

  const handleBack = useCallback(() => {
    ensureSteps();
    setIdx((i) => Math.max(0, i - 1));
  }, [ensureSteps]);

  const resetTiming = () => {
    elapsedAccRef.current = 0;
    setElapsedMs(0);
    playStartRef.current = null;
  };

  const handleReset = useCallback(() => {
    setPlaying(false);
    setIdx(0);
    stepsRef.current = null;
    resetTiming();
  }, []);

  const handleShuffle = useCallback(() => {
    setPlaying(false);
    stepsRef.current = null;
    setIdx(0);
    setData(randomArray(data.length));
    resetTiming();
  }, [data.length]);

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Number(e.target.value);
    setPlaying(false);
    stepsRef.current = null;
    setIdx(0);
    setData(randomArray(n));
    resetTiming();
  };

  // Klávesy
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.code === 'Space') {
      e.preventDefault();
      playing ? handlePause() : handleStart();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      handleStep();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      handleBack();
    }
  };

  const bars = current?.arr ?? data;
  const a = current?.a ?? -1;
  const b = current?.b ?? -1;
  const swapped = current?.swapped ?? false;

  const COLORS = {
    bar: 'var(--bar, #4f46e5)',
    compare: 'var(--bar-compare, #f59e0b)',
    swap: 'var(--bar-swap, #ef4444)',
  };

  // metriky: celkové i do aktuálního kroku
  const totals = useMemo(() => {
    const s = stepsRef.current;
    if (!s) return { steps: 0, compares: 0, swaps: 0 };
    let compares = 0, swaps = 0;
    for (const st of s) {
      if (st.swapped) swaps++;
      else if (st.a >= 0 && st.b >= 0) compares++;
    }
    return { steps: s.length, compares, swaps };
  }, [stepsRef.current]);

  const progress = useMemo(() => {
    const s = stepsRef.current;
    const end = s ? Math.min(idx + 1, s.length) : 0;
    let compares = 0, swaps = 0;
    if (s) {
      for (let i = 0; i < end; i++) {
        const st = s[i];
        if (st.swapped) swaps++;
        else if (st.a >= 0 && st.b >= 0) compares++;
      }
    }
    return { compares, swaps, step: end };
  }, [idx, stepsRef.current]);

  return (
    <div
      className="viz-root"
      tabIndex={0}
      role="application"
      onKeyDown={onKeyDown}
      aria-label="Sorting visualizer"
    >
      <div className="viz-controls">
        <label>
          Algoritmus:{' '}
          <select
            value={algo}
            onChange={(e) => {
              setAlgo(e.target.value as AlgoKey);
              handleReset();
            }}
          >
            {Object.entries(algorithms).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Rychlost: {speedMs} ms
          <input type="range" min={10} max={200} step={5} value={speedMs}
                 onChange={(e) => setSpeedMs(Number(e.target.value))}/>
        </label>

        <label>
          Počet prvků: {data.length}
          <input type="range" min={10} max={150} step={5} value={data.length}
                 onChange={handleSizeChange}/>
        </label>

        <span>Krok: {stepsRef.current ? `${idx + 1}/${totals.steps}` : '—'}</span>
        <span>Porovnání: {progress.compares}/{totals.compares}</span>
        <span>Přesuny: {progress.swaps}/{totals.swaps}</span>
        <span>Čas animace: {elapsedMs} ms</span>

        {!playing ? (
          <button type="button" onClick={handleStart} title="Space = start">Start</button>
        ) : (
          <button type="button" onClick={handlePause}>Pauza</button>
        )}
        <button type="button" onClick={handleReset}>Reset</button>
        <button type="button" onClick={handleShuffle}>Zamíchat</button>
        <button type="button" onClick={handleBack} title="← = zpět">Zpět</button>
        <button type="button" onClick={handleStep} title="→ = krok">Krok</button>
      </div>

      <p>Space = start/pause, ←/→ = krok</p>

      <div className="viz-bars">
        {bars.map((h, i) => {
          const isA = i === a;
          const isB = i === b;
          const color = isA || isB ? (swapped ? COLORS.swap : COLORS.compare) : COLORS.bar;
          return (
            <div
              key={i}
              className="viz-bar"
              style={{
                height: `${h}%`,
                backgroundColor: color,
                width: `calc(${100 / bars.length}% - 2px)`,
              }}
              title={String(h)}
            />
          );
        })}
      </div>
    </div>
  );
}