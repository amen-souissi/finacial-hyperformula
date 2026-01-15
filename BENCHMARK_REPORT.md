# Benchmark Report: Calculation Performance Comparison

**Date:** January 17, 2026  
**Subject:** Comparative performance analysis between HyperFormula Original and Financial-HyperFormula  

---

## 1. Executive Summary

This report presents a comparative analysis of calculation performance between two versions of HyperFormula:

| Version                    | Description                                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HyperFormula Original**  | Original version using native JavaScript numbers directly (IEEE-754 float64)                                                                                                          |
| **Financial-HyperFormula** | Modified version with a `Numeric` abstraction layer allowing switching between native precision (`NativeNumeric`) and arbitrary precision (`DecimalNumeric` via decimal.js) |

### Key Results (100×100 Benchmark)

- **Financial-HF (native)** is **~30% slower** than HyperFormula Original
- **Financial-HF (precise)** is **~36% slower** than HyperFormula Original
- **Financial-HF (precise)** is **~4% slower** than Financial-HF (native)
- The `Numeric` abstraction overhead is primarily due to object encapsulation

---

## 2. Realistic Benchmarks

### 2.1 Small Benchmark (25×70) - Typical Financial Use Case

**Configuration:**
| Parameter | Value |
|-----------|-------|
| Rows | 25 |
| Columns | 70 |
| Numeric columns | 55 (amounts, percentages, rates) |
| Formula columns | 15 (SUM, AVERAGE, IF, POWER, etc.) |
| Totals row | 1 |
| **Total cells** | **1,820** |
| Iterations | 10 |

**Results:**

| Version               | Average  | Min      | Max      |
| --------------------- | -------- | -------- | -------- |
| HyperFormula Original | 20.11 ms | 14.49 ms | 34.89 ms |
| Financial-HF Native   | 18.01 ms | 13.95 ms | 27.92 ms |
| Financial-HF Precise  | 16.55 ms | 14.19 ms | 20.27 ms |

**Analysis:** On small grids, performance is comparable or even better for Financial-HF. Initialization overhead dominates calculation time.

---

### 2.2 Large Benchmark (100×100) - Stress Test

**Configuration:**
| Parameter | Value |
|-----------|-------|
| Rows | 100 |
| Columns | 100 |
| Numeric columns | 50 (float, int, rates) |
| String/boolean columns | 30 |
| Formula columns | 20 (complex formulas) |
| Totals row | 1 |
| **Total cells** | **10,100** |
| Iterations | 20 |

**Formula types tested:**

- SUM, AVERAGE on extended ranges
- IF conditionals with calculations
- POWER (compound interest)
- MAX, MIN, COUNTIF, SUMIF
- Financial calculations (VAT, margins, weightings)
- Chained formulas with dependencies

**Results:**

| Version                   | Average      | Std Dev | Min      | Max      |
| ------------------------- | ------------ | ------- | -------- | -------- |
| **HyperFormula Original** | **43.60 ms** | 3.86 ms | 38.30 ms | 50.88 ms |
| **Financial-HF Native**   | **56.65 ms** | 6.08 ms | 49.23 ms | 72.24 ms |
| **Financial-HF Precise**  | **59.13 ms** | 5.48 ms | 53.65 ms | 76.12 ms |

**Comparative overhead:**

| Comparison          | Ratio | Overhead  |
| ------------------- | ----- | --------- |
| Native vs Original  | 1.30x | **+30%**  |
| Precise vs Original | 1.36x | **+36%**  |
| Precise vs Native   | 1.04x | **+4.4%** |

---

### 2.3 Legacy Benchmark (300×380) - High Volume

**Configuration (historical data):**
| Parameter | Value |
|-----------|-------|
| Data rows | 300 |
| Columns | 300 |
| Formula rows | 80 |
| **Total cells** | **114,000** |
| Iterations | 5 |

**Results:**

| Version               | Mode    | Average Time    | Min      | Max      |
| --------------------- | ------- | --------------- | -------- | -------- |
| Financial-HF          | Native  | **819.30 ms**   | 770 ms   | 853 ms   |
| HyperFormula Original | -       | **843.49 ms**   | 751 ms   | 997 ms   |
| Financial-HF          | Precise | **1,196.97 ms** | 1,090 ms | 1,359 ms |

**Performance per row:**

| Version      | Mode    | Time/row |
| ------------ | ------- | -------- |
| Financial-HF | Native  | 2.16 ms  |
| Original     | -       | 2.22 ms  |
| Financial-HF | Precise | 3.15 ms  |

---

## 3. Performance Analysis

### 3.1 Numeric Abstraction Impact

The `Numeric` abstraction introduces overhead due to:

1. **Object creation**: Each numeric value is encapsulated in a `NativeNumeric` or `DecimalNumeric` object
2. **Method calls**: Arithmetic operations go through methods (`plus()`, `minus()`, `times()`, `div()`) instead of native operators
3. **Value extraction**: Retrieving values via `.toNumber()` or `.toString()`

