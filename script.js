document.addEventListener('DOMContentLoaded', () => {
    const articleContent = document.getElementById('article-content');
    const loadingElement = document.getElementById('loading');
    const nextButton = document.getElementById('next-article');
    const clickSound = document.getElementById('clickSound');

    // Flag to track if user has interacted with the page
    let hasUserInteracted = false;

    // Function to play click sound
    function playClickSound() {
        if (!hasUserInteracted) {
            console.log('Waiting for user interaction before playing sound...');
            return;
        }

        try {
            // Reset the audio to start
            clickSound.currentTime = 0;
            // Play the sound
            const playPromise = clickSound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Sound playback failed:', error);
                    // If autoplay was prevented, show a message to the user
                    if (error.name === 'NotAllowedError') {
                        alert('Пожалуйста, нажмите на страницу один раз, чтобы включить звук');
                    }
                });
            }
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    }

    // Add click listener to the whole document to enable sound
    document.addEventListener('click', () => {
        if (!hasUserInteracted) {
            hasUserInteracted = true;
            console.log('User interaction detected, sound enabled');
            // Try to play a silent sound to unlock audio
            clickSound.play().then(() => {
                clickSound.pause();
                clickSound.currentTime = 0;
            }).catch(error => {
                console.log('Initial sound unlock failed:', error);
            });
        }
    }, { once: true });

    async function fetchRandomArticle() {
        try {
            // Show loading state
            loadingElement.classList.remove('hidden');
            articleContent.innerHTML = '';

            // Get a random article from Russian Wikipedia
            const response = await fetch('https://ru.wikipedia.org/api/rest_v1/page/random/summary');
            const data = await response.json();

            // Create article content
            const articleHTML = `
                <h2>${data.title}</h2>
                <div class="article-image">
                    ${data.thumbnail ? `<img src="${data.thumbnail.source}" alt="${data.title}" style="max-width: 100%; height: auto; margin: 1rem 0;">` : ''}
                </div>
                <div class="article-extract">
                    ${data.extract_html}
                </div>
                <div class="article-link">
                    <a href="${data.content_urls.desktop.page}" target="_blank" rel="noopener noreferrer">
                        Читать полную статью на Википедии
                    </a>
                </div>
                <div class="keyboard-hint">
                    Нажмите ← для следующей статьи
                    ${!hasUserInteracted ? '<br><small>(Нажмите на страницу один раз, чтобы включить звук)</small>' : ''}
                </div>
            `;

            // Update the content
            articleContent.innerHTML = articleHTML;
        } catch (error) {
            articleContent.innerHTML = `
                <div class="error">
                    <p>Извините, произошла ошибка при загрузке статьи. Пожалуйста, попробуйте снова.</p>
                    <p>Ошибка: ${error.message}</p>
                </div>
            `;
        } finally {
            // Hide loading state
            loadingElement.classList.add('hidden');
        }
    }

    // Function to handle next article navigation
    function handleNextArticle() {
        // Play click sound
        playClickSound();
        // Add a small visual feedback
        nextButton.classList.add('active');
        setTimeout(() => nextButton.classList.remove('active'), 200);
        fetchRandomArticle();
    }

    // Load first article when page loads
    fetchRandomArticle();

    // Add click handler for the next article button
    nextButton.addEventListener('click', handleNextArticle);

    // Add keyboard navigation
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            handleNextArticle();
        }
    });
}); 