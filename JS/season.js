/* =========================================================
   SEASON SYSTEM
   Season 01 — The Ascension
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       SEASON CONFIG
    ===================================================== */

    const SEASON = {

        id: "season-01",

        number: 1,

        name: "The Ascension",

        /*
         * TESTING START DATE
         * Change back to September 1 for production.
         */
        start: "2026-09-01T00:00:00+05:30",

        end: "2026-09-30T23:59:59+05:30",

        maxLevel: 20,

        xpPerLevel: 150,


        /* =================================================
           SEASON REWARDS
        ================================================= */

        rewards: {

            5: {
                type: "improvement-points",
                amount: 100,
                title: "100 Improvement Points"
            },

            10: {
                type: "improvement-points",
                amount: 200,
                title: "200 Improvement Points"
            },

            15: {
                type: "card",
                id: "season_01_card",
                title: "The Ascension"
            },

            20: {
                type: "exclusive-card",
                id: "season_01_exclusive_card",
                title: "Beyond Limits"
            }

        }

    };


    /* =====================================================
       STORAGE
    ===================================================== */

    const STORAGE_KEY =
        "standoutSeasonState";


    /* =====================================================
       DEFAULT STATE
    ===================================================== */

    function createDefaultState() {

        return {

            seasonId:
                SEASON.id,

            xp: 0,

            level: 1,

            completed: false,

            startedAt:
                SEASON.start,

            endedAt: null,

            rewards: {}

        };

    }


    /* =====================================================
       LOAD STATE
    ===================================================== */

    function loadState() {

        try {

            const stored =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!stored) {

                return createDefaultState();

            }

            const parsed =
                JSON.parse(stored);

            if (
                !parsed ||
                parsed.seasonId !== SEASON.id
            ) {

                return createDefaultState();

            }

            return {

                ...createDefaultState(),

                ...parsed,

                rewards:
                    parsed.rewards &&
                        typeof parsed.rewards === "object"
                        ? parsed.rewards
                        : {}

            };

        } catch (error) {

            console.warn(
                "Could not load Season state:",
                error
            );

            return createDefaultState();

        }

    }


    /* =====================================================
       SAVE STATE
    ===================================================== */

    function saveState(state) {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );

        } catch (error) {

            console.warn(
                "Could not save Season state:",
                error
            );

        }

    }


    /* =====================================================
       LEVEL CALCULATION
    ===================================================== */

    function calculateLevel(xp) {

        const safeXP =
            Math.max(
                0,
                Number(xp) || 0
            );

        const level =
            Math.floor(
                safeXP /
                SEASON.xpPerLevel
            ) + 1;

        return Math.min(
            SEASON.maxLevel,
            Math.max(1, level)
        );

    }


    /* =====================================================
       REWARD UNLOCK
    ===================================================== */

    function unlockSeasonRewards(
        state,
        oldLevel,
        newLevel
    ) {

        for (
            let level = oldLevel + 1;
            level <= newLevel;
            level++
        ) {

            const reward =
                SEASON.rewards[level];

            if (!reward) {
                continue;
            }


            /*
             * Already unlocked.
             */

            if (
                state.rewards[level] &&
                state.rewards[level].unlocked
            ) {

                continue;

            }


            /*
             * Store reward permanently.
             */

            state.rewards[level] = {

                unlocked: true,

                claimed: false,

                unlockedAt:
                    new Date().toISOString()

            };


            console.log(
                `🏆 Season Reward Unlocked: Level ${level}`,
                reward.title
            );


            /*
             * Level 20 uses the existing
             * achievement system.
             */

            if (
                reward.type === "achievement" &&
                typeof window.unlockAchievement ===
                "function"
            ) {

                window.unlockAchievement(
                    reward.id
                );

            }


            /*
             * Notify user.
             */

            if (
                typeof window.showSmartNotification ===
                "function"
            ) {

                window.showSmartNotification(

                    "🏆 Season Reward Unlocked",

                    `Level ${level}: ${reward.title}`

                );

            }

        }

    }


    /* =====================================================
       ADD SEASON XP
    ===================================================== */

    function addXP(
        amount,
        source = "Activity"
    ) {

        const state =
            loadState();

        /*
     * Season has not started yet.
     * Do NOT award Season XP.
     */
    if (!hasSeasonStarted()) {

        console.log(
            "Season has not started yet. XP not awarded."
        );

        return state;
    }



        /*
         * Season already completed.
         */

        if (state.completed) {

            console.log(
                "Season is already complete."
            );

            return state;

        }


        /*
         * Validate XP.
         */

        const xp =
            Number(amount);

        if (
            !Number.isFinite(xp) ||
            xp <= 0
        ) {

            return state;

        }


        const oldLevel =
            calculateLevel(
                state.xp
            );


        /*
         * Add XP.
         */

        state.xp += xp;


        /*
         * Prevent unnecessary
         * floating-point values.
         */

        state.xp =
            Math.max(
                0,
                Math.floor(
                    state.xp
                )
            );


        /*
         * Calculate new level.
         */

        const newLevel =
            calculateLevel(
                state.xp
            );

        state.level =
            newLevel;


        /*
         * Unlock any rewards crossed.
         */

        if (
            newLevel > oldLevel
        ) {

            unlockSeasonRewards(
                state,
                oldLevel,
                newLevel
            );


            console.log(
                `🏆 Season Level Up: ${newLevel}`
            );

        }


        /*
         * Save.
         */

        saveState(state);


        /*
         * Update UI.
         */

        renderSeason();


        console.log(
            `🏆 +${xp} Season XP — ${source}`
        );


        return state;

    }


    /* =====================================================
       GET STATE
    ===================================================== */

    function getState() {

        return loadState();

    }


    /* =====================================================
       GET REWARD
    ===================================================== */

    function getReward(level) {

        return SEASON.rewards[level] || null;

    }


    /* =====================================================
       GET REWARD STATE
    ===================================================== */

    function getRewardState(level) {

        const state =
            loadState();

        return (
            state.rewards[level] ||
            null
        );

    }


    /* =====================================================
       CLAIM REWARD
    ===================================================== */

    /* =====================================================
   CLAIM SEASON REWARD
===================================================== */

    function claimReward(level) {

        const state =
            loadState();

        const reward =
            SEASON.rewards[level];

        if (!reward) {

            console.warn(
                "Season reward does not exist:",
                level
            );

            return false;

        }


        const rewardState =
            state.rewards[level];


        /* =================================================
           VALIDATION
        ================================================= */

        if (
            !rewardState ||
            !rewardState.unlocked
        ) {

            console.warn(
                "Season reward is locked:",
                level
            );

            return false;

        }


        if (rewardState.claimed) {

            console.warn(
                "Season reward already claimed:",
                level
            );

            return false;

        }


        /* =================================================
           CARD REWARD
        ================================================= */

        /* =====================================================
   IMPROVEMENT POINT REWARD
===================================================== */
        if (reward.type === "improvement-points") {

            const amount =
                Number(reward.amount) || 0;

            if (amount <= 0) {
                console.warn(
                    "Invalid Improvement Point reward:",
                    amount
                );

                return false;
            }

            if (
                typeof window.addImprovementPoints !==
                "function"
            ) {
                console.error(
                    "Improvement Point system unavailable."
                );

                return false;
            }

            window.addImprovementPoints(amount);

            console.log(
                `🎁 +${amount} Improvement Points`
            );
        }

        if (
            reward.type === "card" ||
    reward.type === "exclusive-card"
        ) {

            if (
                typeof window.cardCatalog ===
                "undefined"
            ) {

                console.error(
                    "Card catalog is unavailable."
                );

                return false;

            }


            const card =
                window.cardCatalog.find(
                    c =>
                        c.id === reward.id
                );


            if (!card) {

                console.error(
                    "Season card not found:",
                    reward.id
                );

                return false;

            }


            const ownedCards =
                JSON.parse(
                    localStorage.getItem(
                        "ownedCards"
                    ) || "{}"
                );


            /*
             * Already owned?
             */

            if (
                ownedCards[reward.id]
            ) {

                rewardState.claimed = true;

                rewardState.claimedAt =
                    new Date().toISOString();

                saveState(state);

                renderSeason();

                return true;

            }


            /*
             * Season cards are FREE.
             *
             * Do NOT subtract Improvement Points.
             */

            ownedCards[reward.id] = {

                mintedAt:
                    typeof getISTDate ===
                        "function"

                        ? getISTDate()
                            .toISOString()
                            .slice(0, 10)

                        : new Date()
                            .toISOString()
                            .slice(0, 10),

                source:
                    "season",

                seasonId:
                    SEASON.id,

                seasonLevel:
                    level

            };


            localStorage.setItem(
                "ownedCards",
                JSON.stringify(
                    ownedCards
                )
            );


            /*
             * Keep app runtime state
             * synchronized if available.
             */

            if (
                typeof window.ownedCards !==
                "undefined"
            ) {

                window.ownedCards =
                    ownedCards;

            }


            /*
             * Refresh card UI.
             */

            if (
                typeof renderMarketplace ===
                "function"
            ) {

                renderMarketplace();

            }


            if (
                typeof renderMyCards ===
                "function"
            ) {

                renderMyCards();

            }

        }


        /* =================================================
           BADGE REWARD
        ================================================= */

        else if (
            reward.type === "badge"
        ) {

            /*
             * Your badge system stores earned
             * badges under "earnedBadges".
             */

            let earnedBadges = [];

            try {

                earnedBadges =
                    JSON.parse(
                        localStorage.getItem(
                            "earnedBadges"
                        ) || "[]"
                    );

            } catch (error) {

                console.warn(
                    "Could not read earned badges:",
                    error
                );

                earnedBadges = [];

            }


            /*
             * Prevent duplicate badge.
             */

            const alreadyOwned =
                earnedBadges.some(
                    badge =>
                        badge.id ===
                        reward.id
                );


            if (!alreadyOwned) {

                earnedBadges.push({

                    id:
                        reward.id,

                    title:
                        reward.title,

                    artwork:
                        "",

                    month:
                        "Season 01",

                    earnedAt:
                        typeof getISTDate ===
                            "function"

                            ? getISTDate()
                                .toISOString()

                            : new Date()
                                .toISOString(),

                    source:
                        "season",

                    seasonId:
                        SEASON.id,

                    seasonLevel:
                        level

                });


                localStorage.setItem(
                    "earnedBadges",
                    JSON.stringify(
                        earnedBadges
                    )
                );

            }


            /*
             * Refresh badge UI if available.
             */

            if (
                typeof renderBadges ===
                "function"
            ) {

                renderBadges();

            }

        }


        /* =================================================
           ACHIEVEMENT REWARD
        ================================================= */

        else if (
            reward.type === "achievement"
        ) {

            if (
                typeof window.unlockAchievement ===
                "function"
            ) {

                window.unlockAchievement(
                    reward.id
                );

            } else {

                console.warn(
                    "Achievement system unavailable:",
                    reward.id
                );

                return false;

            }

        }


        /* =================================================
           MARK CLAIMED
        ================================================= */

        rewardState.claimed =
            true;

        rewardState.claimedAt =
            new Date().toISOString();


        saveState(state);


        renderSeason();


        console.log(
            `🎁 Season Reward Claimed: Level ${level}`,
            reward.title
        );


        /*
         * User feedback.
         */

        if (
            typeof window.showSmartNotification ===
            "function"
        ) {

            window.showSmartNotification(
                "🎁 Reward Claimed",
                reward.title
            );

        }


        return true;

    }


    /* =====================================================
       SEASON PROGRESS
    ===================================================== */

    function getProgress() {

        const state =
            loadState();

        const level =
            state.level;

        if (
            level >=
            SEASON.maxLevel
        ) {

            return {

                level,

                xp:
                    state.xp,

                currentXP:
                    SEASON.xpPerLevel,

                requiredXP:
                    SEASON.xpPerLevel,

                percentage: 100

            };

        }


        const levelStartXP =
            (level - 1) *
            SEASON.xpPerLevel;

        const levelEndXP =
            level *
            SEASON.xpPerLevel;

        const currentXP =
            Math.max(
                0,
                state.xp -
                levelStartXP
            );

        const requiredXP =
            levelEndXP -
            levelStartXP;

        const percentage =
            Math.min(
                100,
                Math.max(
                    0,
                    (
                        currentXP /
                        requiredXP
                    ) * 100
                )
            );


        return {

            level,

            xp:
                state.xp,

            currentXP,

            requiredXP,

            percentage

        };

    }


    /* =====================================================
       SEASON TIME
    ===================================================== */

    function getTimeRemaining() {

        const now =
            new Date();

        const end =
            new Date(
                SEASON.end
            );

        const difference =
            end.getTime() -
            now.getTime();

        if (
            difference <= 0
        ) {

            return {

                expired: true,

                days: 0,

                hours: 0,

                minutes: 0,

                seconds: 0

            };

        }


        const days =
            Math.floor(
                difference /
                86400000
            );

        const hours =
            Math.floor(
                (
                    difference %
                    86400000
                ) /
                3600000
            );

        const minutes =
            Math.floor(
                (
                    difference %
                    3600000
                ) /
                60000
            );

        const seconds =
            Math.floor(
                (
                    difference %
                    60000
                ) /
                1000
            );


        return {

            expired: false,

            days,

            hours,

            minutes,

            seconds

        };

    }

    /* =====================================================
   SEASON START CHECK
===================================================== */

