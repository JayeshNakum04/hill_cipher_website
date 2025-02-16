from flask import Flask, render_template, request
import numpy as np
import random
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
          
        message = request.form['message'].upper()
        action = request.form['action']
        
        # Key processing
        key_input = request.form.get('key', '')  # Use '' if key is missing
        try:
            key = eval(key_input)  # Convert string to list
            if not isinstance(key, list) or not all(isinstance(row, list) for row in key):
                raise ValueError
        except:
            error = "Invalid key format. Please enter a square matrix (e.g., [[6,24,1],[1,13,16],[12,17,21]])"
            return render_template('index.html', key=key_input, message=message, action=action, error=error)
        
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
        
    return render_template('index.html', key=str(key), message=message, action=action, result=result, steps=steps, error=error, show_key_prompt=show_key_prompt)

if __name__ == '__main__':
    app.run(debug=True)
