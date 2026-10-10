/** Box–Muller */
function gaussian(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function meanOf(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/** 样本标准差（除以 n-1） */
export function sampleStd(arr: number[]) {
  const n = arr.length;
  if (n < 2) return 0;
  const m = meanOf(arr);
  const sumSq = arr.reduce((a, b) => a + (b - m) ** 2, 0);
  return Math.sqrt(sumSq / (n - 1));
}

export function statsOf(arr: number[]) {
  return {
    min: Math.min(...arr),
    max: Math.max(...arr),
    mean: meanOf(arr),
    std: sampleStd(arr),
  };
}

/** [min,max] 上可达的最大样本标准差（尽量取两端点） */
export function maxAchievableStd(n: number, min: number, max: number) {
  const mean = (min + max) / 2;
  const nLow = Math.floor(n / 2);
  const nHigh = n - nLow;
  const sumSq = nLow * (min - mean) ** 2 + nHigh * (max - mean) ** 2;
  return Math.sqrt(sumSq / (n - 1));
}

function shuffleInPlace(arr: number[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function truncatedNormal(mean: number, std: number, min: number, max: number) {
  // 截断正态：拒绝采样
  for (let k = 0; k < 1000; k++) {
    const x = mean + std * gaussian();
    if (x >= min && x <= max) return x;
  }
  // 极端情况下退回区间内均匀
  return min + Math.random() * (max - min);
}

/**
 * 生成 n 个随机数：落在 [min,max]，样本标准差贴近 targetStd，
 * 均值约 (min+max)/2，并保证出现最小值与最大值。
 */
export function generateWithMinMaxStd(
  n: number,
  min: number,
  max: number,
  targetStd: number,
): number[] {
  if (n < 2) throw new Error("数量至少为 2");
  if (!(max > min)) throw new Error("最大值必须大于最小值");
  if (!(targetStd > 0)) throw new Error("标准差必须大于 0");

  const mean = (min + max) / 2;
  const maxStd = maxAchievableStd(n, min, max);
  if (targetStd > maxStd + 1e-9) {
    throw new Error(
      `在该区间内标准差最大约 ${maxStd.toFixed(6)}，当前目标过大`,
    );
  }

  // 二分搜索截断正态的提议标准差，使样本标准差接近目标
  let lo = targetStd * 0.05;
  let hi = (max - min) * 2;
  let best: number[] = [];
  let bestErr = Infinity;

  for (let trial = 0; trial < 36; trial++) {
    const proposal = (lo + hi) / 2;
    const arr = Array.from({ length: n }, () =>
      truncatedNormal(mean, proposal, min, max),
    );
    // 写入端点，保证已知最小/最大会出现
    arr[0] = min;
    arr[1] = max;
    const s = sampleStd(arr);
    const err = Math.abs(s - targetStd);
    if (err < bestErr) {
      bestErr = err;
      best = arr.slice();
    }
    if (s < targetStd) lo = proposal;
    else hi = proposal;
  }

  let arr = best;

  // 精修：缩放内部点以逼近目标标准差，同时保持落在区间内
  for (let iter = 0; iter < 60; iter++) {
    let iMin = 0;
    let iMax = 1;
    for (let i = 0; i < n; i++) {
      if (arr[i] <= arr[iMin]) iMin = i;
      if (arr[i] >= arr[iMax]) iMax = i;
    }
    arr[iMin] = min;
    arr[iMax] = max;

    const m = meanOf(arr);
    const s = sampleStd(arr);
    if (s < 1e-12) break;
    const rel = Math.abs(s - targetStd) / targetStd;
    if (rel < 5e-5) break;

    const scale = targetStd / s;
    arr = arr.map((x, i) => {
      if (i === iMin || i === iMax) return x;
      const y = m + (x - m) * scale;
      return Math.min(max, Math.max(min, y));
    });
  }

  // 若仍略偏小（大量贴边），把部分内部点弹向端点
  for (let iter = 0; iter < 40; iter++) {
    const s = sampleStd(arr);
    const rel = Math.abs(s - targetStd) / targetStd;
    if (rel < 5e-5) break;
    if (s >= targetStd) break;

    const m = meanOf(arr);
    // 找一个最靠近均值的内部点，推向更远的一侧
    let bestI = -1;
    let bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      if (arr[i] === min || arr[i] === max) continue;
      const d = Math.abs(arr[i] - m);
      if (d < bestDist) {
        bestDist = d;
        bestI = i;
      }
    }
    if (bestI < 0) break;
    // 推向距离更远的端点，幅度随缺口增大
    const towardMax = Math.abs(max - m) >= Math.abs(min - m);
    const target = towardMax ? max : min;
    const t = Math.min(1, ((targetStd - s) / targetStd) * 2 + 0.15);
    arr[bestI] = arr[bestI] * (1 - t) + target * t;
  }

  // 最后再保证端点存在
  arr[0] = min;
  arr[1] = max;
  // 轻微最终缩放内部点
  {
    const m = meanOf(arr);
    const s = sampleStd(arr);
    if (s > 1e-12) {
      const scale = targetStd / s;
      arr = arr.map((x, i) => {
        if (i === 0 || i === 1) return x;
        const y = m + (x - m) * scale;
        return Math.min(max, Math.max(min, y));
      });
      arr[0] = min;
      arr[1] = max;
    }
  }

  shuffleInPlace(arr);
  return arr;
}