function hasSeasonStarted() {

    const now = new Date();
    const start = new Date(SEASON.start);

    return now.getTime() >= start.getTime();
}


    /* =====================================================
       SEASON EXPIRY
    ===================================================== */

    function checkSeasonExpiry() {

        const state =
            loadState();

        if (
            state.completed
        ) {

            return state;

        }


        const remaining =
            getTimeRemaining();


        if (
            remaining.expired
        ) {

            state.completed = true;

            state.endedAt =
                new Date().toISOString();

            saveState(state);


            console.log(
                "🏆 Season Complete"
            );

        }


        return state;

    }


    /* =====================================================
       RENDER SEASON
    ===================================================== */

    function renderSeason() {

        const started =
        hasSeasonStarted();

    const state =
        checkSeasonExpiry();

    const progress =
        getProgress();

    /*
     * =====================================================
     * SEASON STATUS
     * =====================================================
     */

    const statusElements =
        document.querySelectorAll(
            ".season-status"
        );

    statusElements.forEach(
        element => {

            if (state.completed) {

                element.textContent =
                    "COMPLETED";

            } else if (!started) {

                element.textContent =
                    "ARIVING";

            } else {

                element.textContent =
                    "ACTIVE";
            }

        }
    );


        /*
         * Level
         */

        const levelElements =
            document.querySelectorAll(
                "[data-season-level]"
            );

        levelElements.forEach(
            element => {

                element.textContent =
                    progress.level;

            }
        );


        /*
         * Total XP
         */

        const xpElements =
            document.querySelectorAll(
                "[data-season-xp]"
            );

        xpElements.forEach(
            element => {

                element.textContent =
                    state.xp;

            }
        );


        /*
         * Progress text
         */

        const progressElements =
            document.querySelectorAll(
                "[data-season-progress]"
            );

        progressElements.forEach(
            element => {

                element.textContent =
                    progress.level >=
                        SEASON.maxLevel

                        ? "MAX LEVEL"

                        : `${progress.currentXP} / ${progress.requiredXP} XP`;

            }
        );


        /*
         * Progress bars
         */

        const bars =
            document.querySelectorAll(
                "[data-season-progress-bar]"
            );

        bars.forEach(
            bar => {

                bar.style.width =
                    `${progress.percentage}%`;

            }
        );


        /*
         * Season name
         */

        const names =
            document.querySelectorAll(
                "[data-season-name]"
            );

        names.forEach(
            element => {

                element.textContent =
                    SEASON.name;

            }
        );


        /*
         * Countdown
         */

        updateSeasonCountdown();


        /*
         * Reward states
         */

        /* =====================================================
   REWARD UI
===================================================== */

        document
            .querySelectorAll(
                "[data-season-reward-level]"
            )
            .forEach(
                element => {

                    const level =
                        Number(
                            element.dataset
                                .seasonRewardLevel
                        );

                    const rewardState =
                        state.rewards[level];

                    const unlocked =
                        !!(
                            rewardState &&
                            rewardState.unlocked
                        );

                    const claimed =
                        !!(
                            rewardState &&
                            rewardState.claimed
                        );


                    element.classList.toggle(
                        "unlocked",
                        unlocked
                    );

                    element.classList.toggle(
                        "claimed",
                        claimed
                    );

                    element.classList.toggle(
                        "locked",
                        !unlocked
                    );


                    const button =
                        element.querySelector(
                            "[data-season-claim]"
                        );

                    const lock =
                        element.querySelector(
                            ".season-reward-lock"
                        );


                    if (button) {

                        button.style.display =
                            unlocked
                                ? ""
                                : "none";

                        button.disabled =
                            claimed;

                        button.textContent =
                            claimed
                                ? "CLAIMED"
                                : "CLAIM";

                    }


                    if (lock) {

                        lock.style.display =
                            unlocked
                                ? "none"
                                : "";

                    }

                }
            );

    }


    /* =====================================================
       COUNTDOWN
    ===================================================== */

    /* =====================================================
   SEASON COUNTDOWN
===================================================== */

