from flask import Flask, render_template, request
import numpy as np
from hill_cipher import encrypt, decrypt, is_valid_key

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        try:
            key = eval(request.form['key'])  # Convert string input to list
            message = request.form['message']
            action = request.form['action']

            if action == 'encrypt':
                result, steps = encrypt(message, key)
            elif action == 'decrypt':
                if not is_valid_key(key):
                    return render_template('index.html', error="Invalid key for decryption. Please provide a valid key.")
                result, steps = decrypt(message, key)
            return render_template('index.html', result=result, steps=steps)
        except Exception as e:
            return render_template('index.html', error=f"An error occurred: {str(e)}")
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)