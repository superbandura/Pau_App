// Function to show a specific page by loading its HTML content
async function showPage(pageId) {
    const appContainer = document.getElementById('app-container');
    try {
        const response = await fetch(`${pageId}.html`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const htmlContent = await response.text();
        appContainer.innerHTML = htmlContent;
        window.scrollTo(0, 0); // Scroll to top when changing page

        // Update page number display after content is loaded
        updatePageNumber(pageId);

        // Specific initialization for each page type after content is loaded
        if (pageId === 'page1') {
            document.querySelectorAll('#page1 .flashcard').forEach(flashcard => {
                adjustFlashcardHeight(flashcard);
            });
        } else if (pageId === 'page3') {
            showContent('page3', 'content1_p3', document.querySelector('#page3 .content-button:first-child'));
        } else if (pageId === 'page5') {
            showContent('page5', 'content1_p5_study', document.querySelector('#page5 .content-button:first-child'));
        } else if (pageId === 'page7') {
            showContent('page7', 'content1_p7_study', document.querySelector('#page7 .content-button:first-child'));
        }

    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading page:', error);
        appContainer.innerHTML = `<p class="text-red-500 text-center">Error al cargar la página: ${pageId}.html</p>`;
    }
}

// Function to update the page number display
function updatePageNumber(pageId) {
    const pageNumberMap = {
        'page1': '1/8',
        'page2': '2/8',
        'page3': '3/8',
        'page4': '4/8',
        'page5': '5/8',
        'page6': '6/8',
        'page7': '7/8',
        'page8': '8/8'
    };
    const currentPageNumberElement = document.getElementById(`page-number-${pageId.replace('page', '')}`);
    if (currentPageNumberElement) {
        currentPageNumberElement.textContent = pageNumberMap[pageId];
    }
}

// Function to handle showing/hiding content sections on study pages (Page 3, Page 5, Page 7)
function showContent(pageId, contentId, clickedButton) {
    // Validar parámetros
    if (!pageId || !contentId) {
        // eslint-disable-next-line no-console
        console.error('Se requieren pageId y contentId');
        return;
    }

    // Obtener el contenedor de la página actual
    const currentPageContainer = document.getElementById(pageId);
    if (!currentPageContainer) {
        // Si el contenedor no existe, retorna silenciosamente
        return;
    }

    try {
        // Ocultar todas las secciones de contenido
        const contentSections = currentPageContainer.querySelectorAll('.content-section');
        if (contentSections.length === 0) {
            // eslint-disable-next-line no-console
            console.warn(`No se encontraron secciones de contenido en ${pageId}`);
        } else {
            contentSections.forEach(section => {
                section.classList.remove('active');
                section.setAttribute('aria-hidden', 'true');
            });
        }

        // Actualizar estado de los botones
        const contentButtons = currentPageContainer.querySelectorAll('.content-button');
        if (contentButtons.length === 0) {
            // eslint-disable-next-line no-console
            console.warn(`No se encontraron botones de contenido en ${pageId}`);
        } else {
            contentButtons.forEach(button => {
                if (button) {
                    button.classList.remove('active');
                    button.setAttribute('aria-expanded', 'false');
                    button.setAttribute('aria-selected', 'false');
                }
            });
        }

        // Mostrar la sección de contenido seleccionada
        const targetContent = document.getElementById(contentId);
        if (!targetContent) {
            // eslint-disable-next-line no-console
            console.error(`No se encontró la sección de contenido con ID: ${contentId}`);
            return;
        }

        targetContent.classList.add('active');
        targetContent.setAttribute('aria-hidden', 'false');
        targetContent.focus(); // Para mejorar la accesibilidad

        // Actualizar el botón seleccionado
        if (clickedButton) {
            clickedButton.classList.add('active');
            clickedButton.setAttribute('aria-expanded', 'true');
            clickedButton.setAttribute('aria-selected', 'true');
        }

        // Desplazarse suavemente a la parte superior del contenido
        window.scrollTo({
            top: currentPageContainer.offsetTop - 20,
            behavior: 'smooth'
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error al mostrar el contenido:', error);
    }
}

// Function to adjust flashcard height based on content (for Page 1 only)
function adjustFlashcardHeight(flashcard) {
    if (!flashcard) {
        // eslint-disable-next-line no-console
        console.warn('No se proporcionó una flashcard para ajustar');
        return;
    }

    const front = flashcard.querySelector('.flashcard-front');
    const back = flashcard.querySelector('.flashcard-back');

    if (!front || !back) {
        // eslint-disable-next-line no-console
        console.warn('No se encontraron las caras de la flashcard');
        return;
    }

    try {
        // Almacenar estilos originales
        const originalStyles = {
            front: {
                position: front.style.position,
                visibility: front.style.visibility,
                height: front.style.height
            },
            back: {
                position: back.style.position,
                visibility: back.style.visibility,
                transform: back.style.transform,
                height: back.style.height
            },
            flashcard: {
                height: flashcard.style.height
            }
        };

        // Hacer que ambas caras sean visibles y medibles temporalmente
        front.style.position = 'absolute';
        front.style.visibility = 'visible';
        front.style.height = 'auto';
        
        back.style.position = 'absolute';
        back.style.visibility = 'visible';
        back.style.transform = 'none';
        back.style.height = 'auto';

        // Forzar el cálculo del layout
        void front.offsetHeight; // Trigger reflow
        
        // Obtener alturas
        const frontHeight = front.scrollHeight;
        const backHeight = back.scrollHeight;
        const maxHeight = Math.max(frontHeight, backHeight);
        
        // Aplicar la altura máxima más el padding (20px arriba + 20px abajo)
        const totalHeight = maxHeight + 40;
        flashcard.style.height = `${totalHeight}px`;
        front.style.height = `${totalHeight}px`;
        back.style.height = `${totalHeight}px`;

        // Restaurar estilos originales
        Object.assign(front.style, originalStyles.front);
        Object.assign(back.style, originalStyles.back);
        
        // Asegurar que solo la cara frontal sea visible inicialmente
        front.style.visibility = 'visible';
        back.style.visibility = 'hidden';
        
        // Añadir atributos ARIA para accesibilidad
        flashcard.setAttribute('role', 'button');
        flashcard.setAttribute('aria-pressed', 'false');
        flashcard.setAttribute('tabindex', '0');
        
        // Manejar clics para girar la tarjeta
        const toggleCard = () => {
            const isFlipped = flashcard.classList.toggle('flipped');
            flashcard.setAttribute('aria-pressed', isFlipped.toString());
            front.style.visibility = isFlipped ? 'hidden' : 'visible';
            back.style.visibility = isFlipped ? 'visible' : 'hidden';
        };
        
        // Eliminar event listeners anteriores para evitar duplicados
        flashcard.removeEventListener('click', toggleCard);
        flashcard.addEventListener('click', toggleCard);
        
        // Manejar teclado para accesibilidad
        flashcard.removeEventListener('keydown', handleFlashcardKeyPress);
        flashcard.addEventListener('keydown', handleFlashcardKeyPress);
        
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error al ajustar la altura de la flashcard:', error);
    }
}

// Función auxiliar para manejar eventos de teclado en las flashcards
function handleFlashcardKeyPress(event) {
    // Permitir la activación con Espacio o Enter
    if (event.key === ' ' || event.key === 'Enter' || event.key === 'Spacebar') {
        event.preventDefault();
        this.click(); // Activar el mismo comportamiento que el clic
    }
}

// Function to check answers for quizzes
// eslint-disable-next-line no-unused-vars
function checkAnswers(formId) {
    // Validar que el formulario existe
    const form = document.getElementById(formId);
    if (!form) {
        // eslint-disable-next-line no-console
        console.error(`Form with ID ${formId} not found.`);
        return;
    }

    // Definir las respuestas correctas para cada formulario
    const correctAnswers = {
        'quizForm1': {
            q1: 'b', q2: 'c', q3: 'd', q4: 'c', q5: 'b',
            q6: 'true', q7: 'true', q8: 'false', q9: 'true', q10: 'false'
        },
        'quizForm2': {
            q1_p4: 'b', q2_p4: 'c', q3_p4: 'c', q4_p4: 'c', q5_p4: 'c'
        },
        'quizForm4': {
            q1_p6: 'b', q2_p6: 'd', q3_p6: 'd', q4_p6: 'b', q5_p6: 'b'
        },
        'quizForm5': {
            q1_p8: 'd', q2_p8: 'c', q3_p8: 'd', q4_p8: 'd', q5_p8: 'd'
        }
    };

    // Obtener las respuestas correctas para este formulario
    const formAnswers = correctAnswers[formId];
    if (!formAnswers) {
        // eslint-disable-next-line no-console
        console.error(`No se encontraron respuestas para el formulario: ${formId}`);
        return;
    }

    let allCorrect = true;
    let questionsAnswered = 0;
    const totalQuestions = Object.keys(formAnswers).length;

    // Verificar cada pregunta
    for (const [questionName, correctAnswer] of Object.entries(formAnswers)) {
        const selectedOption = form.querySelector(`input[name="${questionName}"]:checked`);
        const feedbackElement = document.getElementById(`feedback-${questionName}`);

        if (!feedbackElement) {
            // eslint-disable-next-line no-console
            console.warn(`Elemento de retroalimentación no encontrado para: ${questionName}`);
            continue;
        }

        if (selectedOption) {
            questionsAnswered++;
            if (selectedOption.value === correctAnswer) {
                feedbackElement.textContent = '✅ Correcto';
                feedbackElement.className = 'feedback text-green-600 font-bold';
            } else {
                feedbackElement.textContent = `❌ Incorrecto. La respuesta correcta es: ${getCorrectOptionText(form, questionName, correctAnswer)}`;
                feedbackElement.className = 'feedback text-red-600 font-bold';
                allCorrect = false;
            }
        } else {
            feedbackElement.textContent = '⚠️ Por favor, selecciona una opción.';
            feedbackElement.className = 'feedback text-yellow-600 font-bold';
            allCorrect = false;
        }
    }

    // Mostrar resumen
    const summaryElement = document.getElementById('quiz-summary') || (() => {
        const summary = document.createElement('div');
        summary.id = 'quiz-summary';
        summary.className = 'mt-6 p-4 rounded-lg text-center text-lg font-bold';
        form.appendChild(summary);
        return summary;
    })();

    if (questionsAnswered < totalQuestions) {
        summaryElement.textContent = `Has respondido ${questionsAnswered} de ${totalQuestions} preguntas.`;
        summaryElement.className = 'mt-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg text-center text-lg font-bold';
    } else if (allCorrect) {
        summaryElement.textContent = '¡Excelente! Todas las respuestas son correctas. 🎉';
        summaryElement.className = 'mt-6 p-4 bg-green-100 text-green-800 rounded-lg text-center text-lg font-bold';
    } else {
        summaryElement.textContent = `Has respondido correctamente a ${questionsAnswered - countIncorrectAnswers(formId, formAnswers)} de ${totalQuestions} preguntas.`;
        summaryElement.className = 'mt-6 p-4 bg-blue-100 text-blue-800 rounded-lg text-center text-lg font-bold';
    }

    // Desplazarse al resumen
    summaryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Función auxiliar para contar respuestas incorrectas
function countIncorrectAnswers(formId, correctAnswers) {
    const form = document.getElementById(formId);
    if (!form) return 0;
    
    let incorrectCount = 0;
    
    for (const [questionName, correctAnswer] of Object.entries(correctAnswers)) {
        const selectedOption = form.querySelector(`input[name="${questionName}"]:checked`);
        if (selectedOption && selectedOption.value !== correctAnswer) {
            incorrectCount++;
        }
    }
    
    return incorrectCount;
}

// Helper function to get the text of the correct option for feedback
function getCorrectOptionText(form, questionName, correctValue) {
    if (!form) return `Opción ${correctValue.toUpperCase()}`;

    // Buscar la opción correcta en el formulario
    const correctOption = form.querySelector(`input[name="${questionName}"][value="${correctValue}"]`);
    if (!correctOption) return `Opción ${correctValue.toUpperCase()}`;

    // Buscar la etiqueta asociada a la opción
    let label;
    if (correctOption.id) {
        label = form.querySelector(`label[for="${correctOption.id}"]`);
    } else {
        // Si no tiene ID, buscar el label que lo contiene
        label = correctOption.closest('label') || 
                correctOption.parentElement.previousElementSibling;
    }

    if (label) {
        // Extraer solo el texto de la opción (sin el prefijo de letra)
        const labelText = label.textContent.trim();
        const match = labelText.match(/^[A-Za-z][).]?\s*(.+)/);
        return match ? match[1].trim() : labelText;
    }

    return `Opción ${correctValue.toUpperCase()}`;
}

// Initial page load
document.addEventListener('DOMContentLoaded', () => {
    showPage('page1'); // Load page1 content when the app starts
});
