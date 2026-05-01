import sys
import time
import requests
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.metrics import mean_absolute_error, r2_score

# --- The 8 Competitors ---
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, HistGradientBoostingRegressor
from sklearn.neighbors import KNeighborsRegressor

# ==============================================================================
# 1. EXTRACT DATA (From E-Advisor API)
# ==============================================================================
print("🚀 Fetching training data from E-Advisor API...")
try:
    response = requests.get('http://localhost:5000/api/ml/extract-training-data')
    if response.status_code != 200:
        print(f"❌ Error fetching data: {response.text}")
        sys.exit()
except Exception as e:
    print(f"❌ Connection Error: Make sure Docker/Node backend is running! ({e})")
    sys.exit()

data = response.json()
df = pd.DataFrame(data)

print(f"✅ Successfully loaded {len(df)} historical enrollments!")

# Define All 9 Features (The Ultimate Context)
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

# Clean the data
df[features] = df[features].apply(pd.to_numeric, errors='coerce')
df['actual_grade'] = pd.to_numeric(df['actual_grade'], errors='coerce')
df = df.dropna(subset=features + ['actual_grade'])

X = df[features]
y = df['actual_grade']

# ==============================================================================
# 2. Split the data
# ==============================================================================
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ==============================================================================
# 3. Define the 8 Models to Test
# ==============================================================================
# We wrap them all in StandardScaler pipelines for a perfectly fair fight
models = {
    "Linear Regression (Classic)": make_pipeline(StandardScaler(), LinearRegression()),
    "Ridge Regression (Robust)": make_pipeline(StandardScaler(), Ridge(alpha=1.0)),
    "Lasso Regression (Strict)": make_pipeline(StandardScaler(), Lasso(alpha=0.1)),
    "Decision Tree (Branching)": make_pipeline(StandardScaler(), DecisionTreeRegressor(random_state=42)),
    "Random Forest (Ensemble)": make_pipeline(StandardScaler(), RandomForestRegressor(n_estimators=100, random_state=42)),
    "Gradient Boosting (Sequential)": make_pipeline(StandardScaler(), GradientBoostingRegressor(n_estimators=100, random_state=42)),
    "HistGradient Boosting (Fast/Modern)": make_pipeline(StandardScaler(), HistGradientBoostingRegressor(random_state=42)),
    "K-Nearest Neighbors (Clustering)": make_pipeline(StandardScaler(), KNeighborsRegressor(n_neighbors=5))
}

print("\n🚀 --- AI MODEL BAKE-OFF INITIATED --- 🚀")
print(f"Training and evaluating {len(models)} different state-of-the-art models...\n")

best_model = None
best_r2 = -float('inf')
best_name = ""
leaderboard = []

# ==============================================================================
# 4. Train and Evaluate each model
# ==============================================================================
for name, model in models.items():
    print(f"⚙️ Training {name}...")
    start_time = time.time()
    
    # Train the model
    model.fit(X_train, y_train)
    
    # Make predictions on the unseen test data
    predictions = model.predict(X_test)
    
    # Calculate how smart it is
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    train_time = time.time() - start_time
    
    # Save stats to leaderboard
    leaderboard.append({
        "Model": name,
        "Error (MAE)": round(mae, 2),
        "Accuracy (R2)": round(r2, 2),
        "Time (s)": round(train_time, 2)
    })
    
    # Check if it's the new champion
    if r2 > best_r2:
        best_r2 = r2
        best_model = model
        best_name = name

# ==============================================================================
# 5. Print the Results!
# ==============================================================================
results_df = pd.DataFrame(leaderboard).sort_values(by="Accuracy (R2)", ascending=False).reset_index(drop=True)

print("\n" + "="*80)
print("🏆 FINAL MODEL LEADERBOARD 🏆".center(80))
print("="*80)
print(results_df.to_string(index=False))
print("="*80)

# ==============================================================================
# 6. Save the Champion Model
# ==============================================================================
champion_filename = 'eadvisor_model.pkl'
joblib.dump(best_model, champion_filename)

print(f"\n✅ SUCCESS: The smartest model ({best_name}) has been saved as '{champion_filename}'!")
print("Drop this new file into your 'server' folder and refresh your dashboard!")