# ECD-Eye POC

A proof-of-concept for fine-tuning ChatGPT models to match ECD (Executive Creative Director) preferences for tagline generation.

## Overview

This project demonstrates how fine-tuning ChatGPT models on ECD-ranked examples can improve the quality of generated taglines compared to using static prompts.

## Components

1. **Baseline Generation**: Generate taglines using GPT-3.5-Turbo with a static prompt
2. **ECD Ranking**: Collect rankings from the ECD using a simple form
3. **Fine-Tuning**: Convert rankings to training data and fine-tune a ChatGPT model
4. **Evaluation**: Compare the baseline and fine-tuned models on new briefs

## Setup

1. Clone this repository
2. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

### 1. Generate Baseline Taglines

```bash
python scripts/generate_baseline.py
```

This will generate 5 taglines for each of the 12 briefs and save them to `data/baseline.csv`.

### 2. Collect ECD Rankings

```bash
streamlit run app/ranking_form.py
```

This will start a web app where the ECD can rank the taglines. Rankings will be saved to `data/rankings.csv`.

### 3. Prepare Fine-Tuning Data

```bash
python scripts/prepare_finetune.py
```

This will convert the rankings to the JSONL format required for OpenAI fine-tuning and save it to `data/fine_tune.jsonl`.

### 4. Submit Fine-Tuning Job

```bash
python scripts/submit_finetune.py
```

This will submit a fine-tuning job to OpenAI and save the model ID to `data/model_id.txt`.

### 5. Evaluate Models

```bash
python scripts/evaluate_models.py
```

This will generate taglines for 5 hold-out briefs using both the baseline and fine-tuned models, and save the results to `data/evaluation.csv`.

## Project Structure

```
ecd-eye-poc/
├── app/
│   └── ranking_form.py       # Streamlit app for ECD ranking
├── data/
│   ├── briefs.json           # Training and evaluation briefs
│   ├── baseline.csv          # Generated taglines from baseline model
│   ├── rankings.csv          # ECD rankings
│   ├── fine_tune.jsonl       # Fine-tuning data
│   ├── model_id.txt          # Fine-tuned model ID
│   └── evaluation.csv        # Evaluation results
├── notebooks/
│   ├── fine_tuning_prep.ipynb    # Notebook for preparing fine-tuning data
│   └── evaluation.ipynb          # Notebook for evaluating models
├── scripts/
│   ├── generate_baseline.py      # Generate baseline taglines
│   ├── prepare_finetune.py       # Prepare fine-tuning data
│   ├── submit_finetune.py        # Submit fine-tuning job
│   └── evaluate_models.py        # Evaluate models
├── .env                      # Environment variables
├── requirements.txt          # Python dependencies
└── README.md                 # Project documentation
```

## License

This project is proprietary and confidential.
