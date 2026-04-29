import requests
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

print("🚀 Fetching training data from E-Advisor API...")
response = requests.get('http://localhost:5000/api/ml/extract-training-data')

if response.status_code != 200:
    print(f"❌ Error fetching data: {response.text}")
    exit()

data = response.json()
df = pd.DataFrame(data)

print(f"✅ Successfully loaded {len(df)} historical enrollments!")

# 1. Define All 9 Features (The Ultimate Context)
features = [
    'course_credits', 
    'is_summer', 
    'course_historical_average',
    'prof_historical_average', 
    'prof_course_specific_average',
    'credits_completed_before', 
    'cumulative_gpa_before', 
    'attempted_semester_credits',
    'current_schedule_difficulty'
]

df[features] = df[features].apply(pd.to_numeric, errors='coerce')
df['actual_grade'] = pd.to_numeric(df['actual_grade'], errors='coerce')
df = df.dropna(subset=features + ['actual_grade'])

X = df[features]
y = df['actual_grade']

# 2. Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Train the Linear Regression Model
print("🧠 Training the Final Linear Regression AI...")
model = make_pipeline(StandardScaler(), LinearRegression())
model.fit(X_train, y_train)

# 4. Test Accuracy
predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print("\n--- 📊 FINAL MODEL ACCURACY REPORT ---")
print(f"Mean Absolute Error (MAE): {mae:.2f} grades")
print(f"R-Squared (R2 Score):      {r2:.2f}")
print("--------------------------------------\n")

# 5. Save the Brain
joblib.dump(model, 'eadvisor_model.pkl')
print("💾 Final model saved successfully as 'eadvisor_model.pkl'!")