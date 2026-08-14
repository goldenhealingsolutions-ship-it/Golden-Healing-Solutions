/**
 * Golden Healing Academy & GH Job Board
 * Unified Local State Management Engine
 */

// Default Initial State
const DEFAULT_GHA_STATE = {
    user: {
        id: "GHA-8092",
        name: "Jane Doe",
        email: "jane.doe@example.com",
        xp: 1250,
        level: 2,
        streakDays: 6,
        badges: ["first_steps", "code_builder"]
    },
    progress: {
        currentModuleId: "mod_01",
        completedLessons: ["les_1_1"],
        unlockedModules: ["mod_01"], // "mod_02" unlocks after Boss Battle
        quizScores: {
            "les_1_1_video": 100
        },
        weakAreas: [],
        savedNotes: "Key Concept: Semantic HTML tags improve accessibility and SEO structure."
    },
    applications: [
        { date: "Aug 10, 2026", position: "Junior Web Developer", company: "TechFlow Digital", stage: "Interview Scheduled" },
        { date: "Aug 12, 2026", position: "Frontend QA Engineer", company: "Elevate Media", stage: "In Candidate Review" }
    ]
};

// Activity XP Rewards Schedule
const XP_SCHEDULE = {
    WATCH_VIDEO: 50,
    VIDEO_QUIZ: 100,
    PRACTICE_EXERCISE: 100,
    SANDBOX_RUN: 150,
    LAB_SUBMIT: 500,
    LAB_QUIZ: 250,
    BOSS_BATTLE: 500
};

// State Accessors
function getGHAState() {
    const data = localStorage.getItem('GHA_Master_State');
    if (!data) {
        localStorage.setItem('GHA_Master_State', JSON.stringify(DEFAULT_GHA_STATE));
        return DEFAULT_GHA_STATE;
    }
    return JSON.parse(data);
}

function saveGHAState(state) {
    localStorage.setItem('GHA_Master_State', JSON.stringify(state));
    syncUI();
}

// Award XP & Check Level Up
function awardXP(amount, activityName) {
    let state = getGHAState();
    state.user.xp += amount;

    // Calculate Level: 1 Level for every 1000 XP
    const calculatedLevel = Math.floor(state.user.xp / 1000) + 1;
    let leveledUp = false;

    if (calculatedLevel > state.user.level) {
        state.user.level = calculatedLevel;
        leveledUp = true;
    }

    saveGHAState(state);

    if (leveledUp) {
        alert(`🎉 LEVEL UP! You reached Level ${state.user.level}!\n+${amount} XP earned for ${activityName}.`);
    } else {
        alert(`⭐ +${amount} XP Earned for ${activityName}! Total XP: ${state.user.xp}`);
    }
}

// Submit Job Application Logic
function recordJobApplication(position, company) {
    let state = getGHAState();
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    state.applications.unshift({
        date: today,
        position: position,
        company: company,
        stage: "Submitted"
    });

    saveGHAState(state);
    awardXP(100, `Applying for ${position} at ${company}`);
}

// Sync UI Elements Across Pages
function syncUI() {
    const state = getGHAState();

    // Sync Gamification HUD (if present)
    const hudLevel = document.getElementById('hudLevel');
    const hudXpText = document.getElementById('hudXpText');
    const hudXpBar = document.getElementById('hudXpBar');

    if (hudLevel) hudLevel.innerText = `Level ${state.user.level}`;
    if (hudXpText) {
        const nextLevelXp = state.user.level * 1000;
        const currentLevelProgress = state.user.xp % 1000;
        hudXpText.innerText = `${state.user.xp} XP (${currentLevelProgress}/1000 to Level ${state.user.level + 1})`;
        if (hudXpBar) {
            hudXpBar.style.width = `${(currentLevelProgress / 1000) * 100}%`;
        }
    }

    // Sync Application Tracker Table (if on profile page)
    const appTableBody = document.querySelector('#applicationsTable tbody');
    if (appTableBody) {
        appTableBody.innerHTML = state.applications.map(app => {
            let badgeClass = "status-submitted";
            if (app.stage.includes("Interview")) badgeClass = "status-interview";
            if (app.stage.includes("Review")) badgeClass = "status-review";

            return `
                <tr>
                    <td>${app.date}</td>
                    <td>${app.position}</td>
                    <td>${app.company}</td>
                    <td><span class="status-pill ${badgeClass}">${app.stage}</span></td>
                </tr>
            `;
        }).join('');
    }
}

// Execute on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    syncUI();
});