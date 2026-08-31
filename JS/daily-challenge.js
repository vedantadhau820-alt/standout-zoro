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

        "Do 20 minutes of something you've been avoiding.",

        "Spend 20 minutes learning something useful.",

        "Finish one small task you've been postponing.",

        "Go 30 minutes without social media.",

        "Read 10 pages of a book.",

        "Work for 25 minutes without checking your phone.",

        "Clean or organize one thing you've been ignoring.",

        "Exercise for at least 15 minutes.",

        "Write down the three things that matter most today.",

        "Spend 20 minutes improving one skill.",

        "Complete a task before opening social media.",

        "Remove one unnecessary distraction from your environment.",

        "Start something you've been waiting for the perfect time to do.",

        "Spend 15 minutes planning tomorrow.",

        "Do one uncomfortable thing that moves you forward.",

        "Put your phone away and focus for 20 minutes.",

        "Finish something you started but never completed.",

        "Learn one thing you didn't know yesterday.",

        "Spend 15 minutes fixing something you've been ignoring.",

        "Take 20 minutes to work on your biggest current goal.",

        "Say no to one unnecessary distraction today.",

        "Wake up one small part of your environment by organizing it.",

        "Spend 20 minutes creating instead of consuming.",

        "Do the hardest small task on your list first.",

        "Take a proper break without touching your phone.",

        "Write down one thing you want to become better at.",

        "Spend 20 focused minutes on something that matters.",

        "Replace 20 minutes of scrolling with something productive.",

        "Do something today that your tomorrow-self will appreciate.",

        "Finish today's most important unfinished task."

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

    render();


})();
