import sys
import json
import pandas as pd
import joblib

# 1. Load the trained Brain
try:
    model = joblib.load('eadvisor_model.pkl')
except Exception as e:
    print(json.dumps({"error": f"Could not load model: {str(e)}"}))
    sys.exit(1)

# 2. Read the data sent by Node.js
try:
    # Node.js will send the data as a JSON string argument
    input_data = json.loads(sys.argv[1])
except Exception as e:
    print(json.dumps({"error": f"Invalid input data: {str(e)}"}))
    sys.exit(1)

# 3. Format the data perfectly for the AI
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

try:
    # Convert the single student's data into a DataFrame
    df = pd.DataFrame([input_data])
    
    # Ensure all numbers are actual numbers, not text
    df[features] = df[features].apply(pd.to_numeric, errors='coerce')
    
    # Fill any missing data with safe defaults just in case
    df = df.fillna(0)
    
    X = df[features]
    
    # 4. Ask the AI for the prediction!
    predicted_grade = model.predict(X)[0]
    
    # 5. Cap the grade between 0 and 100, then round it
    final_grade = max(0, min(100, round(predicted_grade)))
    
    # 6. Send the answer back to Node.js
    print(json.dumps({"success": True, "predicted_grade": final_grade}))

except Exception as e:
    print(json.dumps({"error": f"Prediction failed: {str(e)}"}))
    sys.exit(1)