function updateSeasonCountdown() {

    const elements =
        document.querySelectorAll(
            "[data-season-countdown]"
        );

    if (!elements.length) {
        return;
    }

    const now =
        new Date();

    const start =
        new Date(SEASON.start);

    const end =
        new Date(SEASON.end);

    let text = "";

    /*
     * BEFORE SEASON START
     */
    if (now.getTime() < start.getTime()) {

        const difference =
            start.getTime() -
            now.getTime();

        const days =
            Math.floor(
                difference / 86400000
            );

        const hours =
            Math.floor(
                (
                    difference %
                    86400000
                ) / 3600000
            );

        const minutes =
            Math.floor(
                (
                    difference %
                    3600000
                ) / 60000
            );

        const seconds =
            Math.floor(
                (
                    difference %
                    60000
                ) / 1000
            );

        text =
            days > 0
                ? `Starts in ${days}d ${hours}h`
                : `${hours}h ${minutes}m ${seconds}s until start`;
    }

    /*
     * SEASON ACTIVE
     */
    else if (now.getTime() <= end.getTime()) {

        const difference =
            end.getTime() -
            now.getTime();

        const days =
            Math.floor(
                difference / 86400000
            );

        const hours =
            Math.floor(
                (
                    difference %
                    86400000
                ) / 3600000
            );

        const minutes =
            Math.floor(
                (
                    difference %
                    3600000
                ) / 60000
            );

        text =
            days > 0
                ? `${days}d ${hours}h remaining`
                : `${hours}h ${minutes}m remaining`;
    }

    /*
     * SEASON COMPLETE
     */
    else {

        text =
            "Season Complete";
    }

    elements.forEach(
        element => {

            element.textContent =
                text;
        }
    );
}

    /* =====================================================
   SEASON REWARD BUTTONS
===================================================== */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-season-claim]"
                );

            if (!button) {
                return;
            }


            const level =
                Number(
                    button.dataset.seasonClaim
                );


            const success =
                claimReward(level);


            if (!success) {
                return;
            }


            button.textContent =
                "CLAIMED";

            button.disabled = true;


            /*
             * Refresh reward state.
             */

            renderSeason();

        }
    );

    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initializeSeason() {

        const state =
            loadState();


        /*
         * Ensure level is synchronized
         * with stored XP.
         */

        state.level =
            calculateLevel(
                state.xp
            );


        saveState(state);

        renderSeason();


        console.log(
            "🏆 Season system initialized:",
            SEASON.name
        );

    }

    /* =====================================================
   TEST / SEASON RESET
   Resets ONLY Season 01 state.
===================================================== */

