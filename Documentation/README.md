# ASSUREX CLAIM ENGINE

## NextWave AI & ML

AssureX Claim Engine is an AI-assisted warranty claim analysis system developed as a NextWave AI & ML project.

The system analyses product warranty claims using a combination of:

- Python Machine Learning
- Rule-based warranty validation
- SQLite database storage
- Receipt and document OCR
- Google Teachable Machine
- React
- Vite
- Flask
- Synthetic warranty-claim datasets

The system classifies claims into three categories:

1. Valid Claim
2. Invalid Claim
3. Manual Review

The project is a prototype. The warranty rules and training dataset are synthetic examples and are not intended to represent real manufacturer warranty policies.

---

# 1. PROJECT OVERVIEW

AssureX allows warranty claims to be submitted and analysed automatically.

The backend performs two main types of analysis:

1. Machine-learning prediction
2. Deterministic warranty-rule evaluation

The Python machine-learning model produces a prediction and probability values for the three claim classes.

The rule engine independently examines the warranty conditions and evidence.

This means that the machine-learning prediction is not the only factor used to determine the final recommendation.

For example, an expired warranty can result in:

`Invalid Claim`

while missing evidence or a serial-number mismatch can result in:

`Manual Review`

---

# 2. MAIN PROJECT COMPONENTS

The project is divided into three major areas.

```text
AiProject/
│
├── Python dataset and model scripts
├── backend/
├── frontend/
└── output/