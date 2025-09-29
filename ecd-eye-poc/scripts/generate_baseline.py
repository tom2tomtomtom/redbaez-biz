#!/usr/bin/env python3
"""
Generate baseline taglines using GPT-3.5-Turbo with a static prompt.
"""

import os
import json
import csv
import time
from pathlib import Path
from dotenv import load_dotenv
import openai
from tqdm import tqdm

# Load environment variables
load_dotenv()

# Configure OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("BASELINE_MODEL", "gpt-3.5-turbo-0125")

# System prompt for baseline generation
RULES_V1 = "You are a punchy award-winning copywriter."

def generate_lines(brief, model=MODEL, temperature=0.9):
    """Generate 5 taglines for a given brief."""
    try:
        response = openai.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": RULES_V1},
                {"role": "user", "content": f"Write five punchy taglines (≤7 words) for: {brief}"}
            ],
            temperature=temperature
        )
        
        # Extract taglines from the response
        content = response.choices[0].message.content
        lines = [line.strip("• ").strip() for line in content.split("\n") if line.strip()]
        
        # Ensure we have exactly 5 taglines
        if len(lines) < 5:
            print(f"Warning: Only generated {len(lines)} taglines for brief: {brief}")
            # Pad with empty strings if needed
            lines.extend([""] * (5 - len(lines)))
        elif len(lines) > 5:
            print(f"Warning: Generated {len(lines)} taglines, truncating to 5 for brief: {brief}")
            lines = lines[:5]
            
        return lines
    except Exception as e:
        print(f"Error generating taglines: {e}")
        # Return empty strings in case of error
        return [""] * 5

def main():
    # Create data directory if it doesn't exist
    data_dir = Path(__file__).parent.parent / "data"
    data_dir.mkdir(exist_ok=True)
    
    # Load briefs
    briefs_file = data_dir / "briefs.json"
    with open(briefs_file, "r") as f:
        briefs_data = json.load(f)
    
    training_briefs = briefs_data["training_briefs"]
    
    # Prepare CSV file
    csv_file = data_dir / "baseline.csv"
    with open(csv_file, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["brief_id", "brief", "tagline_1", "tagline_2", "tagline_3", "tagline_4", "tagline_5"])
        
        # Generate taglines for each brief
        for brief in tqdm(training_briefs, desc="Generating taglines"):
            brief_id = brief["id"]
            brief_text = brief["brief"]
            
            # Generate taglines
            taglines = generate_lines(brief_text)
            
            # Write to CSV
            writer.writerow([brief_id, brief_text] + taglines)
            
            # Sleep to avoid rate limiting
            time.sleep(1)
    
    print(f"Generated taglines saved to {csv_file}")

if __name__ == "__main__":
    main()
