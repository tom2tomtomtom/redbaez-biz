#!/usr/bin/env python3
"""
Evaluate baseline and fine-tuned models on hold-out briefs.
"""

import os
import json
import csv
import time
import random
from pathlib import Path
from dotenv import load_dotenv
import openai
from tqdm import tqdm

# Load environment variables
load_dotenv()

# Configure OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")
BASELINE_MODEL = os.getenv("BASELINE_MODEL", "gpt-3.5-turbo-0125")

# System prompt for baseline generation
RULES_V1 = "You are a punchy award-winning copywriter."

def generate_tagline(brief, model, system_prompt=RULES_V1, temperature=0.9):
    """Generate a single tagline for a given brief."""
    try:
        response = openai.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Write a punchy tagline (≤7 words) for: {brief}"}
            ],
            temperature=temperature
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating tagline: {e}")
        return ""

def main():
    # Create data directory if it doesn't exist
    data_dir = Path(__file__).parent.parent / "data"
    data_dir.mkdir(exist_ok=True)
    
    # Load briefs
    briefs_file = data_dir / "briefs.json"
    with open(briefs_file, "r") as f:
        briefs_data = json.load(f)
    
    evaluation_briefs = briefs_data["evaluation_briefs"]
    
    # Load fine-tuned model ID
    model_id_file = data_dir / "model_id.txt"
    if not model_id_file.exists():
        print(f"Error: Fine-tuned model ID not found at {model_id_file}")
        return
    
    with open(model_id_file, "r") as f:
        fine_tuned_model = f.read().strip()
    
    print(f"Using fine-tuned model: {fine_tuned_model}")
    
    # Prepare CSV file
    csv_file = data_dir / "evaluation.csv"
    with open(csv_file, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "brief_id", 
            "brief", 
            "baseline_tagline", 
            "finetuned_tagline", 
            "randomized_a", 
            "randomized_b", 
            "is_a_baseline"
        ])
        
        # Generate taglines for each brief
        for brief in tqdm(evaluation_briefs, desc="Evaluating models"):
            brief_id = brief["id"]
            brief_text = brief["brief"]
            
            # Generate taglines
            baseline_tagline = generate_tagline(brief_text, BASELINE_MODEL)
            time.sleep(1)  # Avoid rate limiting
            finetuned_tagline = generate_tagline(brief_text, fine_tuned_model)
            
            # Randomize order for blind evaluation
            is_a_baseline = random.choice([True, False])
            if is_a_baseline:
                tagline_a = baseline_tagline
                tagline_b = finetuned_tagline
            else:
                tagline_a = finetuned_tagline
                tagline_b = baseline_tagline
            
            # Write to CSV
            writer.writerow([
                brief_id,
                brief_text,
                baseline_tagline,
                finetuned_tagline,
                tagline_a,
                tagline_b,
                is_a_baseline
            ])
            
            # Sleep to avoid rate limiting
            time.sleep(1)
    
    print(f"Evaluation results saved to {csv_file}")
    
    # Create a blind evaluation form
    blind_form_file = data_dir / "blind_evaluation_form.csv"
    with open(csv_file, "r") as source, open(blind_form_file, "w", newline="") as target:
        reader = csv.reader(source)
        writer = csv.writer(target)
        
        # Write header
        header = next(reader)
        writer.writerow(["brief_id", "brief", "tagline_a", "tagline_b", "preferred_tagline"])
        
        # Write data
        for row in reader:
            writer.writerow([
                row[0],  # brief_id
                row[1],  # brief
                row[3],  # tagline_a
                row[4],  # tagline_b
                ""       # preferred_tagline (to be filled by ECD)
            ])
    
    print(f"Blind evaluation form saved to {blind_form_file}")

if __name__ == "__main__":
    main()
