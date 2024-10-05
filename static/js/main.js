document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('imageForm');
    const resultContainer = document.getElementById('resultContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const generatedImage = document.getElementById('generatedImage');
    const downloadBtn = document.getElementById('downloadBtn');

    // Create floating bubbles
    createBubbles();

    // Set up sliders
    setupSlider('widthSlider', 'widthValue');
    setupSlider('heightSlider', 'heightValue');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const prompt = document.getElementById('prompt').value;
        const aspectRatio = document.getElementById('aspectRatio').value;
        const safetyTolerance = document.getElementById('safetyTolerance').value;
        const seed = document.getElementById('seed').value;
        const width = document.getElementById('widthSlider').value;
        const height = document.getElementById('heightSlider').value;

        loadingIndicator.style.display = 'block';
        resultContainer.style.display = 'none';

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, aspectRatio, safetyTolerance, seed, width, height }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }

            const data = await response.json();
            generatedImage.src = data.image_url;
            resultContainer.style.display = 'block';
            downloadBtn.href = data.image_url;
            downloadBtn.download = 'generated_image.png';
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while generating the image. Please try again.');
        } finally {
            loadingIndicator.style.display = 'none';
        }
    });

    function createBubbles() {
        const bubbleCount = 10;
        const container = document.body;

        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            bubble.style.left = `${Math.random() * 100}vw`;
            bubble.style.top = `${Math.random() * 100}vh`;
            bubble.style.width = `${Math.random() * 100 + 50}px`;
            bubble.style.height = bubble.style.width;
            bubble.style.animationDuration = `${Math.random() * 5 + 5}s`;
            bubble.style.animationDelay = `${Math.random() * 5}s`;
            container.appendChild(bubble);
        }
    }

    function setupSlider(sliderId, valueId) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);

        slider.addEventListener('input', () => {
            valueDisplay.textContent = slider.value;
        });
    }

    // Add 3D transform effect to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            button.style.transform = `perspective(500px) rotateX(${deltaY * 10}deg) rotateY(${-deltaX * 10}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'none';
        });
    });
});
