import numpy as np

def text_to_matrix(text, n):
    text = text.upper().replace(" ", "")
    padding_length = (n - len(text) % n) % n
    text += 'X' * padding_length
    return [ord(char) - ord('A') for char in text]

def matrix_to_text(matrix):
    return ''.join([chr(int(val) % 26 + ord('A')) for val in matrix])

def encrypt(message, key):
    n = len(key)
    steps = []
    
    # Step 1: Convert message to numerical matrix
    message_matrix = text_to_matrix(message, n)
    steps.append(f"1. Converted message to numerical matrix: {message_matrix}")
    
    # Step 2: Reshape into digraphs/trigraphs
    message_vector = np.array(message_matrix).reshape(-1, n)
    steps.append(f"2. Reshaped into digraphs/trigraphs: {message_vector.tolist()}")
    
    # Step 3: Multiply by key matrix
    key_matrix = np.array(key)
    encrypted_vector = np.dot(message_vector, key_matrix) % 26
    steps.append(f"3. Multiplied by key matrix {key_matrix.tolist()}: {encrypted_vector.tolist()}")
    
    # Step 4: Flatten and convert to text
    encrypted_matrix = encrypted_vector.flatten()
    result = matrix_to_text(encrypted_matrix)
    steps.append(f"4. Flattened and converted to text: {result}")
    
    return result, steps

def decrypt(ciphertext, key):
    n = len(key)
    steps = []
    
    # Step 1: Convert ciphertext to numerical matrix
    cipher_matrix = text_to_matrix(ciphertext, n)
    steps.append(f"1. Converted ciphertext to numerical matrix: {cipher_matrix}")
    
    # Step 2: Reshape into digraphs/trigraphs
    cipher_vector = np.array(cipher_matrix).reshape(-1, n)
    steps.append(f"2. Reshaped into digraphs/trigraphs: {cipher_vector.tolist()}")
    
    # Step 3: Compute inverse of key matrix
    key_matrix = np.array(key)
    det = int(np.round(np.linalg.det(key_matrix)))
    det_inv = pow(det, -1, 26)
    adjugate = (det_inv * np.round(np.linalg.inv(key_matrix)) * det) % 26
    key_inverse = adjugate.astype(int)
    steps.append(f"3. Computed inverse of key matrix: {key_inverse.tolist()}")
    
    # Step 4: Multiply by inverse key matrix
    decrypted_vector = np.dot(cipher_vector, key_inverse) % 26
    steps.append(f"4. Multiplied by inverse key matrix: {decrypted_vector.tolist()}")
    
    # Step 5: Flatten and convert to text
    decrypted_matrix = decrypted_vector.flatten()
    result = matrix_to_text(decrypted_matrix)
    steps.append(f"5. Flattened and converted to text: {result}")
    
    return result, steps

def is_valid_key(key):
    try:
        key_matrix = np.array(key)
        det = int(np.round(np.linalg.det(key_matrix)))
        return np.gcd(det, 26) == 1
    except:
        return False