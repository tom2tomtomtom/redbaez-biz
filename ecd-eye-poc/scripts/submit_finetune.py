#!/usr/bin/env python3
"""
Submit fine-tuning job to OpenAI.
"""

import os
import json
import time
from pathlib import Path
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

# Configure OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("FINETUNE_MODEL", "gpt-3.5-turbo-0125")
N_EPOCHS = int(os.getenv("FINETUNE_EPOCHS", "3"))

def main():
    # Create data directory if it doesn't exist
    data_dir = Path(__file__).parent.parent / "data"
    data_dir.mkdir(exist_ok=True)
    
    # Check if fine-tuning data exists
    finetune_file = data_dir / "fine_tune.jsonl"
    if not finetune_file.exists():
        print(f"Error: Fine-tuning data not found at {finetune_file}")
        return
    
    # Upload file to OpenAI
    print(f"Uploading fine-tuning data to OpenAI...")
    with open(finetune_file, "rb") as f:
        response = openai.files.create(
            file=f,
            purpose="fine-tune"
        )
    
    file_id = response.id
    print(f"File uploaded with ID: {file_id}")
    
    # Wait for file to be processed
    print("Waiting for file to be processed...")
    while True:
        file_info = openai.files.retrieve(file_id)
        if file_info.status == "processed":
            break
        print(".", end="", flush=True)
        time.sleep(1)
    
    print("\nFile processed. Creating fine-tuning job...")
    
    # Create fine-tuning job
    response = openai.fine_tuning.jobs.create(
        training_file=file_id,
        model=MODEL,
        suffix="ecd-eye",
        hyperparameters={
            "n_epochs": N_EPOCHS
        }
    )
    
    job_id = response.id
    print(f"Fine-tuning job created with ID: {job_id}")
    
    # Save job ID to file
    with open(data_dir / "job_id.txt", "w") as f:
        f.write(job_id)
    
    # Monitor job status
    print("Monitoring job status...")
    while True:
        job_info = openai.fine_tuning.jobs.retrieve(job_id)
        status = job_info.status
        
        print(f"Status: {status}")
        
        if status in ["succeeded", "failed", "cancelled"]:
            break
        
        time.sleep(10)
    
    if job_info.status == "succeeded":
        model_id = job_info.fine_tuned_model
        print(f"Fine-tuning completed successfully!")
        print(f"Fine-tuned model ID: {model_id}")
        
        # Save model ID to file
        with open(data_dir / "model_id.txt", "w") as f:
            f.write(model_id)
    else:
        print(f"Fine-tuning failed with status: {job_info.status}")
        if hasattr(job_info, "error") and job_info.error:
            print(f"Error: {job_info.error}")

if __name__ == "__main__":
    main()