function resetSeason() {

    localStorage.removeItem(
        STORAGE_KEY
    );

    const freshState =
        createDefaultState();

    saveState(
        freshState
    );

    renderSeason();

    console.log(
        "🔄 Season state reset successfully."
    );

    return freshState;
}


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.StandOutSeason = {

        addXP,

        getState,

        getReward,

        getRewardState,

        claimReward,

        getProgress,

        getTimeRemaining,

        renderSeason,
        resetSeason,

        checkSeasonExpiry,

        calculateLevel,

        SEASON

    };


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeSeason
        );

    } else {

        initializeSeason();

    }


    /*
     * Keep countdown fresh.
     */

    setInterval(
        updateSeasonCountdown,
        1000
    );


})();

/* =========================================================
   MONTHLY RESOLUTION
========================================================= */

const MONTHLY_RESOLUTION_KEY =
    "monthlyResolutionData";


/* ---------------------------------------------------------
   DATE HELPERS
--------------------------------------------------------- */

function getResolutionNow() {
    return new Date();
}


function getResolutionMonthKey(date = getResolutionNow()) {

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0")
    ].join("-");
}


function getDaysInCurrentMonth(date = getResolutionNow()) {

    return new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
    ).getDate();
}


/* ---------------------------------------------------------
   STORAGE
--------------------------------------------------------- */

