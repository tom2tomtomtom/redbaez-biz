#!/usr/bin/env python3
"""
Streamlit app for blind evaluation of taglines.
"""

import os
import csv
import pandas as pd
import streamlit as st
import numpy as np
from pathlib import Path
from scipy import stats

# Set page config
st.set_page_config(
    page_title="ECD-Eye Blind Evaluation",
    page_icon="🔍",
    layout="wide"
)

# Paths
DATA_DIR = Path(__file__).parent.parent / "data"
EVALUATION_FILE = DATA_DIR / "evaluation.csv"
RESULTS_FILE = DATA_DIR / "evaluation_results.csv"

def load_data():
    """Load evaluation data."""
    if not EVALUATION_FILE.exists():
        st.error(f"Evaluation file not found at {EVALUATION_FILE}")
        st.stop()
    
    return pd.read_csv(EVALUATION_FILE)

def save_results(results):
    """Save evaluation results to CSV file."""
    with open(RESULTS_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "brief_id", 
            "brief", 
            "baseline_tagline", 
            "finetuned_tagline", 
            "preferred_tagline", 
            "preferred_model"
        ])
        
        for brief_id, data in results.items():
            writer.writerow([
                brief_id,
                data["brief"],
                data["baseline_tagline"],
                data["finetuned_tagline"],
                data["preferred_tagline"],
                data["preferred_model"]
            ])
    
    return RESULTS_FILE

def calculate_statistics(results):
    """Calculate statistics for the evaluation results."""
    if not results:
        return {}
    
    # Count preferences
    baseline_count = sum(1 for data in results.values() if data["preferred_model"] == "baseline")
    finetuned_count = sum(1 for data in results.values() if data["preferred_model"] == "finetuned")
    total_count = len(results)
    
    # Calculate percentages
    baseline_percent = baseline_count / total_count * 100 if total_count > 0 else 0
    finetuned_percent = finetuned_count / total_count * 100 if total_count > 0 else 0
    
    # Binomial test
    if total_count > 0:
        p_value = stats.binom_test(finetuned_count, total_count, p=0.5, alternative='greater')
    else:
        p_value = 1.0
    
    return {
        "baseline_count": baseline_count,
        "finetuned_count": finetuned_count,
        "total_count": total_count,
        "baseline_percent": baseline_percent,
        "finetuned_percent": finetuned_percent,
        "p_value": p_value,
        "significant": p_value < 0.05
    }

def main():
    st.title("🔍 ECD-Eye Blind Evaluation")
    st.markdown("""
    ## Instructions
    
    For each brief, select which tagline you prefer (A or B).
    
    When you're done, click the 'Submit Evaluation' button at the bottom of the page.
    """)
    
    # Load data
    eval_df = load_data()
    
    # Initialize session state for results
    if "results" not in st.session_state:
        st.session_state.results = {}
        for _, row in eval_df.iterrows():
            brief_id = row["brief_id"]
            st.session_state.results[brief_id] = {
                "brief": row["brief"],
                "baseline_tagline": row["baseline_tagline"],
                "finetuned_tagline": row["finetuned_tagline"],
                "tagline_a": row["randomized_a"],
                "tagline_b": row["randomized_b"],
                "is_a_baseline": row["is_a_baseline"],
                "preferred_option": None,
                "preferred_tagline": None,
                "preferred_model": None
            }
    
    # Display briefs and taglines for evaluation
    for brief_id, data in st.session_state.results.items():
        st.markdown(f"### Brief {brief_id}")
        st.markdown(f"**{data['brief']}**")
        
        # Create columns for taglines
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("**Option A**")
            st.markdown(f"_{data['tagline_a']}_")
        
        with col2:
            st.markdown("**Option B**")
            st.markdown(f"_{data['tagline_b']}_")
        
        # Preference selection
        preference = st.radio(
            "Which tagline do you prefer?",
            options=["Option A", "Option B"],
            key=f"preference_{brief_id}",
            horizontal=True
        )
        
        # Update results
        if preference == "Option A":
            st.session_state.results[brief_id]["preferred_option"] = "A"
            st.session_state.results[brief_id]["preferred_tagline"] = data["tagline_a"]
            st.session_state.results[brief_id]["preferred_model"] = "baseline" if data["is_a_baseline"] else "finetuned"
        else:
            st.session_state.results[brief_id]["preferred_option"] = "B"
            st.session_state.results[brief_id]["preferred_tagline"] = data["tagline_b"]
            st.session_state.results[brief_id]["preferred_model"] = "finetuned" if data["is_a_baseline"] else "baseline"
        
        st.markdown("---")
    
    # Submit button
    if st.button("Submit Evaluation", type="primary"):
        try:
            # Save results
            results_file = save_results(st.session_state.results)
            st.success(f"Evaluation results saved to {results_file}")
            
            # Calculate statistics
            stats = calculate_statistics(st.session_state.results)
            
            # Display results
            st.markdown("## Results")
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.metric("Baseline Preferred", f"{stats['baseline_count']}/{stats['total_count']} ({stats['baseline_percent']:.1f}%)")
            
            with col2:
                st.metric("Fine-tuned Preferred", f"{stats['finetuned_count']}/{stats['total_count']} ({stats['finetuned_percent']:.1f}%)")
            
            st.markdown(f"**p-value:** {stats['p_value']:.4f}")
            
            if stats['significant']:
                st.success("The fine-tuned model is significantly better than the baseline model! 🎉")
            else:
                st.info("The difference between models is not statistically significant.")
            
            # Show download button
            with open(results_file, "r") as f:
                st.download_button(
                    label="Download Results CSV",
                    data=f,
                    file_name="evaluation_results.csv",
                    mime="text/csv"
                )
        except Exception as e:
            st.error(f"Error saving results: {e}")

if __name__ == "__main__":
    main()