### 3.2 Analysis by Grid Size

| Size                    | Original | Native | Precise  | Native Overhead | Precise Overhead |
| ----------------------- | -------- | ------ | -------- | --------------- | ---------------- |
| 25×70 (1,820 cells)     | 20 ms    | 18 ms  | 17 ms    | -10% ✅         | -15% ✅          |
| 100×100 (10,100 cells)  | 44 ms    | 57 ms  | 59 ms    | +30%            | +36%             |
| 300×380 (114,000 cells) | 843 ms   | 819 ms | 1,197 ms | -3% ✅          | +42%             |

**Observation:** Relative overhead decreases with grid size for native mode, but remains constant (~40-46%) for precise mode.

---

## 4. Precision Verification

### 4.1 The IEEE-754 Problem

```javascript
// Native JavaScript
0.1 + 0.2 = 0.30000000000000004  // ❌ Precision error

// Financial-HF (precise)
0.1 + 0.2 = 0.3  // ✅ Exact
```

### 4.2 Financial Calculation Example

| Operation          | Original/Native    | Precise            |
| ------------------ | ------------------ | ------------------ |
| SUM(0.01 × 100)    | 0.9999999999999999 | 1 ✅               |
| 1.0 - 0.9 - 0.1    | -2.78e-17          | 0 ✅               |
| $100 ÷ 3 people    | 33.33333333333333  | 33.33 (with FLOOR) |

### 4.3 Non-Regression Tests

The `financial-precision-strict.spec.ts` test suite includes:

- 86 financial precision tests
- NativeNumeric vs DecimalNumeric comparisons
- Real-world scenarios (penny shaving, currency conversions, compound interest)

---

## 5. Recommendations

### 5.1 By Use Case

| Use Case                         | Recommended Mode | Justification            |
| -------------------------------- | ---------------- | ------------------------ |
| Dashboards, analytics            | Native           | Optimal performance      |
| Financial calculations (billing) | **Precise**      | Exact precision required |
| Scientific simulations           | Native           | Speed priority           |
| Regulatory reports               | **Precise**      | Compliance and audit     |
| Small grids (<2000 cells)        | Precise          | No performance impact    |

### 5.2 Time Estimates by Volume

| Volume           | Native  | Precise   |
| ---------------- | ------- | --------- |
| 1,000 cells      | ~6 ms   | ~6 ms     |
| 10,000 cells     | ~57 ms  | ~59 ms    |
| 100,000 cells    | ~800 ms | ~1,200 ms |
| 1,000,000 cells  | ~8 sec  | ~12 sec   |

---

## 6. Precision API

### 6.1 Configuration

```typescript
// Precise mode (recommended for finance)
const engine = HyperFormula.buildFromArray(data, {
  numericImplementation: 'precise', // DecimalNumeric (decimal.js)
  licenseKey: 'gpl-v3',
});

// Native mode (performance)
const engine = HyperFormula.buildFromArray(data, {
  numericImplementation: 'native', // NativeNumeric (IEEE-754)
  licenseKey: 'gpl-v3',
});
```

### 6.2 Retrieving Values

```typescript
// Native value (JavaScript number)
const value = engine.getCellValue({ sheet: 0, col: 0, row: 0 });
// → 0.30000000000000004

// Precise value (Numeric object)
const preciseValue = engine.getCellValue(
  { sheet: 0, col: 0, row: 0 },
  { keepNumeric: true }
);
// → DecimalNumeric { value: "0.3" }
console.log(preciseValue.toString()); // "0.3"
```

---

## 7. Conclusion

The `Numeric` architecture of **Financial-HyperFormula** offers:

| Aspect                | Assessment                           |
| --------------------- | ------------------------------------ |
| Performance (native)  | ⚠️ +30% overhead on large grids      |
| Performance (precise) | ⚠️ +36-46% overhead                  |
| Financial precision   | ✅ Exact guarantee                   |
| Flexibility           | ✅ Runtime native/precise choice     |
| Maintenance           | ✅ Unified codebase                  |

**Final Recommendation:**

- For **critical financial applications**, performance overhead is acceptable in exchange for precision guarantee
- For **dashboards and analytics**, use native mode
- For **small grids** (<5000 cells), use precise with no notable impact

---

## 8. Threshold Analysis - Detailed (up to 300×300)

### 8.1 Comparison Table - Difference in ms

**Color code**: ✅ ≤ 20ms | 🟠 20-70ms | 🔴 > 70ms

