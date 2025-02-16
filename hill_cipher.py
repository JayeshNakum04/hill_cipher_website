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
    message_matrix = text_to_matrix(message, n)
    message_vector = np.array(message_matrix).reshape(-1, n)
    key_matrix = np.array(key)
    encrypted_vector = np.dot(message_vector, key_matrix) % 26
    encrypted_matrix = encrypted_vector.flatten()
    return matrix_to_text(encrypted_matrix)

def decrypt(ciphertext, key):
    n = len(key)
    key_matrix = np.array(key)
    det = int(np.round(np.linalg.det(key_matrix)))
    det_inv = pow(det, -1, 26)
    adjugate = (det_inv * np.round(np.linalg.inv(key_matrix)) * det) % 26
    key_inverse = adjugate.astype(int)
    cipher_matrix = text_to_matrix(ciphertext, n)
    cipher_vector = np.array(cipher_matrix).reshape(-1, n)
    decrypted_vector = np.dot(cipher_vector, key_inverse) % 26
    decrypted_matrix = decrypted_vector.flatten()
    return matrix_to_text(decrypted_matrix)

def is_valid_key(key):
    try:
        key_matrix = np.array(key)
        det = int(np.round(np.linalg.det(key_matrix)))
        return np.gcd(det, 26) == 1
    except:
        return False