function loadMonthlyResolutionData() {

    try {

        return JSON.parse(
            localStorage.getItem(
                MONTHLY_RESOLUTION_KEY
            )
        ) || {};

    } catch (error) {

        console.warn(
            "Could not load monthly resolution:",
            error
        );

        return {};
    }
}


function saveMonthlyResolutionData(data) {

    localStorage.setItem(
        MONTHLY_RESOLUTION_KEY,
        JSON.stringify(data)
    );
}


/* ---------------------------------------------------------
   CURRENT MONTH DATA
--------------------------------------------------------- */

function getCurrentMonthlyResolution() {

    const data =
        loadMonthlyResolutionData();

    const month =
        getResolutionMonthKey();

    if (!data[month]) {

        data[month] = {
            month,
            text: "",
            achieved: null,
            reviewed: false
        };

        saveMonthlyResolutionData(data);
    }

    return data[month];
}


/* ---------------------------------------------------------
   PERIOD STATE
--------------------------------------------------------- */

function getResolutionPeriod() {

    const today =
        getResolutionNow();

    const day =
        today.getDate();

    const daysInMonth =
        getDaysInCurrentMonth(today);

    /*
     * Days 1–5
     */
    if (day <= 5) {
        return "editable";
    }

    /*
     * Last 5 days
     */
    if (day > daysInMonth - 5) {
        return "reflection";
    }

    /*
     * Everything between
     */
    return "locked";
}


