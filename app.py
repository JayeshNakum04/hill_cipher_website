from flask import Flask, request, jsonify, render_template
import numpy as np
from hill_cipher import encrypt, decrypt, is_valid_key, generate_valid_key

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    key = ""
    message = ""
    action = "encrypt"
    result = ""
    steps = []
    error = ""
    show_key_prompt = False

    if request.method == 'POST':
        # ✅ Handle JSON requests (API calls)
        if request.is_json:
            data = request.get_json()
            message = data.get("message", "").upper()
            action = data.get("action", "encrypt")
            key = data.get("key", "")

        # ✅ Handle Form Data (HTML Form)
        else:
            message = request.form.get("message", "").upper()
            action = request.form.get("action", "encrypt")
            key_input = request.form.get("key", "")

            try:
                key = eval(key_input)  # Convert key string to list
                if not isinstance(key, list) or not all(isinstance(row, list) for row in key):
                    raise ValueError
            except:
                return jsonify({"error": "Invalid key format. Please enter a square matrix (e.g., [[6,24],[1,13],[12,17,21]])"}), 400

        # ✅ Validate and process key
        n = len(key)
        if action == "encrypt":
            if is_valid_key(key):
                result, steps = encrypt(message, key)
            else:
                error = "Invalid key matrix. Determinant is not invertible under mod 26."
                show_key_prompt = True
        elif action == "decrypt":
            if is_valid_key(key):
                result, steps = decrypt(message, key)
            else:
                error = "Invalid key matrix. Determinant is not invertible under mod 26."
                show_key_prompt = True

        if 'generate_new' in request.form:
            key = generate_valid_key(n)
            error = "Generated a valid key matrix: " + str(key)
            show_key_prompt = False

        # ✅ If API request, return JSON response
        if request.is_json:
            return jsonify({"result": result, "steps": steps, "error": error})

    return render_template('index.html', key=str(key), message=message, action=action, result=result, steps=steps, error=error, show_key_prompt=show_key_prompt)

if __name__ == '__main__':
    app.run(debug=True)
