from flask import Flask, render_template, request
import numpy as np
from hill_cipher import encrypt, decrypt, is_valid_key, text_to_matrix

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        try:
            key = eval(request.form['key'])  # Convert string input to list
            message = request.form['message']
            action = request.form['action']

            if action == 'encrypt':
                result = encrypt(message, key)
                steps = f"Encryption Steps:\n1. Converted message to matrix: {text_to_matrix(message, len(key))}\n2. Applied key matrix: {key}\n3. Result: {result}"
            elif action == 'decrypt':
                if not is_valid_key(key):
                    return render_template('index.html', error="Invalid key for decryption. Please provide a valid key.")
                result = decrypt(message, key)
                steps = f"Decryption Steps:\n1. Converted ciphertext to matrix: {text_to_matrix(message, len(key))}\n2. Applied inverse key matrix: {key}\n3. Result: {result}"
            return render_template('index.html', result=result, steps=steps)
        except Exception as e:
            return render_template('index.html', error=f"An error occurred: {str(e)}")
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)