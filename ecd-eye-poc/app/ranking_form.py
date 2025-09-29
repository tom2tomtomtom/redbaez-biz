#!/usr/bin/env python3
"""
Streamlit app for ECD to rank taglines.
"""

import os
import csv
import json
import pandas as pd
import streamlit as st
from pathlib import Path

# Set page config
st.set_page_config(
    page_title="ECD-Eye Tagline Ranking",
    page_icon="🏆",
    layout="wide"
)

# Paths
DATA_DIR = Path(__file__).parent.parent / "data"
BRIEFS_FILE = DATA_DIR / "briefs.json"
BASELINE_FILE = DATA_DIR / "baseline.csv"
RANKINGS_FILE = DATA_DIR / "rankings.csv"

def load_data():
    """Load briefs and baseline taglines."""
    # Load briefs
    with open(BRIEFS_FILE, "r") as f:
        briefs_data = json.load(f)
    
    # Load baseline taglines
    baseline_df = pd.read_csv(BASELINE_FILE)
    
    return briefs_data, baseline_df

def save_rankings(rankings):
    """Save rankings to CSV file."""
    with open(RANKINGS_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["brief_id", "brief", "rank_1", "rank_2", "rank_3", "rank_4", "rank_5"])
        for brief_id, data in rankings.items():
            writer.writerow([
                brief_id,
                data["brief"],
                data["rankings"][0],
                data["rankings"][1],
                data["rankings"][2],
                data["rankings"][3],
                data["rankings"][4]
            ])
    
    return RANKINGS_FILE

def main():
    st.title("🏆 ECD-Eye Tagline Ranking")
    st.markdown("""
    ## Instructions
    
    For each brief, rank the taglines from best (1) to worst (5) by dragging them into order.
    
    When you're done, click the 'Save Rankings' button at the bottom of the page.
    """)
    
    # Load data
    briefs_data, baseline_df = load_data()
    training_briefs = briefs_data["training_briefs"]
    
    # Initialize session state for rankings
    if "rankings" not in st.session_state:
        st.session_state.rankings = {}
        for brief in training_briefs:
            brief_id = brief["id"]
            brief_row = baseline_df[baseline_df["brief_id"] == brief_id].iloc[0]
            
            # Get taglines for this brief
            taglines = [
                brief_row["tagline_1"],
                brief_row["tagline_2"],
                brief_row["tagline_3"],
                brief_row["tagline_4"],
                brief_row["tagline_5"]
            ]
            
            st.session_state.rankings[brief_id] = {
                "brief": brief["brief"],
                "taglines": taglines,
                "rankings": list(range(1, 6))  # Default ranking: 1, 2, 3, 4, 5
            }
    
    # Display briefs and taglines for ranking
    for brief in training_briefs:
        brief_id = brief["id"]
        brief_text = brief["brief"]
        
        st.markdown(f"### Brief {brief_id}")
        st.markdown(f"**{brief_text}**")
        
        # Get taglines for this brief
        taglines = st.session_state.rankings[brief_id]["taglines"]
        
        # Create columns for taglines
        cols = st.columns(5)
        
        # Display taglines with rank selection
        for i, (col, tagline) in enumerate(zip(cols, taglines)):
            with col:
                st.markdown(f"**Tagline {i+1}**")
                st.markdown(f"_{tagline}_")
                rank = st.selectbox(
                    f"Rank for Tagline {i+1}",
                    options=[1, 2, 3, 4, 5],
                    key=f"rank_{brief_id}_{i}",
                    index=i  # Default to sequential ranking
                )
                st.session_state.rankings[brief_id]["rankings"][i] = rank
        
        st.markdown("---")
    
    # Save rankings button
    if st.button("Save Rankings", type="primary"):
        try:
            # Validate rankings
            for brief_id, data in st.session_state.rankings.items():
                rankings = data["rankings"]
                if sorted(rankings) != [1, 2, 3, 4, 5]:
                    st.error(f"Invalid ranking for Brief {brief_id}. Each tagline must have a unique rank from 1 to 5.")
                    return
            
            # Save rankings
            rankings_file = save_rankings(st.session_state.rankings)
            st.success(f"Rankings saved to {rankings_file}")
            
            # Show download button
            with open(rankings_file, "r") as f:
                st.download_button(
                    label="Download Rankings CSV",
                    data=f,
                    file_name="rankings.csv",
                    mime="text/csv"
                )
        except Exception as e:
            st.error(f"Error saving rankings: {e}")

if __name__ == "__main__":
    main()
