from flask import Flask, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)

# Store the process globally
process = None

@app.route('/start-processing', methods=['POST'])
def start_processing():
    global process
    try:
        if process is not None:
            return jsonify({"message": "Process already running"}), 400
        
        script_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(script_dir, 'getcordinates.py')
        
        # Start the Python script
        process = subprocess.Popen(
            ['python3', script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        return jsonify({"message": "Processing started successfully"}), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to start processing: {str(e)}"}), 500

@app.route('/stop-processing', methods=['POST'])
def stop_processing():
    global process
    try:
        if process:
            process.terminate()
            process = None
            return jsonify({"message": "Processing stopped successfully"}), 200
        else:
            return jsonify({"message": "No process running"}), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to stop processing: {str(e)}"}), 500

@app.route('/status', methods=['GET'])
def get_status():
    global process
    try:
        if process is not None and process.poll() is None:
            # Process is running
            return jsonify({"status": "running"}), 200
        else:
            # Process is not running
            process = None
            return jsonify({"status": "stopped"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to check status: {str(e)}"}), 500

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(host='0.0.0.0', port=3000, debug=True)
