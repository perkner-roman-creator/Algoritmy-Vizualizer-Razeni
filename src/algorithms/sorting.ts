export type Step = {
  arr: number[];
  a: number;      // sledovaný index A
  b: number;      // sledovaný index B (při zápisu může být -1)
  swapped: boolean; // true = přesun/swap/zápis, false = porovnání
};

export type AlgoKey = 'bubble' | 'selection' | 'insertion' | 'quick' | 'merge';

// Bubble
function bubbleSortSteps(input: number[]): Step[] {
  const arr = [...input];
  const steps: Step[] = [{ arr: [...arr], a: -1, b: -1, swapped: false }];
  let swapped = true;
  for (let i = 0; i < arr.length - 1 && swapped; i++) {
    swapped = false;
    for (let j = 0; j < arr.length - 1 - i; j++) {
      steps.push({ arr: [...arr], a: j, b: j + 1, swapped: false }); // compare
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
        steps.push({ arr: [...arr], a: j, b: j + 1, swapped: true }); // swap
      }
    }
  }
  steps.push({ arr: [...arr], a: -1, b: -1, swapped: false });
  return steps;
}

// Selection
function selectionSortSteps(input: number[]): Step[] {
  const arr = [...input];
  const steps: Step[] = [{ arr: [...arr], a: -1, b: -1, swapped: false }];
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      steps.push({ arr: [...arr], a: minIdx, b: j, swapped: false }); // compare
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      steps.push({ arr: [...arr], a: i, b: minIdx, swapped: true }); // swap
    }
  }
  steps.push({ arr: [...arr], a: -1, b: -1, swapped: false });
  return steps;
}

// Insertion
function insertionSortSteps(input: number[]): Step[] {
  const arr = [...input];
  const steps: Step[] = [{ arr: [...arr], a: -1, b: -1, swapped: false }];

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      steps.push({ arr: [...arr], a: j, b: j + 1, swapped: false }); // compare
      arr[j + 1] = arr[j];
      steps.push({ arr: [...arr], a: j, b: j + 1, swapped: true }); // move
      j--;
    }
    arr[j + 1] = key;
    steps.push({ arr: [...arr], a: j + 1, b: i, swapped: true }); // insert
  }

  steps.push({ arr: [...arr], a: -1, b: -1, swapped: false });
  return steps;
}

// Quick (Lomuto partition)
function quickSortSteps(input: number[]): Step[] {
  const arr = [...input];
  const steps: Step[] = [{ arr: [...arr], a: -1, b: -1, swapped: false }];

  function partition(l: number, r: number): number {
    const pivot = arr[r];
    let i = l;
    for (let j = l; j < r; j++) {
      steps.push({ arr: [...arr], a: j, b: r, swapped: false }); // compare with pivot
      if (arr[j] < pivot) {
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({ arr: [...arr], a: i, b: j, swapped: true }); // swap
        }
        i++;
      }
    }
    if (i !== r) {
      [arr[i], arr[r]] = [arr[r], arr[i]];
      steps.push({ arr: [...arr], a: i, b: r, swapped: true }); // place pivot
    }
    return i;
  }

  function quick(l: number, r: number) {
    if (l >= r) return;
    const p = partition(l, r);
    quick(l, p - 1);
    quick(p + 1, r);
  }

  quick(0, arr.length - 1);
  steps.push({ arr: [...arr], a: -1, b: -1, swapped: false });
  return steps;
}

// Merge
function mergeSortSteps(input: number[]): Step[] {
  const arr = [...input];
  const steps: Step[] = [{ arr: [...arr], a: -1, b: -1, swapped: false }];
  const aux = new Array<number>(arr.length);

  function merge(l: number, m: number, r: number) {
    let i = l, j = m + 1, k = l;

    while (i <= m && j <= r) {
      steps.push({ arr: [...arr], a: i, b: j, swapped: false }); // compare
      if (arr[i] <= arr[j]) aux[k++] = arr[i++];
      else aux[k++] = arr[j++];
    }
    while (i <= m) aux[k++] = arr[i++];
    while (j <= r) aux[k++] = arr[j++];

    for (let t = l; t <= r; t++) {
      arr[t] = aux[t];
      steps.push({ arr: [...arr], a: t, b: -1, swapped: true }); // write back
    }
  }

  function sort(l: number, r: number) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    sort(l, m);
    sort(m + 1, r);
    merge(l, m, r);
  }

  sort(0, arr.length - 1);
  steps.push({ arr: [...arr], a: -1, b: -1, swapped: false });
  return steps;
}

export const algorithms: Record<
  AlgoKey,
  { name: string; steps: (arr: number[]) => Step[] }
> = {
  bubble: { name: 'Bubble Sort', steps: bubbleSortSteps },
  selection: { name: 'Selection Sort', steps: selectionSortSteps },
  insertion: { name: 'Insertion Sort', steps: insertionSortSteps },
  quick: { name: 'Quick Sort', steps: quickSortSteps },
  merge: { name: 'Merge Sort', steps: mergeSortSteps },
};