/* ---------------------------------------------------------
   SAVE RESOLUTION
--------------------------------------------------------- */

function saveMonthlyResolution() {

    const period =
        getResolutionPeriod();

    if (period !== "editable") {

        customAlert(
            "Your resolution can only be changed during the first 5 days of the month."
        );

        return;
    }


    const input =
        document.getElementById(
            "monthlyResolutionInput"
        );

    if (!input) return;


    const text =
        input.value.trim();


    if (!text) {

        customAlert(
            "Write your resolution first."
        );

        return;
    }


    const data =
        loadMonthlyResolutionData();

    const month =
        getResolutionMonthKey();


    if (!data[month]) {

        data[month] = {
            month,
            text: "",
            achieved: null,
            reviewed: false
        };
    }


    data[month].text = text;


    saveMonthlyResolutionData(data);

    renderMonthlyResolution();


    customAlert(
        "Monthly resolution saved."
    );
}


/* ---------------------------------------------------------
   LAST-DAY REVIEW
--------------------------------------------------------- */

function answerMonthlyResolution(achieved) {

    const today =
        getResolutionNow();

    const daysInMonth =
        getDaysInCurrentMonth(today);


    /*
     * Only allow review on the
     * actual last day.
     */
    if (today.getDate() !== daysInMonth) {

        return;
    }


    const data =
        loadMonthlyResolutionData();

    const month =
        getResolutionMonthKey();


    if (!data[month]) return;

    if (!data[month].text) {

        customAlert(
            "You didn't set a resolution this month."
        );

        return;
    }


    /*
     * Prevent changing the answer
     * after submitting it.
     */
    if (data[month].reviewed) {

        return;
    }


    data[month].achieved =
        !!achieved;

    data[month].reviewed =
        true;


    saveMonthlyResolutionData(data);

    renderMonthlyResolution();


    customAlert(
        achieved
            ? "Resolution completed. Well done."
            : "Not this time. Start again next month."
    );
}


