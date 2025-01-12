from flask import Flask, jsonify
from flask_cors import CORS
import subprocess
import os
import signal

app = Flask(__name__)
CORS(app)

# Store the process globally
process = None

@app.route('/start', methods=['POST'])
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

@app.route('/stop', methods=['POST'])
def stop_processing():
    global process
    try:
        if process:
            # Send SIGINT to the process to simulate Ctrl+C
            process.send_signal(signal.SIGINT)
            process.wait()  # Wait for the process to terminate
            process = None
            return jsonify({"message": "Processing stopped successfully"}), 200
        else:
            return jsonify({"message": "No process running"}), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to stop processing: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)