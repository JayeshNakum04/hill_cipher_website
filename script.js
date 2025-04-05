   // Initialize the matrix inputs when the page loads
   document.addEventListener('DOMContentLoaded', function() {
    generateMatrixInputs();
});

// Function to open tabs
function openTab(evt, tabName) {
    var i, tabContent, tabButtons;
    
    // Hide all tab content
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    
    // Remove "active" class from all tab buttons
    tabButtons = document.getElementsByClassName("tab-button");
    for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }
    
    // Show the current tab and add "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Generate matrix input fields based on selected size
function generateMatrixInputs() {
    const matrixSize = parseInt(document.getElementById('matrix-size').value);
    const matrixInputs = document.getElementById('matrix-inputs');
    matrixInputs.innerHTML = '';
    
    for (let i = 0; i < matrixSize; i++) {
        const row = document.createElement('div');
        for (let j = 0; j < matrixSize; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'matrix-input';
            input.id = `matrix-${i}-${j}`;
            input.dataset.row = i;
            input.dataset.col = j;
            row.appendChild(input);
        }
        matrixInputs.appendChild(row);
    }
}

// Generate a random matrix
function generateRandomMatrix() {
    const matrixSize = parseInt(document.getElementById('matrix-size').value);
    const operation = document.getElementById('operation').value;
    const modulus = parseInt(document.getElementById('modulus').value);
    
    let matrix;
    if (operation === 'decrypt') {
        // For decryption, generate an invertible matrix
        do {
            matrix = generateRandomMatrixValues(matrixSize);
        } while (!isMatrixInvertible(matrix, modulus));
    } else {
        // For encryption, any matrix will do
        matrix = generateRandomMatrixValues(matrixSize);
    }
    
    // Fill the matrix inputs with the generated values
    for (let i = 0; i < matrixSize; i++) {
        for (let j = 0; j < matrixSize; j++) {
            document.getElementById(`matrix-${i}-${j}`).value = matrix[i][j];
        }
    }
    
    if (operation === 'decrypt') {
        const result = document.getElementById('result');
        result.style.display = 'block';
        result.innerHTML = '<span class="success">Generated a valid invertible matrix for decryption.</span>';
    }
}

// Generate random values for a matrix
function generateRandomMatrixValues(size) {
    const modulus = parseInt(document.getElementById('modulus').value);
    const matrix = [];
    
    for (let i = 0; i < size; i++) {
        matrix[i] = [];
        for (let j = 0; j < size; j++) {
            matrix[i][j] = Math.floor(Math.random() * modulus);
        }
    }
    
    return matrix;
}

// Check if matrix is invertible for the given modulus
function checkMatrixInvertibility() {
    const matrixSize = parseInt(document.getElementById('matrix-size').value);
    const modulus = parseInt(document.getElementById('modulus').value);
    const operation = document.getElementById('operation').value;
    
    // Get matrix values from inputs
    const matrix = [];
    for (let i = 0; i < matrixSize; i++) {
        matrix[i] = [];
        for (let j = 0; j < matrixSize; j++) {
            const inputValue = document.getElementById(`matrix-${i}-${j}`).value;
            matrix[i][j] = inputValue ? parseInt(inputValue) : 0;
        }
    }
    
    const result = document.getElementById('result');
    result.style.display = 'block';
    
    if (operation === 'decrypt') {
        if (isMatrixInvertible(matrix, modulus)) {
            result.innerHTML = '<span class="success">This matrix is valid for decryption!</span>';
            const inverseMatrix = findInverseMatrix(matrix, modulus);
            if (inverseMatrix) {
                let inverseMatrixHTML = '<p>Inverse Matrix (mod ' + modulus + '):</p><div class="matrix-display">';
                for (let i = 0; i < matrixSize; i++) {
                    for (let j = 0; j < matrixSize; j++) {
                        inverseMatrixHTML += `<span class="matrix-input">${inverseMatrix[i][j]}</span>`;
                    }
                    inverseMatrixHTML += '<br>';
                }
                inverseMatrixHTML += '</div>';
                result.innerHTML += inverseMatrixHTML;
            }
        } else {
            result.innerHTML = '<span class="error">This matrix is NOT valid for decryption because it is not invertible modulo ' + modulus + '.</span>';
            result.innerHTML += '<p>For a valid decryption matrix:</p>';
            result.innerHTML += '<ul>';
            result.innerHTML += '<li>The determinant must not be 0</li>';
            result.innerHTML += '<li>The determinant must be coprime with the modulus (gcd(det, modulus) = 1)</li>';
            result.innerHTML += '</ul>';
            result.innerHTML += '<p>Please use the "Generate Random Matrix" button or enter a different matrix.</p>';
        }
    } else {
        // For encryption, any matrix is valid (as long as it's not all zeros)
        const allZeros = matrix.every(row => row.every(val => val === 0));
        if (allZeros) {
            result.innerHTML = '<span class="error">A matrix of all zeros is not useful for encryption.</span>';
        } else {
            result.innerHTML = '<span class="success">Matrix is valid for encryption.</span>';
        }
    }
}

