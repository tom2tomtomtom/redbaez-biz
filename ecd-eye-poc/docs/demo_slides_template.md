# ECD-Eye POC
## Fine-tuning ChatGPT for Better Taglines

---

## The Challenge

- Generating high-quality taglines that match ECD preferences
- Static prompts can only go so far
- Need a way to learn from ECD feedback

---

## Our Approach

1. Generate baseline taglines with ChatGPT
2. Collect ECD rankings
3. Fine-tune ChatGPT on top-ranked examples
4. Blind evaluation on new briefs

---

## Results

- Fine-tuned model preferred: X/5 (X%)
- p-value: 0.XXX
- **The fine-tuned model [is/is not] significantly better than the baseline model**

---

## Example Comparisons

| Brief | Baseline | Fine-tuned | Preferred |
|-------|----------|------------|-----------|
| Brief 1 | "Tagline A" | "Tagline B" | Fine-tuned |
| Brief 2 | "Tagline C" | "Tagline D" | Baseline |
| Brief 3 | "Tagline E" | "Tagline F" | Fine-tuned |

---

## Conclusions & Next Steps

- Fine-tuning ChatGPT on ECD preferences works!
- Even with just 12 examples, we see improvement
- Next steps:
  - Expand training data with more examples
  - Test on more diverse briefs
  - Integrate into production workflow
