# 🎓 E-Advisor: AI-Powered Academic Planning & Predictive Analytics

An intelligent, full-stack academic advising platform designed to help university students optimize their course registration, balance their workloads, and predict future semester GPAs using machine learning.

## 🚀 Overview

Students often struggle with course registration, leading to academic overload, missed prerequisites, and delayed graduation. **E-Advisor** solves this by shifting academic advising from a *reactive* process to a *proactive* one. By analyzing historical grade trends, course difficulty, and prerequisite structures, the system provides students with data-driven insights before they finalize their schedules.

## ✨ Key Features

*   **Predictive GPA Engine:** Utilizes a Gradient Boosting machine learning model to accurately forecast a student's end-of-semester GPA based on their selected course load and historical academic trajectory.
*   **Smart Course Validation:** Implements Directed Acyclic Graph (DAG) logic to enforce prerequisite constraints and calculate the minimum semesters left to graduate.
*   **Data Simulation Engine:** Features a custom Python-based statistical engine that generated a highly realistic, privacy-compliant dataset of 6,899 academic records to train the predictive models.
*   **Interactive Dashboards:** Visualizes academic progress, GPA trends, and program completion metrics using intuitive UI components.
*   **Real-Time Advising Chat:** Integrates Socket.io for instant, bi-directional communication between students and academic advisors.

## 🛠️ Tech Stack

**Frontend:**
*   React.js (Vite)
*   HTML5 / CSS3 / JavaScript
*   Interactive Data Visualizations

**Backend:**
*   Node.js & Express.js
*   Socket.io (Real-time WebSockets)
*   RESTful API Architecture

**Data & Machine Learning:**
*   Python (Scikit-learn, Pandas)
*   Machine Learning: Gradient Boosting, Random Forest, Regression models
*   MySQL (Relational Database Management)

**DevOps & Infrastructure:**
*   Docker & Docker Compose (Containerization & Network Isolation)

## 🧠 Machine Learning & Predictive Analytics

To ensure the highest accuracy in predicting student performance, an "AI Model Bake-Off" was conducted evaluating 8 state-of-the-art ML models (including Random Forest, Linear/Ridge/Lasso Regression, and K-Nearest Neighbors). 

The models were trained on a simulated dataset of nearly 7,000 enrollments. The **Gradient Boosting (Sequential)** model was selected for production, successfully minimizing the Mean Absolute Error (MAE) to just **6.71 grades**, proving its superior capability in handling complex academic variables like credit-load penalties and course difficulty indexes.

## ⚙️ How to Run Locally

This project is fully containerized using Docker, ensuring environment parity across all machines.

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/e-advisor.git](https://github.com/your-username/e-advisor.git)
   cd e-advisor