/* ---------------------------------------------------------
   RENDER
--------------------------------------------------------- */

function renderMonthlyResolution() {

    const card =
        document.getElementById(
            "monthlyResolutionCard"
        );

    const input =
        document.getElementById(
            "monthlyResolutionInput"
        );

    const saveButton =
        document.getElementById(
            "monthlyResolutionSave"
        );

    const status =
        document.getElementById(
            "monthlyResolutionStatus"
        );

    const hint =
        document.getElementById(
            "monthlyResolutionHint"
        );

    const review =
        document.getElementById(
            "monthlyResolutionReview"
        );

    const yesButton =
        document.getElementById(
            "monthlyResolutionYes"
        );

    const noButton =
        document.getElementById(
            "monthlyResolutionNo"
        );


    if (
        !card ||
        !input ||
        !saveButton ||
        !status ||
        !hint ||
        !review
    ) {
        return;
    }


    const resolution =
        getCurrentMonthlyResolution();

    const period =
        getResolutionPeriod();

    const today =
        getResolutionNow();

    const day =
        today.getDate();

    const daysInMonth =
        getDaysInCurrentMonth(today);


    /*
     * Reset visual states.
     */
    card.classList.remove(
        "locked",
        "reflection-period"
    );


    /*
     * Always show current month's
     * saved resolution.
     */
    input.value =
        resolution.text || "";


    /* =====================================================
       FIRST 5 DAYS
    ===================================================== */

    if (period === "editable") {

        input.disabled = false;

        saveButton.disabled = false;

        status.textContent =
            "EDITABLE";

        hint.textContent =
            `Editable until ${today.toLocaleDateString(
                [],
                {
                    month: "short",
                    day: "numeric"
                }
            )}`;

        review.hidden = true;

        return;
    }


    /* =====================================================
       LOCKED PERIOD
    ===================================================== */

    input.disabled = true;

    saveButton.disabled = true;

    card.classList.add("locked");


    /* =====================================================
       FINAL 5 DAYS
    ===================================================== */

    if (period === "reflection") {

        card.classList.add(
            "reflection-period"
        );

        status.textContent =
            "REFLECTION";

        if (day === daysInMonth) {

            hint.textContent =
                "Today is the final day.";

        } else {

            hint.textContent =
                "Your month is coming to an end.";
        }


        /*
         * Only show the review on
         * the actual last day.
         */
        if (
            day === daysInMonth &&
            resolution.text &&
            !resolution.reviewed
        ) {

            review.hidden = false;

        } else {

            review.hidden = true;
        }

    } else {

        status.textContent =
            "LOCKED";

        hint.textContent =
            "Your resolution is locked for this month.";

        review.hidden = true;
    }


    /*
     * Already reviewed
     */
    if (resolution.reviewed) {

        review.hidden = false;

        if (resolution.achieved === true) {

            review.innerHTML = `
                <span class="monthly-resolution-review-label">
                    MONTHLY REFLECTION
                </span>

                <strong>
                    ✓ You achieved your resolution.
                </strong>
            `;

        } else {

            review.innerHTML = `
                <span class="monthly-resolution-review-label">
                    MONTHLY REFLECTION
                </span>

                <strong>
                    Not this time. A new month is a new opportunity.
                </strong>
            `;
        }
    }


    /*
     * Bind review buttons.
     */
    if (yesButton && !resolution.reviewed) {

        yesButton.onclick = () => {
            answerMonthlyResolution(true);
        };
    }


    if (noButton && !resolution.reviewed) {

        noButton.onclick = () => {
            answerMonthlyResolution(false);
        };
    }
}


/* ---------------------------------------------------------
   EVENTS
--------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const saveButton =
            document.getElementById(
                "monthlyResolutionSave"
            );

        if (saveButton) {

            saveButton.addEventListener(
                "click",
                saveMonthlyResolution
            );
        }


        renderMonthlyResolution();
    }
);


/* ---------------------------------------------------------
   EXPOSE FOR TESTING
--------------------------------------------------------- */

window.renderMonthlyResolution =
    renderMonthlyResolution;

window.saveMonthlyResolution =
    saveMonthlyResolution;

window.answerMonthlyResolution =
    answerMonthlyResolution;

