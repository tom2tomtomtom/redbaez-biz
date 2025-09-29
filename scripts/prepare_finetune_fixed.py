#!/usr/bin/env python3
"""
Prepare fine-tuning data from ECD rankings.
"""

import os
import json
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    # Create data directory if it doesn't exist
    data_dir = Path(__file__).parent.parent / "data"
    data_dir.mkdir(exist_ok=True)
    
    # Load rankings
    rankings_file = data_dir / "rankings.csv"
    if not rankings_file.exists():
        print(f"Error: Rankings file not found at {rankings_file}")
        return
    
    rankings_df = pd.read_csv(rankings_file)
    
    # Load baseline taglines
    baseline_file = data_dir / "baseline.csv"
    if not baseline_file.exists():
        print(f"Error: Baseline file not found at {baseline_file}")
        return
    
    baseline_df = pd.read_csv(baseline_file)
    
    # Prepare fine-tuning data
    finetune_data = []
    
    for _, row in rankings_df.iterrows():
        brief_id = row["brief_id"]
        brief = row["brief"]
        
        # Get the taglines in order of ranking
        baseline_row = baseline_df[baseline_df["brief_id"] == brief_id].iloc[0]
        taglines = [
            baseline_row["tagline_1"],
            baseline_row["tagline_2"],
            baseline_row["tagline_3"],
            baseline_row["tagline_4"],
            baseline_row["tagline_5"]
        ]
        
        # Get the rankings (1 to 5, where 1 is best)
        rankings = [
            row["rank_1"],
            row["rank_2"],
            row["rank_3"],
            row["rank_4"],
            row["rank_5"]
        ]
        
        # Create a mapping of tagline index to rank
        tagline_ranks = {i: rank for i, rank in enumerate(rankings)}
        
        # Sort taglines by rank
        sorted_taglines = [taglines[i] for i in sorted(tagline_ranks, key=tagline_ranks.get)]
        
        # Get the top-ranked tagline
        best_tagline = sorted_taglines[0]
        
        # Clean up the tagline (remove numbering and quotes)
        best_tagline = best_tagline.strip()
        if best_tagline.startswith('"') and best_tagline.endswith('"'):
            best_tagline = best_tagline[1:-1]
        if best_tagline.startswith("1. "):
            best_tagline = best_tagline[3:]
        if best_tagline.startswith('"') and best_tagline.endswith('"'):
            best_tagline = best_tagline[1:-1]
        
        # Create fine-tuning example in the correct format
        finetune_example = {
            "messages": [
                {
                    "role": "system",
                    "content": "You are a punchy award-winning copywriter."
                },
                {
                    "role": "user",
                    "content": f"Write a punchy tagline (≤7 words) for: {brief}"
                },
                {
                    "role": "assistant",
                    "content": best_tagline
                }
            ]
        }
        
        finetune_data.append(finetune_example)
    
    # Save fine-tuning data to JSONL file
    finetune_file = data_dir / "fine_tune.jsonl"
    with open(finetune_file, "w") as f:
        for example in finetune_data:
            f.write(json.dumps(example) + "\n")
    
    print(f"Fine-tuning data saved to {finetune_file}")
    print(f"Number of examples: {len(finetune_data)}")

if __name__ == "__main__":
    main()