// Check if a matrix is invertible modulo m
function isMatrixInvertible(matrix, modulus) {
    const det = determinant(matrix);
    const detMod = ((det % modulus) + modulus) % modulus; // Ensure positive result
    
    // Matrix is invertible if determinant is not 0 and is coprime with modulus
    return detMod !== 0 && gcd(detMod, modulus) === 1;
}

// Calculate determinant of a matrix
function determinant(matrix) {
    const n = matrix.length;
    
    // Base case for 1x1 matrix
    if (n === 1) {
        return matrix[0][0];
    }
    
    // Base case for 2x2 matrix
    if (n === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }
    
    // For 3x3 matrix
    if (n === 3) {
        return matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
               matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
               matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
    }
    
    // For larger matrices (not needed for Hill cipher)
    let det = 0;
    for (let j = 0; j < n; j++) {
        det += Math.pow(-1, j) * matrix[0][j] * determinant(subMatrix(matrix, 0, j));
    }
    return det;
}

// Create submatrix by removing specified row and column
function subMatrix(matrix, row, col) {
    const n = matrix.length;
    const result = [];
    
    for (let i = 0; i < n; i++) {
        if (i !== row) {
            const newRow = [];
            for (let j = 0; j < n; j++) {
                if (j !== col) {
                    newRow.push(matrix[i][j]);
                }
            }
            result.push(newRow);
        }
    }
    
    return result;
}

// Calculate greatest common divisor using Euclidean algorithm
function gcd(a, b) {
    if (b === 0) {
        return a;
    }
    return gcd(b, a % b);
}

// Calculate modular multiplicative inverse
function modInverse(a, m) {
    // Ensure a is positive
    a = ((a % m) + m) % m;
    
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) {
            return x;
        }
    }
    return null; // No inverse exists
}

// Find inverse of a matrix modulo m
function findInverseMatrix(matrix, modulus) {
    const n = matrix.length;
    
    // Calculate determinant and its modular inverse
    const det = determinant(matrix);
    const detMod = ((det % modulus) + modulus) % modulus;
    const detInverse = modInverse(detMod, modulus);
    
    if (detInverse === null) {
        return null; // No inverse exists
    }
    
    // For 2x2 matrix
    if (n === 2) {
        const adjugate = [
            [matrix[1][1], -matrix[0][1]],
            [-matrix[1][0], matrix[0][0]]
        ];
        
        const inverse = [];
        for (let i = 0; i < n; i++) {
            inverse[i] = [];
            for (let j = 0; j < n; j++) {
                // Ensure positive result
                inverse[i][j] = ((adjugate[i][j] * detInverse) % modulus + modulus) % modulus;
            }
        }
        
        return inverse;
    }
    
    // For 3x3 matrix
    if (n === 3) {
        const cofactors = [
            [
                (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]),
                -(matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]),
                (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
            ],
            [
                -(matrix[0][1] * matrix[2][2] - matrix[0][2] * matrix[2][1]),
                (matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]),
                -(matrix[0][0] * matrix[2][1] - matrix[0][1] * matrix[2][0])
            ],
            [
                (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]),
                -(matrix[0][0] * matrix[1][2] - matrix[0][2] * matrix[1][0]),
                (matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0])
            ]
        ];
        
        // Transpose the cofactor matrix to get the adjugate
        const adjugate = [];
        for (let i = 0; i < n; i++) {
            adjugate[i] = [];
            for (let j = 0; j < n; j++) {
                adjugate[i][j] = cofactors[j][i];
            }
        }
        
        const inverse = [];
        for (let i = 0; i < n; i++) {
            inverse[i] = [];
            for (let j = 0; j < n; j++) {
                // Ensure positive result
                inverse[i][j] = ((adjugate[i][j] * detInverse) % modulus + modulus) % modulus;
            }
        }
        
        return inverse;
    }
    
    return null; // Only 2x2 and 3x3 matrices are supported
}

