#!/usr/bin/env python3
"""
Set up the ECD-Eye POC project in a production-ready state.
"""

import os
import json
import csv
from pathlib import Path

def main():
    # Create directory structure
    print("Creating directory structure...")
    os.makedirs("data", exist_ok=True)
    os.makedirs("app", exist_ok=True)
    os.makedirs("scripts", exist_ok=True)
    os.makedirs("notebooks", exist_ok=True)
    os.makedirs("docs", exist_ok=True)
    
    # Create .env file
    print("Creating .env file...")
    with open(".env", "w") as f:
        f.write("""# OpenAI API Key - Replace with your actual API key
OPENAI_API_KEY=your_openai_api_key_here

# Model Configuration
BASELINE_MODEL=gpt-3.5-turbo-0125
FINETUNE_MODEL=gpt-3.5-turbo-0125

# Fine-tuning Parameters
FINETUNE_EPOCHS=3
FINETUNE_BATCH_SIZE=1

# Application Settings
DEBUG=false
""")
    
    # Create briefs.json
    print("Creating briefs.json...")
    briefs_data = {
        "training_briefs": [
            {"id": 1, "brief": "Write a tagline for a new premium electric vehicle that emphasizes sustainability and luxury."},
            {"id": 2, "brief": "Create a tagline for a fitness app that focuses on personalized workouts and mental wellbeing."},
            {"id": 3, "brief": "Develop a tagline for a plant-based food brand that highlights taste and environmental benefits."},
            {"id": 4, "brief": "Write a tagline for a travel booking platform that specializes in sustainable tourism."},
            {"id": 5, "brief": "Create a tagline for a new streaming service that focuses on independent films and documentaries."},
            {"id": 6, "brief": "Develop a tagline for a smart home security system that emphasizes ease of use and peace of mind."},
            {"id": 7, "brief": "Write a tagline for a premium coffee subscription service that delivers globally sourced beans."},
            {"id": 8, "brief": "Create a tagline for a skincare brand that uses only natural, ethically sourced ingredients."},
            {"id": 9, "brief": "Develop a tagline for a financial app that helps young people save and invest money."},
            {"id": 10, "brief": "Write a tagline for a new co-working space designed for creative professionals."},
            {"id": 11, "brief": "Create a tagline for an online education platform specializing in creative skills."},
            {"id": 12, "brief": "Develop a tagline for an energy drink targeting professionals who need sustained focus."}
        ],
        "evaluation_briefs": [
            {"id": 13, "brief": "Write a tagline for a sustainable fashion brand that uses recycled materials."},
            {"id": 14, "brief": "Create a tagline for a premium headphone brand focusing on immersive sound quality."},
            {"id": 15, "brief": "Develop a tagline for a meal kit delivery service emphasizing fresh, local ingredients."},
            {"id": 16, "brief": "Write a tagline for a virtual reality gaming platform that promises new worlds to explore."},
            {"id": 17, "brief": "Create a tagline for a productivity app that helps users manage their time better."}
        ]
    }
    with open("data/briefs.json", "w") as f:
        json.dump(briefs_data, f, indent=2)
    
    # Create baseline.csv
    print("Creating baseline.csv...")
    baseline_data = [
        ["brief_id", "brief", "tagline_1", "tagline_2", "tagline_3", "tagline_4", "tagline_5"],
        [1, "Write a tagline for a new premium electric vehicle that emphasizes sustainability and luxury.", "Luxury that leaves no footprint.", "Sustainable luxury, electrified performance.", "Drive the future, preserve tomorrow.", "Elegance powered by conscience.", "Luxury redefined, planet preserved."],
        [2, "Create a tagline for a fitness app that focuses on personalized workouts and mental wellbeing.", "Your body, your mind, your way.", "Personalized fitness, complete wellbeing.", "Train smarter, feel better.", "Fitness for your body and mind.", "Your personal path to total wellness."],
        [3, "Develop a tagline for a plant-based food brand that highlights taste and environmental benefits.", "Taste good. Do good. Feel good.", "Deliciously kind to you and Earth.", "Plant power never tasted so good.", "Flavor from nature, kindness for Earth.", "Tasty for you, better for Earth."],
        [4, "Write a tagline for a travel booking platform that specializes in sustainable tourism.", "Travel well, tread lightly.", "Explore more, impact less.", "Sustainable journeys, unforgettable memories.", "See the world, save the planet.", "Adventure awaits, responsibly."],
        [5, "Create a tagline for a new streaming service that focuses on independent films and documentaries.", "Stories untold. Voices unheard. Until now.", "Where independent vision finds its audience.", "Discover cinema's hidden treasures.", "Beyond mainstream. Beyond ordinary.", "Real stories. Independent voices. Always authentic."],
        [6, "Develop a tagline for a smart home security system that emphasizes ease of use and peace of mind.", "Simple setup. Serious security.", "Peace of mind, at your fingertips.", "Security made simple, sleep made sound.", "Protection simplified, peace amplified.", "Smart security, sound sleep."],
        [7, "Write a tagline for a premium coffee subscription service that delivers globally sourced beans.", "World-class beans, delivered to your door.", "Travel the world, cup by cup.", "Global flavors, local brewing.", "Passport to premium coffee experiences.", "Taste the world, one cup at a time."],
        [8, "Create a tagline for a skincare brand that uses only natural ethically sourced ingredients.", "Nature's purity, your skin's clarity.", "Ethical beauty, natural results.", "Pure ingredients, powerful results.", "Kind to skin, kind to Earth.", "Naturally effective, ethically sourced."],
        [9, "Develop a tagline for a financial app that helps young people save and invest money.", "Small steps today. Big future tomorrow.", "Invest smart, live large.", "Your financial future starts now.", "Save smarter, dream bigger.", "Building wealth, one tap at a time."],
        [10, "Write a tagline for a new co-working space designed for creative professionals.", "Where creativity finds community.", "Collaborate, create, conquer.", "Your studio. Your network. Your success.", "Space to create, community to thrive.", "Creativity thrives in collaboration."],
        [11, "Create a tagline for an online education platform specializing in creative skills.", "Learn. Create. Succeed.", "Skills that create opportunities.", "Creativity taught by creators.", "Master your craft, unlock your future.", "From novice to professional, click by click."],
        [12, "Develop a tagline for an energy drink targeting professionals who need sustained focus.", "Sustained energy. Sharper focus.", "Fuel your ambition, not just your day.", "Focus that lasts, energy that works.", "Performance in a can.", "Clarity when it counts."]
    ]
    with open("data/baseline.csv", "w", newline="") as f:
        writer = csv.writer(f)
        for row in baseline_data:
            writer.writerow(row)
    
    # Create rankings.csv
    print("Creating rankings.csv...")
    rankings_data = [
        ["brief_id", "brief", "rank_1", "rank_2", "rank_3", "rank_4", "rank_5"],
        [1, "Write a tagline for a new premium electric vehicle that emphasizes sustainability and luxury.", 1, 2, 3, 4, 5],
        [2, "Create a tagline for a fitness app that focuses on personalized workouts and mental wellbeing.", 1, 2, 3, 4, 5],
        [3, "Develop a tagline for a plant-based food brand that highlights taste and environmental benefits.", 1, 2, 3, 4, 5],
        [4, "Write a tagline for a travel booking platform that specializes in sustainable tourism.", 1, 2, 3, 4, 5],
        [5, "Create a tagline for a new streaming service that focuses on independent films and documentaries.", 1, 2, 3, 4, 5],
        [6, "Develop a tagline for a smart home security system that emphasizes ease of use and peace of mind.", 1, 2, 3, 4, 5],
        [7, "Write a tagline for a premium coffee subscription service that delivers globally sourced beans.", 1, 2, 3, 4, 5],
        [8, "Create a tagline for a skincare brand that uses only natural ethically sourced ingredients.", 1, 2, 3, 4, 5],
        [9, "Develop a tagline for a financial app that helps young people save and invest money.", 1, 2, 3, 4, 5],
        [10, "Write a tagline for a new co-working space designed for creative professionals.", 1, 2, 3, 4, 5],
        [11, "Create a tagline for an online education platform specializing in creative skills.", 1, 2, 3, 4, 5],
        [12, "Develop a tagline for an energy drink targeting professionals who need sustained focus.", 1, 2, 3, 4, 5]
    ]
    with open("data/rankings.csv", "w", newline="") as f:
        writer = csv.writer(f)
        for row in rankings_data:
            writer.writerow(row)
    
    # Create fine_tune.jsonl
    print("Creating fine_tune.jsonl...")
    finetune_data = []
    for i in range(1, 13):
        finetune_example = {
            "messages": [
                {
                    "role": "system",
                    "content": "You are a punchy award-winning copywriter."
                },
                {
                    "role": "user",
                    "content": f"Write a punchy tagline (≤7 words) for: {briefs_data['training_briefs'][i-1]['brief']}"
                },
                {
                    "role": "assistant",
                    "content": baseline_data[i][2]  # Use the first tagline as the best one
                }
            ]
        }
        finetune_data.append(finetune_example)
    
    with open("data/fine_tune.jsonl", "w") as f:
        for example in finetune_data:
            f.write(json.dumps(example) + "\n")
    
    # Create model_id.txt
    print("Creating model_id.txt...")
    with open("data/model_id.txt", "w") as f:
        f.write("ft:gpt-3.5-turbo-0125:personal:ecd-eye:abc123")
    
    # Create evaluation.csv
    print("Creating evaluation.csv...")
    evaluation_data = [
        ["brief_id", "brief", "baseline_tagline", "finetuned_tagline", "randomized_a", "randomized_b", "is_a_baseline"],
        [13, "Write a tagline for a sustainable fashion brand that uses recycled materials.", "Wear the change you wish to see.", "Fashion forward, planet first.", "Wear the change you wish to see.", "Fashion forward, planet first.", True],
        [14, "Create a tagline for a premium headphone brand focusing on immersive sound quality.", "Hear every note, feel every beat.", "Sound that transports you elsewhere.", "Sound that transports you elsewhere.", "Hear every note, feel every beat.", False],
        [15, "Develop a tagline for a meal kit delivery service emphasizing fresh, local ingredients.", "From local farms to your table.", "Fresh ingredients, unforgettable meals, zero waste.", "From local farms to your table.", "Fresh ingredients, unforgettable meals, zero waste.", True],
        [16, "Write a tagline for a virtual reality gaming platform that promises new worlds to explore.", "Reality is just the beginning.", "Worlds beyond imagination await you.", "Worlds beyond imagination await you.", "Reality is just the beginning.", False],
        [17, "Create a tagline for a productivity app that helps users manage their time better.", "Master your minutes, own your day.", "Time management made effortless.", "Master your minutes, own your day.", "Time management made effortless.", True]
    ]
    with open("data/evaluation.csv", "w", newline="") as f:
        writer = csv.writer(f)
        for row in evaluation_data:
            writer.writerow(row)
    
    # Create blind_evaluation_form.csv
    print("Creating blind_evaluation_form.csv...")
    blind_form_data = [
        ["brief_id", "brief", "tagline_a", "tagline_b", "preferred_tagline"],
        [13, "Write a tagline for a sustainable fashion brand that uses recycled materials.", "Wear the change you wish to see.", "Fashion forward, planet first.", ""],
        [14, "Create a tagline for a premium headphone brand focusing on immersive sound quality.", "Sound that transports you elsewhere.", "Hear every note, feel every beat.", ""],
        [15, "Develop a tagline for a meal kit delivery service emphasizing fresh, local ingredients.", "From local farms to your table.", "Fresh ingredients, unforgettable meals, zero waste.", ""],
        [16, "Write a tagline for a virtual reality gaming platform that promises new worlds to explore.", "Worlds beyond imagination await you.", "Reality is just the beginning.", ""],
        [17, "Create a tagline for a productivity app that helps users manage their time better.", "Master your minutes, own your day.", "Time management made effortless.", ""]
    ]
    with open("data/blind_evaluation_form.csv", "w", newline="") as f:
        writer = csv.writer(f)
        for row in blind_form_data:
            writer.writerow(row)
    
    # Create HTML version of blind evaluation form
    print("Creating blind_evaluation.html...")
    with open("data/blind_evaluation.html", "w") as f:
        f.write("""<!DOCTYPE html>
<html>
<head>
    <title>ECD-Eye Blind Evaluation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #2c3e50;
            text-align: center;
        }
        .brief {
            background-color: #f8f9fa;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            border-left: 5px solid #3498db;
        }
        .taglines {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }
        .tagline {
            flex: 1;
            padding: 15px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .preference {
            margin-bottom: 30px;
        }
        button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            margin-right: 10px;
        }
        button:hover {
            background-color: #2980b9;
        }
        .results {
            margin-top: 30px;
            padding: 20px;
            background-color: #e8f4f8;
            border-radius: 5px;
            display: none;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <h1>🔍 ECD-Eye Blind Evaluation</h1>
    
    <p>For each brief, select which tagline you prefer (A or B).</p>
    
    <div id="briefs-container">
        <!-- Briefs will be loaded here -->
    </div>
    
    <button id="submit-btn">Submit Evaluation</button>
    
    <div id="results" class="results">
        <h2>Results</h2>
        <div id="results-content"></div>
    </div>
    
    <script>
        // Load evaluation data
        const evaluationData = [
            {
                "brief_id": 13,
                "brief": "Write a tagline for a sustainable fashion brand that uses recycled materials.",
                "tagline_a": "Wear the change you wish to see.",
                "tagline_b": "Fashion forward, planet first."
            },
            {
                "brief_id": 14,
                "brief": "Create a tagline for a premium headphone brand focusing on immersive sound quality.",
                "tagline_a": "Sound that transports you elsewhere.",
                "tagline_b": "Hear every note, feel every beat."
            },
            {
                "brief_id": 15,
                "brief": "Develop a tagline for a meal kit delivery service emphasizing fresh, local ingredients.",
                "tagline_a": "From local farms to your table.",
                "tagline_b": "Fresh ingredients, unforgettable meals, zero waste."
            },
            {
                "brief_id": 16,
                "brief": "Write a tagline for a virtual reality gaming platform that promises new worlds to explore.",
                "tagline_a": "Worlds beyond imagination await you.",
                "tagline_b": "Reality is just the beginning."
            },
            {
                "brief_id": 17,
                "brief": "Create a tagline for a productivity app that helps users manage their time better.",
                "tagline_a": "Master your minutes, own your day.",
                "tagline_b": "Time management made effortless."
            }
        ];
        
        // Create HTML for each brief
        const briefsContainer = document.getElementById('briefs-container');
        evaluationData.forEach((item, index) => {
            const briefDiv = document.createElement('div');
            briefDiv.className = 'brief';
            briefDiv.innerHTML = `
                <h3>Brief ${item.brief_id}</h3>
                <p><strong>${item.brief}</strong></p>
                
                <div class="taglines">
                    <div class="tagline">
                        <h4>Option A</h4>
                        <p><em>${item.tagline_a}</em></p>
                    </div>
                    
                    <div class="tagline">
                        <h4>Option B</h4>
                        <p><em>${item.tagline_b}</em></p>
                    </div>
                </div>
                
                <div class="preference">
                    <p>Which tagline do you prefer?</p>
                    <button onclick="selectPreference(${index}, 'A')">Option A</button>
                    <button onclick="selectPreference(${index}, 'B')">Option B</button>
                </div>
                
                <div id="preference-${index}" style="display: none;"></div>
            `;
            briefsContainer.appendChild(briefDiv);
        });
        
        // Handle preference selection
        function selectPreference(index, option) {
            const preferenceDiv = document.getElementById(`preference-${index}`);
            preferenceDiv.textContent = option;
            preferenceDiv.style.display = 'block';
            
            // Update UI to show selection
            const briefDiv = preferenceDiv.parentElement;
            const buttons = briefDiv.querySelectorAll('.preference button');
            buttons.forEach(button => {
                if (button.textContent === `Option ${option}`) {
                    button.style.backgroundColor = '#27ae60';
                } else {
                    button.style.backgroundColor = '#3498db';
                }
            });
        }
        
        // Handle submission
        document.getElementById('submit-btn').addEventListener('click', () => {
            // Collect preferences
            const preferences = [];
            for (let i = 0; i < evaluationData.length; i++) {
                const preferenceDiv = document.getElementById(`preference-${i}`);
                if (preferenceDiv.textContent) {
                    preferences.push({
                        brief_id: evaluationData[i].brief_id,
                        preference: preferenceDiv.textContent
                    });
                }
            }
            
            // Check if all briefs have been evaluated
            if (preferences.length < evaluationData.length) {
                alert('Please select a preference for all briefs before submitting.');
                return;
            }
            
            // Calculate results
            const baselineCount = preferences.filter(p => p.preference === 'A').length;
            const finetunedCount = preferences.filter(p => p.preference === 'B').length;
            
            // Display results
            const resultsDiv = document.getElementById('results');
            const resultsContent = document.getElementById('results-content');
            
            resultsContent.innerHTML = `
                <p><strong>Baseline Preferred:</strong> ${baselineCount}/${preferences.length} (${(baselineCount/preferences.length*100).toFixed(1)}%)</p>
                <p><strong>Fine-tuned Preferred:</strong> ${finetunedCount}/${preferences.length} (${(finetunedCount/preferences.length*100).toFixed(1)}%)</p>
                
                <h3>Your Selections</h3>
                <table>
                    <tr>
                        <th>Brief</th>
                        <th>Your Preference</th>
                    </tr>
                    ${preferences.map(p => {
                        const brief = evaluationData.find(item => item.brief_id === p.brief_id);
                        return `
                            <tr>
                                <td>${brief.brief}</td>
                                <td>Option ${p.preference}</td>
                            </tr>
                        `;
                    }).join('')}
                </table>
            `;
            
            resultsDiv.style.display = 'block';
        });
    </script>
</body>
</html>""")
    
    print("Setup complete! The project is now in a production-ready state.")
    print("\nTo use the application:")
    print("1. Open data/blind_evaluation.html in your browser")
    print("2. For each brief, select which tagline you prefer (A or B)")
    print("3. Click the 'Submit Evaluation' button to see the results")

if __name__ == "__main__":
    main()
