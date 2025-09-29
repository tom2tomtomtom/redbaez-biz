#!/bin/bash
# Complete workflow for ECD-Eye POC

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY environment variable is not set."
    echo "Please set it by running: export OPENAI_API_KEY=your_api_key_here"
    exit 1
fi

# Step 1: Generate baseline taglines
echo "Step 1: Generating baseline taglines..."
python scripts/generate_baseline.py

# Step 2: Collect ECD rankings
echo "Step 2: Collecting ECD rankings..."
echo "Please complete the ranking form in the browser window that will open."
echo "Press Enter to continue when you're done..."
streamlit run app/ranking_form.py &
read -p "Press Enter to continue when you've completed the rankings..."
pkill -f "streamlit run app/ranking_form.py"

# Step 3: Prepare fine-tuning data
echo "Step 3: Preparing fine-tuning data..."
python scripts/prepare_finetune.py

# Step 4: Submit fine-tuning job
echo "Step 4: Submitting fine-tuning job..."
python scripts/submit_finetune.py

# Step 5: Evaluate models
echo "Step 5: Evaluating models..."
python scripts/evaluate_models.py

# Step 6: Blind evaluation
echo "Step 6: Conducting blind evaluation..."
echo "Please complete the blind evaluation form in the browser window that will open."
streamlit run app/blind_evaluation.py

echo "POC workflow completed!"
