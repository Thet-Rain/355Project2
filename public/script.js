const scoreBox = document.getElementById('score-box');
        const questionElement = document.getElementById('question');
        const choicesElement = document.getElementById('choices');
        const resultElement = document.getElementById('result');
        const nextButton = document.getElementById('next');
        const trackerBox = document.getElementById('tracker-box');
        const startButton = document.getElementById('start-button');
        const quizContainer = document.getElementById('quiz-container');

        let currentQuestionId = null; // Track current question ID
        let isAnswered = false; // Track if the question has been answered
        let questionCount = 0; // Track number of questions asked
        const maxQuestions = 10; // Maximum number of questions
        
        function startQuiz() {
            startButton.style.display = 'none';
            quizContainer.style.display = 'block';
            trackerBox.style.display = 'flex';
            resetScore();
            loadQuestion();
        }

        async function loadQuestion() {
            isAnswered = false;
            resultElement.textContent = '';
            nextButton.style.display = 'none';
            choicesElement.innerHTML = '';

            try {
                const response = await fetch('http://localhost:3000/api/questions');
                const questionData = await response.json();

                questionElement.textContent = questionData.question;
                currentQuestionId = questionData.id;

                // Create buttons for each choice
                for (const [key, value] of Object.entries(questionData.choices)) {
                    const button = document.createElement('button');
                    button.className = 'choice';
                    button.textContent = `${key}: ${value}`;
                    button.onclick = () => submitAnswer(key);
                    choicesElement.appendChild(button);
                }
            } catch (error) {
                questionElement.textContent = 'Error loading question. Please try again.';
            }
        }

        async function submitAnswer(answer) {
            if (isAnswered) return; // Prevent multiple answers
            isAnswered = true; // Mark the question as answered

            // Disable all buttons
            const allButtons = document.querySelectorAll('.choice');
            allButtons.forEach((btn) => btn.classList.add('disabled'));

            try {
                const response = await fetch('http://localhost:3000/api/questions/answer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ questionId: currentQuestionId, answer }),
                });
                const result = await response.json();
                // Update tracker with green or red circle
                const circle = document.createElement('div');
                circle.classList.add('circle', result.correct ? 'correct' : 'wrong');
                trackerBox.appendChild(circle);

                if (result.correct) {
                    resultElement.textContent = 'Correct! 🎉';
                    resultElement.style.color = 'green';
                } else {
                    resultElement.textContent = 'Wrong! ❌';
                    resultElement.style.color = 'red';
                }
                

                scoreBox.textContent = `Score: ${result.score}`;
                nextQuestion(); //go to next questin
            } catch (error) {
                resultElement.textContent = 'Error submitting answer. Please try again.';
                resultElement.style.color = 'red';
            }
        }

        function nextQuestion() {
            if (questionCount >= maxQuestions-1) {
                endGame();
            } else {
                questionCount++;
                console.log(questionCount);
                loadQuestion();
            }
        }

       function endGame() {
            
                // Reset the score on the server
                resetScore();

                // Display game over message
                questionElement.textContent = "Game Over! Thank you for playing.";
                choicesElement.innerHTML = '';
                resultElement.textContent = `Your final score is ${scoreBox.textContent.split(': ')[1]}! 🎉`;
                nextButton.style.display = 'none';
                scoreBox.style.display = 'none';

                // Display name submission form
                const submitContainer = document.createElement('div');
                submitContainer.className = 'submit-container';

                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.placeholder = 'Enter your name';
                nameInput.id = 'name-input';

                const submitButton = document.createElement('button');
                submitButton.textContent = 'Submit Score';
                submitButton.onclick = () => submitScore(nameInput.value);

                submitContainer.appendChild(nameInput);
                submitContainer.appendChild(submitButton);

                resultElement.appendChild(submitContainer);

                // Show leaderboard
                fetchLeaderboard();
                

                // Reset score display
                scoreBox.textContent = "Score: 0";
            
        }

        async function submitScore(name) {
            if (!name) {
                alert('Please enter your name to submit your score.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/questions/leaderboard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name }),
                });

                const result = await response.json();
                alert(result.message);

                // Refresh leaderboard
                fetchLeaderboard();
                const submitContainer = document.getElementsByClassName('submit-container');
                // submitContainer.style.display('none');
            } catch (error) {
                alert('Error submitting score. Please try again.');
            }

            


        }

        async function fetchLeaderboard() {
            try {
                const response = await fetch('http://localhost:3000/api/questions/leaderboard');
                const leaderboard = await response.json();

                const leaderboardContainer = document.getElementById('leaderboard-container');
                const leaderboardList = document.getElementById('leaderboard-list');
                leaderboardList.innerHTML = '';

                leaderboard.forEach((entry) => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${entry.name} - ${entry.score}`;
                    leaderboardList.appendChild(listItem);
                });

                leaderboardContainer.style.display = 'block';
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            }
        }

        async function resetScore() {
            try {
                // Reset the score on the server
                await fetch('http://localhost:3000/api/questions/reset', { method: 'POST' });

            } catch (error) {
                resultElement.textContent = 'Error resetting score. Please try again.';
                resultElement.style.color = 'red';
            }
        }