// Process Hill cipher encryption/decryption
function processHillCipher() {
    const matrixSize = parseInt(document.getElementById('matrix-size').value);
    const operation = document.getElementById('operation').value;
    const message = document.getElementById('message').value.toUpperCase().replace(/[^A-Z]/g, '');
    const modulus = parseInt(document.getElementById('modulus').value);
    
    if (!message) {
        alert("Please enter a message.");
        return;
    }
    
    // Get matrix values from inputs
    const matrix = [];
    for (let i = 0; i < matrixSize; i++) {
        matrix[i] = [];
        for (let j = 0; j < matrixSize; j++) {
            const inputValue = document.getElementById(`matrix-${i}-${j}`).value;
            matrix[i][j] = inputValue ? parseInt(inputValue) : 0;
        }
    }
    
    const result = document.getElementById('result');
    const steps = document.getElementById('steps');
    result.style.display = 'block';
    steps.style.display = 'block';
    
    let usedMatrix = matrix;
    let stepDetails = '';
    
    if (operation === 'decrypt') {
        if (!isMatrixInvertible(matrix, modulus)) {
            result.innerHTML = '<span class="error">Error: The matrix is not invertible modulo ' + modulus + '. Cannot perform decryption.</span>';
            steps.innerHTML = 'Please use the "Generate Random Matrix" button or enter a valid invertible matrix.';
            return;
        }
        
        usedMatrix = findInverseMatrix(matrix, modulus);
        stepDetails += '<h3>Step 1: Find the Inverse of the Key Matrix</h3>';
        stepDetails += '<p>For decryption, we need to use the inverse of the key matrix.</p>';
        
        stepDetails += '<p>Original Matrix:</p>';
        stepDetails += displayMatrix(matrix);
        
        stepDetails += '<p>Determinant = ' + determinant(matrix) + ' mod ' + modulus + ' = ' + ((determinant(matrix) % modulus + modulus) % modulus) + '</p>';
        
        stepDetails += '<p>Inverse Matrix:</p>';
        stepDetails += displayMatrix(usedMatrix);
    } else {
        stepDetails += '<h3>Step 1: Prepare the Key Matrix</h3>';
        stepDetails += '<p>For encryption, we use the provided key matrix directly.</p>';
        stepDetails += displayMatrix(matrix);
    }
    
    // Prepare the message by padding if necessary
    let paddedMessage = message;
    if (paddedMessage.length % matrixSize !== 0) {
        const paddingLength = matrixSize - (paddedMessage.length % matrixSize);
        paddedMessage += 'X'.repeat(paddingLength);
        
        stepDetails += '<h3>Step 2: Prepare the Message</h3>';
        stepDetails += `<p>Original message: ${message}</p>`;
        stepDetails += `<p>Message length (${message.length}) is not a multiple of the matrix size (${matrixSize}).</p>`;
        stepDetails += `<p>Added ${paddingLength} padding character(s) 'X' to make the message length a multiple of ${matrixSize}.</p>`;
        stepDetails += `<p>Padded message: ${paddedMessage}</p>`;
    } else {
        stepDetails += '<h3>Step 2: Prepare the Message</h3>';
        stepDetails += `<p>Message: ${message}</p>`;
        stepDetails += `<p>Message length (${message.length}) is already a multiple of the matrix size (${matrixSize}), so no padding needed.</p>`;
    }
    
    // Convert message to numeric values (A=0, B=1, ..., Z=25)
    const numericMessage = [];
    for (let i = 0; i < paddedMessage.length; i++) {
        numericMessage.push(paddedMessage.charCodeAt(i) - 65); // 'A' is ASCII 65
    }
    
    stepDetails += '<h3>Step 3: Convert Letters to Numbers</h3>';
    stepDetails += '<p>Using A=0, B=1, C=2, ..., Z=25:</p>';
    
    let conversionTable = '<table class="step-table"><tr><th>Letter</th>';
    for (let i = 0; i < paddedMessage.length; i++) {
        conversionTable += `<td>${paddedMessage[i]}</td>`;
    }
    conversionTable += '</tr><tr><th>Number</th>';
    for (let i = 0; i < numericMessage.length; i++) {
        conversionTable += `<td>${numericMessage[i]}</td>`;
    }
    conversionTable += '</tr></table>';
    
    stepDetails += conversionTable;
    
    // Divide the message into blocks
    const blocks = [];
    for (let i = 0; i < numericMessage.length; i += matrixSize) {
        blocks.push(numericMessage.slice(i, i + matrixSize));
    }
    
    stepDetails += '<h3>Step 4: Divide the Message into Blocks</h3>';
    stepDetails += `<p>Divide the message into blocks of size ${matrixSize}:</p>`;
    
    let blockDisplay = '';
    blocks.forEach((block, index) => {
        blockDisplay += `<p>Block ${index + 1}: [${block.join(', ')}]</p>`;
    });
    
    stepDetails += blockDisplay;
    
    // Process each block through the matrix
    const resultBlocks = [];
    stepDetails += `<h3>Step 5: ${operation === 'encrypt' ? 'Encrypt' : 'Decrypt'} Each Block</h3>`;
    
    blocks.forEach((block, blockIndex) => {
        const resultBlock = [];
        
        for (let i = 0; i < matrixSize; i++) {
            let sum = 0;
            for (let j = 0; j < matrixSize; j++) {
                sum += usedMatrix[i][j] * block[j];
            }
            resultBlock.push(((sum % modulus) + modulus) % modulus);
        }
        
        resultBlocks.push(resultBlock);
        
        stepDetails += `<p><strong>Block ${blockIndex + 1}:</strong></p>`;
        stepDetails += '<p>Matrix multiplication calculation:</p>';
        
        let calcDetails = '';
        for (let i = 0; i < matrixSize; i++) {
            calcDetails += `<p>Result[${i}] = `;
            for (let j = 0; j < matrixSize; j++) {
                if (j > 0) calcDetails += ' + ';
                calcDetails += `${usedMatrix[i][j]} × ${block[j]}`;
            }
            
            let sum = 0;
            for (let j = 0; j < matrixSize; j++) {
                sum += usedMatrix[i][j] * block[j];
            }
            
            calcDetails += ` = ${sum} mod ${modulus} = ${((sum % modulus) + modulus) % modulus}</p>`;
        }
        
        stepDetails += calcDetails;
        stepDetails += `<p>Result for Block ${blockIndex + 1}: [${resultBlock.join(', ')}]</p>`;
    });
    
    // Convert the numeric results back to letters
    const resultMessage = [];
    resultBlocks.forEach(block => {
        block.forEach(num => {
            resultMessage.push(String.fromCharCode((num % 26) + 65));
        });
    });
    
    stepDetails += '<h3>Step 6: Convert Numbers Back to Letters</h3>';
    stepDetails += '<p>Convert the resulting numbers back to letters (0=A, 1=B, ..., 25=Z):</p>';
    
    let resultConversionTable = '<table class="step-table"><tr><th>Number</th>';
    resultBlocks.forEach(block => {
        block.forEach(num => {
            resultConversionTable += `<td>${num}</td>`;
        });
    });
    resultConversionTable += '</tr><tr><th>Letter</th>';
    resultMessage.forEach(letter => {
        resultConversionTable += `<td>${letter}</td>`;
    });
    resultConversionTable += '</tr></table>';
    
    stepDetails += resultConversionTable;
    
    // Display the final result
    const finalResult = resultMessage.join('');
    result.innerHTML = `<h3>${operation === 'encrypt' ? 'Encrypted' : 'Decrypted'} Result:</h3>`;
    result.innerHTML += `<p class="success">${finalResult}</p>`;
    
    steps.innerHTML = stepDetails;
}

// Helper function to display matrix in HTML
function displayMatrix(matrix) {
    let html = '<div class="matrix-display">';
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            html += `<span class="matrix-input">${matrix[i][j]}</span>`;
        }
        html += '<br>';
    }
    html += '</div>';
    return html;
}