from flask import Flask, request
import subprocess
import os

app = Flask(__name__)

@app.route('/run-code', methods=['POST'])
def run_code():
    data = request.get_json()
    filename = data.get("filename")
    timeout = data.get("timeout", 5)  # Default to 5 seconds if not provided
    
    if not filename:
        return {"error": "No filename provided"}, 400

    file_path = os.path.join("/usr/src/temp_code", filename)

    if not os.path.exists(file_path):
        return {"error": "File not found"}, 404

    try:
        # Run the code with the provided timeout value
        result = subprocess.run(
            ["python3", file_path],
            capture_output=True,
            text=True,
            timeout=timeout  # Use timeout value from backend
        )
        return {"output": result.stdout, "error": result.stderr}
    except subprocess.TimeoutExpired:
        return {"error": f"Code execution timed out after {timeout} seconds"}, 408
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000)
