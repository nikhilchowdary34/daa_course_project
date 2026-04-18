/**
 * algorithms.js
 * Generates step-by-step traces for each sorting algorithm.
 * Each step = { array, comparing, swapping, sorted, pivot, description, type }
 *   - array:     current snapshot of the array
 *   - comparing: indices being compared (array of indices)
 *   - swapping:  indices being swapped  (array of indices)
 *   - sorted:    set of indices confirmed sorted (array of indices)
 *   - pivot:     index of the pivot element (for quicksort) (number or null)
 *   - description: human-readable step explanation
 *   - type:      'compare' | 'swap' | 'sorted' | 'info' | 'pivot'
 */

const SortingAlgorithms = (() => {

  /* --------------------------------------------------------
     BUBBLE SORT
     -------------------------------------------------------- */
  function bubbleSort(arr) {
    const steps = [];
    const a = [...arr];
    const n = a.length;
    const sorted = new Set();

    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [],
      pivot: null,
      description: `Starting Bubble Sort on array of ${n} elements`,
      type: 'info',
    });

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j++) {
        // Compare
        steps.push({
          array: [...a],
          comparing: [j, j + 1],
          swapping: [],
          sorted: [...sorted],
          pivot: null,
          description: `Comparing index ${j} and ${j + 1} — values ${a[j]} and ${a[j + 1]}`,
          type: 'compare',
        });

        if (a[j] > a[j + 1]) {
          // Swap
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          swapped = true;
          steps.push({
            array: [...a],
            comparing: [],
            swapping: [j, j + 1],
            sorted: [...sorted],
            pivot: null,
            description: `Swapping index ${j} and ${j + 1} — ${a[j + 1]} > ${a[j]}, moved ${a[j]} left`,
            type: 'swap',
          });
        }
      }
      sorted.add(n - 1 - i);
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: [...sorted],
        pivot: null,
        description: `Element ${a[n - 1 - i]} is now in its correct position at index ${n - 1 - i}`,
        type: 'sorted',
      });

      if (!swapped) {
        // Already sorted
        for (let k = 0; k < n; k++) sorted.add(k);
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [],
          sorted: [...sorted],
          pivot: null,
          description: `No swaps in this pass — array is already sorted!`,
          type: 'info',
        });
        break;
      }
    }

    // Mark all sorted
    const allSorted = Array.from({ length: n }, (_, i) => i);
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: allSorted,
      pivot: null,
      description: `Bubble Sort complete!`,
      type: 'sorted',
    });

    return steps;
  }

  /* --------------------------------------------------------
     SELECTION SORT
     -------------------------------------------------------- */
  function selectionSort(arr) {
    const steps = [];
    const a = [...arr];
    const n = a.length;
    const sorted = new Set();

    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [],
      pivot: null,
      description: `Starting Selection Sort on array of ${n} elements`,
      type: 'info',
    });

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      steps.push({
        array: [...a],
        comparing: [i],
        swapping: [],
        sorted: [...sorted],
        pivot: null,
        description: `Pass ${i + 1}: Finding minimum in unsorted region [${i}..${n - 1}]`,
        type: 'info',
      });

      for (let j = i + 1; j < n; j++) {
        steps.push({
          array: [...a],
          comparing: [minIdx, j],
          swapping: [],
          sorted: [...sorted],
          pivot: null,
          description: `Comparing current min ${a[minIdx]} (index ${minIdx}) with ${a[j]} (index ${j})`,
          type: 'compare',
        });

        if (a[j] < a[minIdx]) {
          minIdx = j;
          steps.push({
            array: [...a],
            comparing: [minIdx],
            swapping: [],
            sorted: [...sorted],
            pivot: null,
            description: `New minimum found: ${a[minIdx]} at index ${minIdx}`,
            type: 'info',
          });
        }
      }

      if (minIdx !== i) {
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [i, minIdx],
          sorted: [...sorted],
          pivot: null,
          description: `Swapping ${a[minIdx]} (index ${minIdx}) with ${a[i]} (index ${i}) — placing minimum`,
          type: 'swap',
        });
      }

      sorted.add(i);
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: [...sorted],
        pivot: null,
        description: `Element ${a[i]} placed at position ${i}`,
        type: 'sorted',
      });
    }

    const allSorted = Array.from({ length: n }, (_, i) => i);
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: allSorted,
      pivot: null,
      description: `Selection Sort complete!`,
      type: 'sorted',
    });

    return steps;
  }

  /* --------------------------------------------------------
     INSERTION SORT
     -------------------------------------------------------- */
  function insertionSort(arr) {
    const steps = [];
    const a = [...arr];
    const n = a.length;
    const sorted = new Set([0]);

    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [0],
      pivot: null,
      description: `Starting Insertion Sort — first element ${a[0]} is trivially sorted`,
      type: 'info',
    });

    for (let i = 1; i < n; i++) {
      const key = a[i];
      let j = i - 1;

      steps.push({
        array: [...a],
        comparing: [i],
        swapping: [],
        sorted: [...sorted],
        pivot: null,
        description: `Inserting element ${key} (index ${i}) into sorted region`,
        type: 'info',
      });

      while (j >= 0 && a[j] > key) {
        steps.push({
          array: [...a],
          comparing: [j, j + 1],
          swapping: [],
          sorted: [...sorted],
          pivot: null,
          description: `Comparing ${a[j]} (index ${j}) > ${key} — shifting ${a[j]} right`,
          type: 'compare',
        });

        a[j + 1] = a[j];
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [j, j + 1],
          sorted: [...sorted],
          pivot: null,
          description: `Shifted ${a[j]} from index ${j} to index ${j + 1}`,
          type: 'swap',
        });

        j--;
      }

      a[j + 1] = key;
      sorted.add(i);
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: [...sorted],
        pivot: null,
        description: `Placed ${key} at index ${j + 1} — sorted region now has ${sorted.size} elements`,
        type: 'sorted',
      });
    }

    const allSorted = Array.from({ length: n }, (_, i) => i);
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: allSorted,
      pivot: null,
      description: `Insertion Sort complete!`,
      type: 'sorted',
    });

    return steps;
  }

  /* --------------------------------------------------------
     MERGE SORT
     -------------------------------------------------------- */
  function mergeSort(arr) {
    const steps = [];
    const a = [...arr];
    const n = a.length;
    const sortedIndices = new Set();

    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [],
      pivot: null,
      description: `Starting Merge Sort on array of ${n} elements`,
      type: 'info',
    });

    function mergeSortHelper(start, end) {
      if (start >= end) return;

      const mid = Math.floor((start + end) / 2);

      steps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: [...sortedIndices],
        pivot: null,
        description: `Dividing subarray [${start}..${end}] at midpoint ${mid}`,
        type: 'info',
      });

      mergeSortHelper(start, mid);
      mergeSortHelper(mid + 1, end);
      merge(start, mid, end);
    }

    function merge(start, mid, end) {
      const left = a.slice(start, mid + 1);
      const right = a.slice(mid + 1, end + 1);
      let i = 0, j = 0, k = start;

      steps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: [...sortedIndices],
        pivot: null,
        description: `Merging subarrays [${start}..${mid}] and [${mid + 1}..${end}]`,
        type: 'info',
      });

      while (i < left.length && j < right.length) {
        steps.push({
          array: [...a],
          comparing: [start + i, mid + 1 + j],
          swapping: [],
          sorted: [...sortedIndices],
          pivot: null,
          description: `Comparing ${left[i]} (left[${i}]) and ${right[j]} (right[${j}])`,
          type: 'compare',
        });

        if (left[i] <= right[j]) {
          a[k] = left[i];
          steps.push({
            array: [...a],
            comparing: [],
            swapping: [k],
            sorted: [...sortedIndices],
            pivot: null,
            description: `Placing ${left[i]} at index ${k} (from left subarray)`,
            type: 'swap',
          });
          i++;
        } else {
          a[k] = right[j];
          steps.push({
            array: [...a],
            comparing: [],
            swapping: [k],
            sorted: [...sortedIndices],
            pivot: null,
            description: `Placing ${right[j]} at index ${k} (from right subarray)`,
            type: 'swap',
          });
          j++;
        }
        k++;
      }

      while (i < left.length) {
        a[k] = left[i];
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [k],
          sorted: [...sortedIndices],
          pivot: null,
          description: `Placing remaining ${left[i]} at index ${k} (from left)`,
          type: 'swap',
        });
        i++;
        k++;
      }

      while (j < right.length) {
        a[k] = right[j];
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [k],
          sorted: [...sortedIndices],
          pivot: null,
          description: `Placing remaining ${right[j]} at index ${k} (from right)`,
          type: 'swap',
        });
        j++;
        k++;
      }

      // If this merge covers entire array, mark all sorted
      if (start === 0 && end === n - 1) {
        for (let idx = start; idx <= end; idx++) sortedIndices.add(idx);
      }

      steps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: [...sortedIndices],
        pivot: null,
        description: `Merged subarray [${start}..${end}] complete`,
        type: 'sorted',
      });
    }

    mergeSortHelper(0, n - 1);

    const allSorted = Array.from({ length: n }, (_, i) => i);
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: allSorted,
      pivot: null,
      description: `Merge Sort complete!`,
      type: 'sorted',
    });

    return steps;
  }

  /* --------------------------------------------------------
     QUICK SORT
     -------------------------------------------------------- */
  function quickSort(arr) {
    const steps = [];
    const a = [...arr];
    const n = a.length;
    const sortedIndices = new Set();

    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [],
      pivot: null,
      description: `Starting Quick Sort on array of ${n} elements`,
      type: 'info',
    });

    function quickSortHelper(low, high) {
      if (low >= high) {
        if (low === high) {
          sortedIndices.add(low);
          steps.push({
            array: [...a],
            comparing: [],
            swapping: [],
            sorted: [...sortedIndices],
            pivot: null,
            description: `Single element ${a[low]} at index ${low} is sorted`,
            type: 'sorted',
          });
        }
        return;
      }

      const pivotIdx = partition(low, high);
      quickSortHelper(low, pivotIdx - 1);
      quickSortHelper(pivotIdx + 1, high);
    }

    function partition(low, high) {
      const pivotVal = a[high];

      steps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: [...sortedIndices],
        pivot: high,
        description: `Partitioning [${low}..${high}] with pivot ${pivotVal} (index ${high})`,
        type: 'pivot',
      });

      let i = low - 1;

      for (let j = low; j < high; j++) {
        steps.push({
          array: [...a],
          comparing: [j, high],
          swapping: [],
          sorted: [...sortedIndices],
          pivot: high,
          description: `Comparing ${a[j]} (index ${j}) with pivot ${pivotVal}`,
          type: 'compare',
        });

        if (a[j] < pivotVal) {
          i++;
          if (i !== j) {
            [a[i], a[j]] = [a[j], a[i]];
            steps.push({
              array: [...a],
              comparing: [],
              swapping: [i, j],
              sorted: [...sortedIndices],
              pivot: high,
              description: `${a[j]} < ${pivotVal} — swapping index ${i} and ${j}`,
              type: 'swap',
            });
          }
        }
      }

      i++;
      if (i !== high) {
        [a[i], a[high]] = [a[high], a[i]];
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [i, high],
          sorted: [...sortedIndices],
          pivot: null,
          description: `Placing pivot ${pivotVal} at its correct position ${i}`,
          type: 'swap',
        });
      }

      sortedIndices.add(i);
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: [...sortedIndices],
        pivot: null,
        description: `Pivot ${pivotVal} is now at index ${i} — correctly placed`,
        type: 'sorted',
      });

      return i;
    }

    quickSortHelper(0, n - 1);

    const allSorted = Array.from({ length: n }, (_, i) => i);
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: allSorted,
      pivot: null,
      description: `Quick Sort complete!`,
      type: 'sorted',
    });

    return steps;
  }

  /* --------------------------------------------------------
     HEAP SORT
     -------------------------------------------------------- */
  function heapSort(arr) {
    const steps = [];
    const a = [...arr];
    const n = a.length;
    const sortedIndices = new Set();

    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [],
      pivot: null,
      description: `Starting Heap Sort on array of ${n} elements`,
      type: 'info',
    });

    // Build max heap
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [],
      pivot: null,
      description: `Phase 1: Building Max Heap`,
      type: 'info',
    });

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(a, n, i);
    }

    // Extract elements
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [...sortedIndices],
      pivot: null,
      description: `Phase 2: Extracting elements from heap`,
      type: 'info',
    });

    for (let i = n - 1; i > 0; i--) {
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [0, i],
        sorted: [...sortedIndices],
        pivot: null,
        description: `Swapping root ${a[0]} with last unsorted element ${a[i]} (index ${i})`,
        type: 'swap',
      });

      [a[0], a[i]] = [a[i], a[0]];

      steps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: [...sortedIndices],
        pivot: null,
        description: `After swap: root=${a[0]}, placed ${a[i]} at index ${i}`,
        type: 'swap',
      });

      sortedIndices.add(i);
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: [...sortedIndices],
        pivot: null,
        description: `Element ${a[i]} is in correct position at index ${i}`,
        type: 'sorted',
      });

      heapify(a, i, 0);
    }

    function heapify(arr, heapSize, root) {
      let largest = root;
      const left = 2 * root + 1;
      const right = 2 * root + 2;

      if (left < heapSize) {
        steps.push({
          array: [...a],
          comparing: [largest, left],
          swapping: [],
          sorted: [...sortedIndices],
          pivot: null,
          description: `Heapify: comparing node ${arr[largest]} (${largest}) with left child ${arr[left]} (${left})`,
          type: 'compare',
        });

        if (arr[left] > arr[largest]) {
          largest = left;
        }
      }

      if (right < heapSize) {
        steps.push({
          array: [...a],
          comparing: [largest, right],
          swapping: [],
          sorted: [...sortedIndices],
          pivot: null,
          description: `Heapify: comparing node ${arr[largest]} (${largest}) with right child ${arr[right]} (${right})`,
          type: 'compare',
        });

        if (arr[right] > arr[largest]) {
          largest = right;
        }
      }

      if (largest !== root) {
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [root, largest],
          sorted: [...sortedIndices],
          pivot: null,
          description: `Heapify: swapping ${arr[root]} (${root}) with ${arr[largest]} (${largest})`,
          type: 'swap',
        });

        [arr[root], arr[largest]] = [arr[largest], arr[root]];

        steps.push({
          array: [...a],
          comparing: [],
          swapping: [],
          sorted: [...sortedIndices],
          pivot: null,
          description: `Heapify: continuing to check subtree rooted at ${largest}`,
          type: 'info',
        });

        heapify(arr, heapSize, largest);
      }
    }

    const allSorted = Array.from({ length: n }, (_, i) => i);
    sortedIndices.add(0);
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: allSorted,
      pivot: null,
      description: `Heap Sort complete!`,
      type: 'sorted',
    });

    return steps;
  }

  /* --------------------------------------------------------
     ALGORITHM METADATA
     -------------------------------------------------------- */
  const algorithmInfo = {
    bubble: {
      name: 'Bubble Sort',
      description: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
      best: 'O(n)',
      avg: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
      fn: bubbleSort,
    },
    selection: {
      name: 'Selection Sort',
      description: 'Divides the array into sorted and unsorted regions. Repeatedly selects the smallest element from the unsorted region and moves it to the end of the sorted region.',
      best: 'O(n²)',
      avg: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
      fn: selectionSort,
    },
    insertion: {
      name: 'Insertion Sort',
      description: 'Builds the sorted array one element at a time by repeatedly picking the next element and inserting it into its correct position among the previously sorted elements.',
      best: 'O(n)',
      avg: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
      fn: insertionSort,
    },
    merge: {
      name: 'Merge Sort',
      description: 'A divide-and-conquer algorithm that divides the array into halves, recursively sorts them, and then merges the sorted halves back together.',
      best: 'O(n log n)',
      avg: 'O(n log n)',
      worst: 'O(n log n)',
      space: 'O(n)',
      fn: mergeSort,
    },
    quick: {
      name: 'Quick Sort',
      description: 'A divide-and-conquer algorithm that selects a pivot element and partitions the array around it, placing smaller elements before and larger elements after the pivot.',
      best: 'O(n log n)',
      avg: 'O(n log n)',
      worst: 'O(n²)',
      space: 'O(log n)',
      fn: quickSort,
    },
    heap: {
      name: 'Heap Sort',
      description: 'Builds a max heap from the array, then repeatedly extracts the maximum element and places it at the end. Uses the heap property to efficiently find the maximum.',
      best: 'O(n log n)',
      avg: 'O(n log n)',
      worst: 'O(n log n)',
      space: 'O(1)',
      fn: heapSort,
    },
  };

  return { algorithmInfo };
})();
