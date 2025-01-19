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

export { resetScore , fetchLeaderboard, submitScore};
