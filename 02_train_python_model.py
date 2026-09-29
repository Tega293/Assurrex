"""Run in Spyder with F5 after 01_generate_dataset.py."""
from pathlib import Path
import json
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.metrics import f1_score, classification_report, confusion_matrix

OUT = Path(__file__).resolve().parent / 'output'
train = pd.read_csv(OUT / 'train.csv')
validation = pd.read_csv(OUT / 'validation.csv')
test = pd.read_csv(OUT / 'test.csv')

# Never use ID, dates as raw strings, or the known answer as model inputs.
num = ['warranty_months', 'product_age_days', 'remaining_warranty_days',
       'fault_claim_gap_days', 'repair_purchase_gap_days',
       'receipt_present', 'serial_match', 'repair_count', 'authorized_repair',
       'missing_document_count', 'duplicate_indicator', 'contradiction_indicator']
cat = ['product_category', 'fault_type', 'damage_type']
features = num + cat

def pipeline(classifier):
    preparation = ColumnTransformer([
        ('numbers', Pipeline([('fill', SimpleImputer(strategy='median')),
                              ('scale', StandardScaler())]), num),
        ('categories', Pipeline([('fill', SimpleImputer(strategy='most_frequent')),
                                 ('encode', OneHotEncoder(handle_unknown='ignore'))]), cat)
    ])
    return Pipeline([('preparation', preparation), ('model', classifier)])

algorithms = {
    'Logistic Regression': LogisticRegression(max_iter=1000),
    'Random Forest': RandomForestClassifier(n_estimators=150, random_state=42),
    'Extra Trees': ExtraTreesClassifier(n_estimators=150, random_state=42)
}
scores = {}
trained = {}
for name, algorithm in algorithms.items():
    model = pipeline(algorithm)
    model.fit(train[features], train.claim_class)
    predicted = model.predict(validation[features])
    scores[name] = float(f1_score(validation.claim_class, predicted, average='macro'))
    trained[name] = model
    print(name, '| validation macro F1:', round(scores[name], 3))

best_name = max(scores, key=scores.get)
best_model = trained[best_name]
test_predicted = best_model.predict(test[features])
print('\nSelected:', best_name)
print('\nHeld-out test report:\n', classification_report(test.claim_class, test_predicted))
print('Confusion matrix (model class order):', list(best_model.classes_))
print(confusion_matrix(test.claim_class, test_predicted, labels=best_model.classes_))
joblib.dump(best_model, OUT / 'assurex_python_model.joblib')
with open(OUT / 'training_scores.json', 'w') as f:
    json.dump({'validation_macro_f1': scores, 'selected': best_name,
               'classes': list(best_model.classes_)}, f, indent=2)

# Example: scores for all three classes on one unseen test claim.
example = test.iloc[[0]]
probabilities = best_model.predict_proba(example[features])[0]
print('\nExample claim:', example.claim_id.iloc[0])
print(dict(zip(best_model.classes_, probabilities.round(3))))
