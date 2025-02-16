from flask import Flask, request, jsonify
import numpy as np
import random
from hill_cipher import encrypt, decrypt, is_valid_key, generate_valid_key

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def process():
    data = request.json
    message = data.get("message", "").upper()
    action = data.get("action", "encrypt")
    key_input = data.get("key", "")

    # Try to parse the key matrix
    try:
        key = eval(key_input)  # Convert string to list
        if not isinstance(key, list) or not all(isinstance(row, list) for row in key):
            raise ValueError
    except:
        return jsonify({"error": "Invalid key format. Enter a square matrix (e.g., [[6,24],[1,13]])"}), 400

    if len(key) != len(key[0]):  # Ensure it's a square matrix
        return jsonify({"error": "Key matrix must be square (NxN)."}), 400

    # Allow encryption for any matrix
    if action == "encrypt":
        result, steps = encrypt(message, key)

    # Validate the key for decryption
    elif action == "decrypt":
        if is_valid_key(key):  # Ensure key is invertible mod 26 for decryption
            result, steps = decrypt(message, key)
        else:
            return jsonify({"error": "Invalid key matrix. Determinant is not invertible under mod 26."}), 400
    else:
        return jsonify({"error": "Invalid action. Use 'encrypt' or 'decrypt'."}), 400

    return jsonify({"result": result, "steps": steps})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=10000)
