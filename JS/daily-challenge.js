/* =========================================================
   DAILY CHALLENGE
   Stand Out
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       CONFIG
    ===================================================== */

    const STORAGE_KEY =
        "standout_daily_challenge";


    const REWARD =
        3;


    /* =====================================================
       CHALLENGE POOL
    ===================================================== */

    const CHALLENGES = [

    "Do 20 pushups.",

    "Write down 5 things you're grateful for.",

    "Read 10 pages of a book.",

    "Drink 2 liters of water today.",

    "Work for 25 minutes without checking your phone.",

    "Walk for 30 minutes.",

    "Write down your thoughts in 500 words.",

    "Don't drink any sugary beverages today.",

    "Meditate for 10 minutes.",

    "Clean your room for 20 minutes.",

    "Learn 10 new words.",

    "Do 30 squats.",

    "Call or message someone you care about.",

    "Read for 30 minutes without checking your phone.",

    "Spend 20 minutes organizing your workspace.",

    "Don't eat processed food today.",

    "Hold a plank for 60 seconds.",

    "Write down 3 things that made you happy today.",

    "Spend 30 minutes doing something creative.",

    "Take at least 5,000 steps today.",

    "Plan tomorrow before going to sleep.",

    "Go outside and spend 20 minutes in fresh air.",

    "Read one complete chapter of a book.",

    "Do 50 jumping jacks.",

    "Keep your phone away for 2 hours.",

    "Write a 200-word summary of what you read today.",

    "Spend 15 minutes sitting quietly without your phone.",

    "Complete one important task before opening social media.",

    "Eat at least two servings of fruit today.",

    "Do 20 lunges.",

    "Spend 30 minutes learning something new.",

    "Compliment someone sincerely.",

    "Write down your top 3 priorities for today.",

    "Stretch for 15 minutes.",

    "Don't eat junk food today.",

    "Take 20 slow, deep breaths.",

    "Write down 5 interesting things you learned today.",

    "Spend 20 minutes outside without using your phone.",

    "Do a 15-minute full-body workout.",

    "Write down everything you need to accomplish tomorrow.",

    "Spend 30 minutes reading instead of scrolling.",

    "Organize one drawer, shelf, or cupboard.",

    "Teach someone one thing you learned recently.",

    "Keep your phone away while working for 60 minutes.",

    "Spend 20 minutes doing any physical activity.",

    "Write down 10 things you want to experience in your lifetime.",

    "Turn off unnecessary notifications for the day.",

    "Go one full day without ordering junk food.",

    "Write down one thing you learned from a recent mistake.",

    "Spend 10 minutes focusing only on your breathing.",

    "Read for 20 minutes before going to sleep.",

    "Spend 30 minutes without using any screens.",

    "Take 5 photographs of interesting things around you.",

    "Write down 5 things you appreciate about your life.",

    "Spend 20 minutes organizing your digital files.",

    "Go one hour without social media.",

    "Spend 30 minutes on a hobby.",

    "Do something kind for someone today.",

    "Eat one meal without using your phone.",

    "Write 500 words about something you're interested in."

];


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const card =
        document.getElementById(
            "dailyChallenge"
        );

    const text =
        document.getElementById(
            "dailyChallengeText"
        );

    const button =
        document.getElementById(
            "dailyChallengeComplete"
        );


    if (
        !card ||
        !text ||
        !button
    ) {

        console.warn(
            "Daily Challenge: UI elements missing."
        );

        return;

    }


    /* =====================================================
       DATE
       Uses your existing IST date helper when available.
    ===================================================== */

    function getToday() {

        if (
            typeof getTodayKey ===
            "function"
        ) {

            return getTodayKey();

        }


        return new Date()
            .toLocaleDateString(
                "en-CA",
                {
                    timeZone:
                        "Asia/Kolkata"
                }
            );

    }


    /* =====================================================
       CREATE DETERMINISTIC CHALLENGE
    ===================================================== */

    function getChallengeIndex(dateString) {

        let hash = 0;


        for (
            let i = 0;
            i < dateString.length;
            i++
        ) {

            hash =
                (
                    (
                        hash << 5
                    ) -
                    hash
                ) +
                dateString.charCodeAt(i);

            hash |= 0;

        }


        return Math.abs(hash)
            % CHALLENGES.length;

    }


    /* =====================================================
       LOAD STATE
    ===================================================== */

    function loadState() {

        const today =
            getToday();


        let state = null;


        try {

            state =
                JSON.parse(
                    localStorage.getItem(
                        STORAGE_KEY
                    )
                );

        } catch {

            state = null;

        }


        /*
         * New day.
         */

        if (
            !state ||
            state.date !== today
        ) {

            state = {

                date:
                    today,

                challenge:
                    CHALLENGES[
                    getChallengeIndex(
                        today
                    )
                    ],

                completed:
                    false

            };


            saveState(
                state
            );

        }


        return state;

    }


    /* =====================================================
       SAVE STATE
    ===================================================== */

    function saveState(state) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    }


    /* =====================================================
       RENDER
    ===================================================== */

    function render() {

        const state =
            loadState();


        text.textContent =
            state.challenge;


        if (
            state.completed
        ) {

            card.classList.add(
                "completed"
            );


            button.textContent =
                "✓ Completed";


            button.disabled =
                true;


        } else {

            card.classList.remove(
                "completed"
            );


            button.textContent =
                "Complete";


            button.disabled =
                false;

        }

    }

    /* =========================================================
   RECORD DAILY CHALLENGE ACTIVITY
========================================================= */

    function recordDailyChallenge() {

        const today = getToday();

        /*
         * Load existing mission history.
         */
        let history = {};

        try {

            history = JSON.parse(
                localStorage.getItem("missionHistory") || "{}"
            );

        } catch {

            history = {};

        }


        /*
         * Create today's history bucket
         * if it doesn't exist.
         */
        if (!history[today]) {

            history[today] = {
                completed: 0,
                missed: 0,
                pointsDelta: 0,
                events: []
            };

        }


        /*
         * Unique Daily Challenge event.
         *
         * Prevents duplicate entries if
         * something accidentally calls this twice.
         */
        const eventKey =
            `daily-challenge|${today}`;


        const alreadyRecorded =
            history[today].events.some(
                event =>
                    event.key === eventKey
            );


        if (alreadyRecorded) {
            return;
        }


        /*
         * Record the activity.
         */
        history[today].events.push({

            key:
                eventKey,

            missionId:
                "daily-challenge",

            mission:
                "Daily Challenge",

            type:
                "daily-challenge",

            status:
                "completed",

            pointsDelta:
                1,

            timestamp:
                new Date().toISOString()

        });


        /*
         * Count it as a completed activity.
         */
        history[today].completed++;


        /*
         * Add the Daily Challenge
         * reward to the day's history.
         */
        history[today].pointsDelta +=
            1;


        /*
         * Save.
         */
        localStorage.setItem(
            "missionHistory",
            JSON.stringify(history)
        );


        /*
         * Keep the app's in-memory
         * history synchronized too.
         */
        if (
            typeof missionHistory !==
            "undefined"
        ) {

            missionHistory =
                history;

        }

    }

    /* =====================================================
       REWARD
    ===================================================== */

    function awardReward() {

        /*
         * Improvement Points
         */
        completedMissions++;
        checkMissionAchievements();

        completedMissions =
            Math.max(
                0,
                Number(completedMissions) || 0
            );


        /*
         * Daily activity count
         */
        dailyImprovementCount++;


        /*
         * Save IP
         */
        localStorage.setItem(
            "completedMissions",
            completedMissions
        );


        /*
         * Save daily activity
         */
        localStorage.setItem(
            "dailyImprovementCount",
            dailyImprovementCount
        );


        /*
         * Update visible IP counter
         */
        const counter =
            document.getElementById(
                "missionCounter"
            );

        if (counter) {

            counter.textContent =
                completedMissions;

        }


        /*
         * Record in mission history.
         */
        recordDailyChallenge();

        /* =====================================================
   ACHIEVEMENTS
===================================================== */

        if (
            typeof checkMissionAchievements ===
            "function"
        ) {

            checkMissionAchievements();

        }


        /*
         * Refresh marketplace.
         */
        if (
            typeof renderMarketplace ===
            "function"
        ) {

            renderMarketplace(
                window.currentMarketplaceFilter ||
                "ALL"
            );

        }


        /*
         * Refresh Momentum.
         */
        if (
            window.Momentum &&
            typeof window.Momentum.registerProof === "function"
        ) {
            window.Momentum.registerProof();
        }

        /* =====================================================
   SEASON XP
===================================================== */

        if (
            window.StandOutSeason &&
            typeof window.StandOutSeason.addXP === "function"
        ) {

            window.StandOutSeason.addXP(
                25,
                "Daily Challenge"
            );

        }


        /*
         * Save application state.
         */
        if (
            typeof saveData ===
            "function"
        ) {

            saveData();

        }

    }

    /* =====================================================
       COMPLETE
    ===================================================== */

    function completeChallenge() {

        const state = loadState();

        /*
         * Prevent double reward.
         */
        if (state.completed) {
            return;
        }

        customConfirm(
            "Did you honestly complete today's challenge? No cheating. This is your word.",
            () => {

                awardReward();

                state.completed = true;

                saveState(state);

                render();

                if (typeof customAlert === "function") {
                    customAlert(
                        "Challenge conquered. +1 Improvement Points."
                    );
                }

            }
        );
    }

    /* =====================================================
       EVENT
    ===================================================== */

    button.addEventListener(
        "click",
        completeChallenge
    );


    /* =====================================================
   INITIALIZE
===================================================== */

/*
 * Expose Daily Challenge refresh to the main app.
 * This allows the challenge to be initialized whenever
 * the application itself initializes.
 */
window.refreshDailyChallenge = render;


/*
 * Initial render.
 *
 * If this script loads after the DOM is ready,
 * render immediately. Otherwise wait for DOMContentLoaded.
 */
if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        render,
        { once: true }
    );

} else {

    render();

}


})();