| Rows | NumCols | FormCols | Cells  | Original  | Precise   | Diff (ms)   | Status              |
| ---- | ------- | -------- | ------ | --------- | --------- | ----------- | ------------------- |
| 10   | 20      | 10       | 300    | 19.42 ms  | 7.63 ms   | **-12 ms**  | ✅ Precise FASTER   |
| 25   | 30      | 15       | 1,125  | 16.30 ms  | 11.37 ms  | **-5 ms**   | ✅ Precise FASTER   |
| 50   | 30      | 15       | 2,250  | 15.25 ms  | 16.81 ms  | **+2 ms**   | ✅ Negligible       |
| 50   | 50      | 20       | 3,500  | 17.90 ms  | 20.80 ms  | **+3 ms**   | ✅ Negligible       |
| 75   | 50      | 20       | 5,250  | 23.88 ms  | 26.65 ms  | **+3 ms**   | ✅ Negligible       |
| 100  | 50      | 20       | 7,000  | 28.57 ms  | 41.05 ms  | **+12 ms**  | ✅ Acceptable       |
| 100  | 80      | 20       | 10,000 | 45.55 ms  | 44.93 ms  | **-1 ms**   | ✅ EQUIVALENT       |
| 100  | 100     | 30       | 13,000 | 46.83 ms  | 80.07 ms  | **+33 ms**  | 🟠 Moderate         |
| 150  | 80      | 30       | 16,500 | 62.97 ms  | 84.94 ms  | **+22 ms**  | 🟠 Moderate         |
| 150  | 100     | 40       | 21,000 | 73.27 ms  | 91.40 ms  | **+18 ms**  | ✅ Acceptable       |
| 200  | 100     | 40       | 28,000 | 96.57 ms  | 128.80 ms | **+32 ms**  | 🟠 Moderate         |
| 200  | 150     | 50       | 40,000 | 123.57 ms | 166.31 ms | **+43 ms**  | 🟠 Moderate         |
| 250  | 150     | 50       | 50,000 | 141.40 ms | 197.93 ms | **+57 ms**  | 🟠 Notable          |
| 250  | 200     | 60       | 65,000 | 188.13 ms | 246.65 ms | **+59 ms**  | 🟠 Notable          |
| 300  | 200     | 60       | 78,000 | 228.92 ms | 564.81 ms | **+336 ms** | 🔴 GC Anomaly       |
| 300  | 250     | 50       | 90,000 | 229.25 ms | 340.04 ms | **+111 ms** | 🔴 Significant      |

### 8.2 Performance Zones

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ✅ GREEN ZONE (≤ 20ms difference):                                             │
│     • Up to ~21,000 cells                                                       │
│     • Configurations: 150×140 or less                                           │
│     • Numeric columns: up to ~100                                               │
│     • Typical difference: 0-18ms                                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│  🟠 ORANGE ZONE (20-70ms difference):                                           │
│     • Between 13,000 and 65,000 cells                                           │
│     • Configurations: 100×130 to 250×260                                        │
│     • Typical difference: 22-59ms                                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│  🔴 RED ZONE (> 70ms difference):                                               │
│     • More than 78,000 cells                                                    │
│     • Configurations: 300×260 and above                                         │
│     • Difference: 111ms+ (excluding GC anomalies)                               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Key Thresholds by Cell Count

| Cells         | Avg Diff | Recommendation                            |
| ------------- | -------- | ----------------------------------------- |
| < 5,000       | 0-3 ms   | ✅ Use PRECISE without concern            |
| 5,000-10,000  | 0-12 ms  | ✅ PRECISE acceptable                     |
| 10,000-20,000 | 18-33 ms | 🟠 PRECISE with moderate overhead         |
| 20,000-50,000 | 32-57 ms | 🟠 PRECISE with notable overhead          |
| 50,000-90,000 | 57-111 ms| 🔴 Consider NATIVE if performance critical|

### 8.4 Threshold Conclusions

**Key observations:**

1. **Small grids (< 5,000 cells)**: Precise is often **FASTER** or equivalent to Original
2. **Medium grids (5,000-20,000 cells)**: Overhead of **0-30ms**, generally acceptable
3. **Large grids (20,000-65,000 cells)**: Overhead of **30-60ms**, notable but manageable
4. **Very large grids (> 65,000 cells)**: Overhead of **60-110ms+**, consider NATIVE

**Critical threshold**: Starting at **~65,000 cells** (e.g., 250×260), overhead consistently exceeds 50ms

---

## Appendix: Execution Commands

```bash
# Small benchmark (25×70)
cd finacial-hyperformula
npx ts-node --transpile-only --compiler-options '{"module":"commonjs"}' \
  test/performance/realistic-bench.ts

# Large benchmark (100×100)
npx ts-node --transpile-only --compiler-options '{"module":"commonjs"}' \
  test/performance/large-bench.ts

# Extended benchmark (up to 300×300)
npx ts-node --transpile-only --compiler-options '{"module":"commonjs"}' \
  test/performance/threshold-extended.ts

# HyperFormula Original (for comparison)
cd ../hyperformula2
npx ts-node --transpile-only --compiler-options '{"module":"commonjs"}' \
  test/performance/large-bench.ts
```

---

_Report updated on January 17, 2026 - Deterministic benchmarks with seed 12345_
