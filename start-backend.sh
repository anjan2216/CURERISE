#!/bin/bash

echo "Starting CureRise Backend Server..."
echo

cd backend

echo "Checking if Python is available..."
if ! command -v python3 &> /dev/null; then
    echo "Python3 is not installed or not in PATH."
    echo "Please install Python3 and try again."
    exit 1
fi

echo "Installing dependencies..."
pip3 install -r requirements.txt

echo
echo "Starting Flask server..."
echo "Server will be available at: http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo

python3 app.py
