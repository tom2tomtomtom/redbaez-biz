.PHONY: all setup generate rank prepare finetune evaluate blind clean

all: setup generate rank prepare finetune evaluate

setup:
	@echo "Setting up environment..."
	pip install -r requirements.txt

generate:
	@echo "Generating baseline taglines..."
	python scripts/generate_baseline.py

rank:
	@echo "Starting ranking form..."
	streamlit run app/ranking_form.py

prepare:
	@echo "Preparing fine-tuning data..."
	python scripts/prepare_finetune.py

finetune:
	@echo "Submitting fine-tuning job..."
	python scripts/submit_finetune.py

evaluate:
	@echo "Evaluating models..."
	python scripts/evaluate_models.py

blind:
	@echo "Starting blind evaluation..."
	streamlit run app/blind_evaluation.py

clean:
	@echo "Cleaning up..."
	rm -f data/baseline.csv data/rankings.csv data/fine_tune.jsonl data/model_id.txt data/evaluation.csv data/evaluation_results.csv
