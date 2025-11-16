#!/bin/bash
echo "Starting Flask Backend Server..."
cd backend
echo "Installing required packages..."
pip install -r requirements.txt
echo "Starting server..."
python app.py