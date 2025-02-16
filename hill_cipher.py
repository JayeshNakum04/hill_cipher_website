import numpy as np
import random

def text_to_matrix(text, n):
    text = text.upper().replace(" ", "")
    padding_length = (n - len(text) % n) % n
    text += 'X' * padding_length  # Padding with 'X' to match key matrix size
    return [ord(char) - ord('A') for char in text]

def matrix_to_text(matrix):
    return ''.join([chr(int(val) % 26 + ord('A')) for val in matrix])

def encrypt(plaintext, key):
    n = len(key)
    steps = []  # Store encryption steps

    # Convert text to number matrix
    text_matrix = text_to_matrix(plaintext, n)
    text_vector = np.array(text_matrix).reshape(-1, n)

    # Convert key to matrix
    key_matrix = np.array(key)

    # Encryption process
    encrypted_vector = np.dot(text_vector, key_matrix) % 26
    encrypted_matrix = encrypted_vector.flatten()

    # Convert back to text
    result = matrix_to_text(encrypted_matrix)

    # Show encryption steps
    steps.append(f"Message: {plaintext}")
    steps.append(f"Key: {key}")

    steps.append("\nCipher matrix mapping:")
    for i, row in enumerate(text_vector):
        steps.append(f"{[chr(num + ord('A')) for num in row]} --> {list(row)}")

    steps.append("\nEncrypted matrix mapping:")
    for i, row in enumerate(encrypted_vector):
        steps.append(f"{list(row)} --> {''.join(chr(num + ord('A')) for num in row)}")

    steps.append(f"\nEncrypted text: {result}")

    return result, steps  # Always return both result and steps

def decrypt(ciphertext, key):
    n = len(key)
    steps = []  # Store decryption steps

    # Convert text to number matrix
    cipher_matrix = text_to_matrix(ciphertext, n)
    cipher_vector = np.array(cipher_matrix).reshape(-1, n)

    # Show letter-to-number mapping
    letter_pairs = [ciphertext[i:i+n] for i in range(0, len(ciphertext), n)]
    mapped_pairs = [
        f"[{pair}] --> {list(row)}" for pair, row in zip(letter_pairs, cipher_vector)
    ]
    steps.append("Cipher matrix mapping:\n" + "\n".join(mapped_pairs))

    # Compute determinant
    key_matrix = np.array(key)
    det = int(np.round(np.linalg.det(key_matrix)))
    steps.append(f"Determinant of key matrix: {det}")

    if np.gcd(det, 26) != 1:
        return "Invalid Key", steps  # Ensure 2 values are returned

    # Compute key inverse
    det_inv = pow(det, -1, 26)
    adjugate = (det_inv * np.round(np.linalg.inv(key_matrix)) * det) % 26
    key_inverse = adjugate.astype(int)
    steps.append(f"Key inverse matrix: {key_inverse}")

    # Decrypt message
    decrypted_vector = np.dot(cipher_vector, key_inverse) % 26

    # Show decryption step
    decrypted_pairs = [
        f"{list(row)} --> [{''.join(chr(num + ord('A')) for num in row)}]"
        for row in decrypted_vector
    ]
    steps.append("Decryption process:\n" + "\n".join(decrypted_pairs))

    # Convert numbers back to text
    decrypted_matrix = decrypted_vector.flatten()
    result = matrix_to_text(decrypted_matrix)
    steps.append(f"Decrypted text: {result}")

    return result, steps  # Now it returns two values


def is_valid_key(key):
    try:
        key_matrix = np.array(key)
        det = int(np.round(np.linalg.det(key_matrix)))
        return np.gcd(det, 26) == 1
    except:
        return False

def parse_key(key_str):
    try:
        key_values = list(map(int, key_str.split()))
        n = int(len(key_values) ** 0.5)
        if n * n != len(key_values):
            return None
        key_matrix = [key_values[i * n:(i + 1) * n] for i in range(n)]
        return key_matrix if is_valid_key(key_matrix) else None
    except:
        return None

def generate_valid_key(n):
    while True:
        key = [[random.randint(0, 25) for _ in range(n)] for _ in range(n)]
        if is_valid_key(key):
            return key
