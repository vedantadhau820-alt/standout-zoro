/* =========================================================
   MOMENTUM SYSTEM
   Standalone system for Standout

   IMPORTANT:
   - Does NOT require HTML changes
   - Does NOT modify app.js directly
   - Core stays in Missions header
   - Expanded panel sits below header
========================================================= */

(() => { 

    "use strict";


    /* =========================================================
       CONFIG
    ========================================================= */

    const STORAGE_KEY =
        "standout_momentum_state";

    const MOMENTUM_HISTORY_KEY =
        "standout_momentum_history";


    const LEVELS = [

        {
            min: 0,
            name: "Ember",
            icon: "ember"
        },

        {
            min: 3,
            name: "Flame",
            icon: "flame"
        },

        {
            min: 7,
            name: "Burning",
            icon: "burning"
        },

        {
            min: 14,
            name: "Beacon",
            icon: "beacon"
        },

        {
            min: 30,
            name: "Guardian",
            icon: "guardian"
        },

        {
            min: 60,
            name: "Radiant",
            icon: "radiant"
        },

        {
            min: 100,
            name: "Eternal",
            icon: "eternal"
        }

    ];


    const DEFAULT_STATE = {

        version: 1,

        momentum: 0,

        energy: 100,

        bestMomentum: 0,

        shields: 0,

        lastProofDate: null,

        lastCheckDate: null,

        totalProofDays: 0

    };


    let state =
        loadState();


    /*
     * Developer test date.
     *
     * null = real date
     * string = simulated date
     */
    let momentumTestDate = null;


    let isOpen = false;


    /* =========================================================
       STORAGE
    ========================================================= */

    function loadState() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (!raw) {

                return {
                    ...DEFAULT_STATE
                };

            }


            const saved =
                JSON.parse(raw);


            return {

                ...DEFAULT_STATE,

                ...saved,


                momentum:
                    Math.max(
                        0,
                        Number(
                            saved.momentum
                        ) || 0
                    ),


                energy:
                    Math.min(
                        100,
                        Math.max(
                            0,
                            Number(
                                saved.energy
                            ) || 0
                        )
                    ),


                bestMomentum:
                    Math.max(
                        0,
                        Number(
                            saved.bestMomentum
                        ) || 0
                    ),


                shields:
                    Math.max(
                        0,
                        Number(
                            saved.shields
                        ) || 0
                    ),


                totalProofDays:
                    Math.max(
                        0,
                        Number(
                            saved.totalProofDays
                        ) || 0
                    )

            };

        }

        catch (error) {

            console.error(
                "Momentum load error:",
                error
            );


            return {
                ...DEFAULT_STATE
            };

        }

    }

    /* =========================================================
   MOMENTUM HISTORY
========================================================= */

    function loadMomentumHistory() {

        try {

            const raw =
                localStorage.getItem(
                    MOMENTUM_HISTORY_KEY
                );

            if (!raw) {
                return {};
            }

            const saved =
                JSON.parse(raw);

            return (
                saved &&
                typeof saved === "object"
            )
                ? saved
                : {};

        }

        catch (error) {

            console.error(
                "Momentum history load error:",
                error
            );

            return {};

        }

    }


    let momentumHistory =
        loadMomentumHistory();


    function saveMomentumHistory() {

        try {

            localStorage.setItem(
                MOMENTUM_HISTORY_KEY,
                JSON.stringify(
                    momentumHistory
                )
            );

        }

        catch (error) {

            console.error(
                "Momentum history save error:",
                error
            );

        }

    }

   function reloadFromStorage() {

    state = loadState();

    momentumHistory =
        loadMomentumHistory();

    render();

   }


    function recordMomentumHistory() {

        const date =
            today();

        momentumHistory[date] = {

            momentum:
                state.momentum,

            energy:
                state.energy

        };

        saveMomentumHistory();

    }

    function saveState() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );

        }

        catch (error) {

            console.error(
                "Momentum save error:",
                error
            );

        }

    }


    /* =========================================================
       DATE
    ========================================================= */

    function today() {

        /*
         * Developer testing date.
         */

        if (
            momentumTestDate
        ) {

            return momentumTestDate;

        }


        /*
         * Use application's date
         * function when available.
         */

        try {

            if (
                typeof window.getTodayKey ===
                "function"
            ) {

                return window.getTodayKey();

            }

        }

        catch (_) { }


        /*
         * Fallback to IST.
         */

        return new Intl.DateTimeFormat(

            "en-CA",

            {

                timeZone:
                    "Asia/Kolkata",

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit"

            }

        ).format(
            new Date()
        );

    }


    function daysBetween(
        first,
        second
    ) {

        if (
            !first ||
            !second
        ) {

            return 0;

        }


        const a =
            new Date(
                `${first}T00:00:00`
            );


        const b =
            new Date(
                `${second}T00:00:00`
            );


        return Math.round(
            (b - a) /
            86400000
        );

    }


    /* =========================================================
       LEVEL
    ========================================================= */

    function getLevel() {

        let result =
            LEVELS[0];


        LEVELS.forEach(
            level => {

                if (
                    state.momentum >=
                    level.min
                ) {

                    result =
                        level;

                }

            }
        );


        return result;

    }


    function getNextLevel() {

        return (

            LEVELS.find(
                level =>
                    level.min >
                    state.momentum
            )

            ||

            null

        );

    }


    /* =========================================================
       ENERGY
    ========================================================= */

    function energyClass() {

        if (
            state.energy >= 80
        ) {

            return "strong";

        }


        if (
            state.energy >= 55
        ) {

            return "healthy";

        }


        if (
            state.energy >= 30
        ) {

            return "risk";

        }


        return "critical";

    }


    /* =========================================================
       TODAY'S PROOF
    ========================================================= */

    function proofComplete() {

        return (

            state.lastProofDate ===
            today()

        );

    }


    /* =========================================================
       CREATE MISSION HEADER
    ========================================================= */

    function createMissionHeader() {

        const missions =
            document.getElementById(
                "missions"
            );


        if (!missions) {

            return null;

        }


        let header =
            document.getElementById(
                "momentumMissionHeader"
            );


        if (header) {

            return header;

        }


        const title =
            missions.querySelector(
                "h2"
            );


        const points =
            missions.querySelector(
                "p"
            );


        const missionList =
            document.getElementById(
                "mission-list"
            );


        if (
            !title ||
            !points
        ) {

            return null;

        }


        header =
            document.createElement(
                "div"
            );


        header.id =
            "momentumMissionHeader";


        const titleGroup =
            document.createElement(
                "div"
            );


        titleGroup.className =
            "momentum-title-group";


        titleGroup.appendChild(
            title
        );


        titleGroup.appendChild(
            points
        );


        const coreSlot =
            document.createElement(
                "div"
            );


        coreSlot.id =
            "momentumCoreSlot";


        coreSlot.className =
            "momentum-core-slot";


        header.appendChild(
            titleGroup
        );


        header.appendChild(
            coreSlot
        );


        if (missionList) {

            missions.insertBefore(
                header,
                missionList
            );

        }

        else {

            missions.appendChild(
                header
            );

        }


        /*
         * Panel slot.
         */

        const panelSlot =
            document.createElement(
                "div"
            );


        panelSlot.id =
            "momentumPanelSlot";


        panelSlot.className =
            "momentum-panel-slot";


        if (missionList) {

            missions.insertBefore(
                panelSlot,
                missionList
            );

        }

        else {

            missions.appendChild(
                panelSlot
            );

        }


        return header;

    }


    /* =========================================================
       CREATE CORE
    ========================================================= */

    function createCore() {

        const slot =
            document.getElementById(
                "momentumCoreSlot"
            );


        if (!slot) {

            return null;

        }


        let core =
            document.getElementById(
                "momentumCore"
            );


        if (core) {

            return core;

        }


        core =
            document.createElement(
                "button"
            );


        core.type =
            "button";


        core.id =
            "momentumCore";


        core.className =
            "momentum-core-button";


        core.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();

                togglePanel();

            }
        );


        slot.appendChild(
            core
        );


        return core;

    }


    /* =========================================================
       CREATE PANEL
    ========================================================= */

    function createPanel() {

        const slot =
            document.getElementById(
                "momentumPanelSlot"
            );


        if (!slot) {

            return null;

        }


        let panel =
            document.getElementById(
                "momentumPanel"
            );


        if (panel) {

            return panel;

        }


        panel =
            document.createElement(
                "div"
            );


        panel.id =
            "momentumPanel";


        panel.className =
            "momentum-panel";


        slot.appendChild(
            panel
        );


        return panel;

    }


    /* =========================================================
       TOGGLE
    ========================================================= */

    function togglePanel() {

        isOpen =
            !isOpen;


        const core =
            document.getElementById(
                "momentumCore"
            );


        const panel =
            document.getElementById(
                "momentumPanel"
            );


        const slot =
            document.getElementById(
                "momentumPanelSlot"
            );


        if (
            !core ||
            !panel ||
            !slot
        ) {

            return;

        }


        if (isOpen) {

            core.classList.add(
                "open"
            );


            panel.classList.add(
                "open"
            );


            slot.classList.add(
                "open"
            );

        }

        else {

            core.classList.remove(
                "open"
            );


            panel.classList.remove(
                "open"
            );


            slot.classList.remove(
                "open"
            );

        }

    }


    /* =========================================================
       RENDER CORE
    ========================================================= */

    function renderCore() {

        const core =
            document.getElementById(
                "momentumCore"
            );


        if (!core) {

            return;

        }


        const level =
            getLevel();


        const energy =
            energyClass();


        const missedToday =
            state.lastProofDate !==
            today();


        const coreState =
            state.energy <= 0

                ? "extinguished"

                : missedToday &&
                    state.lastProofDate

                    ? "fading"

                    : "alive";


        core.innerHTML = `

            <span
                class="
                    last-light
                    last-light-${level.icon}
                    ${coreState}
                    ${energy}
                "
                aria-hidden="true"
            >

                <span
                    class="light-aura"
                ></span>


                <span
                    class="light-orbit orbit-one"
                ></span>


                <span
                    class="light-orbit orbit-two"
                ></span>


                <span
                    class="light-orbit orbit-three"
                ></span>


                <span
                    class="light-flame"
                >

                    <span
                        class="flame-outer"
                    ></span>


                    <span
                        class="flame-inner"
                    ></span>


                    <span
                        class="flame-core"
                    ></span>

                </span>

            </span>


            <span
                class="momentum-core-text"
            >

                <strong>
                    ${state.momentum}
                </strong>


                <small>
                    ${level.name}
                </small>

            </span>

        `;

    }


    /* =========================================================
       RENDER PANEL
    ========================================================= */

    function renderPanel() {

        const panel =
            document.getElementById(
                "momentumPanel"
            );


        if (!panel) {

            return;

        }


        const level =
            getLevel();


        const next =
            getNextLevel();


        const proof =
            proofComplete();


        const energy =
            energyClass();


        let progress =
            100;


        if (next) {

            const range =
                next.min -
                level.min;


            const current =
                state.momentum -
                level.min;


            progress =
                Math.min(

                    100,

                    Math.max(

                        0,

                        (
                            current /
                            range
                        ) * 100

                    )

                );

        }


        panel.innerHTML = `

            <div
                class="momentum-panel-header"
            >

                <div>

                    <span
                        class="
                            momentum-panel-label
                        "
                    >
                        MOMENTUM
                    </span>


                    <h3>
                        ${level.name}
                    </h3>

                </div>

            </div>


            <div
                class="
                    momentum-big-core
                    ${energy}
                "
            >

                <span
                    class="
                        last-light
                        last-light-${level.icon}
                        ${energy}
                    "
                    aria-hidden="true"
                >

                    <span
                        class="light-aura"
                    ></span>


                    <span
                        class="light-orbit orbit-one"
                    ></span>


                    <span
                        class="light-orbit orbit-two"
                    ></span>


                    <span
                        class="light-orbit orbit-three"
                    ></span>


                    <span
                        class="light-flame"
                    >

                        <span
                            class="flame-outer"
                        ></span>


                        <span
                            class="flame-inner"
                        ></span>


                        <span
                            class="flame-core"
                        ></span>

                    </span>

                </span>

            </div>


            <div
                class="momentum-days"
            >

                <strong>
                    ${state.momentum}
                </strong>

                <span>
                    DAYS
                </span>

            </div>


            <div
                class="momentum-energy-row"
            >

                <span>
                    Core Energy
                </span>


                <strong>
                    ${state.energy}%
                </strong>

            </div>


            <div
                class="momentum-energy-bar"
            >

                <div
                    class="
                        momentum-energy-fill
                        ${energy}
                    "
                    style="
                        width:${state.energy}%;
                    "
                ></div>

            </div>


            <div
                class="momentum-today"
            >

                <div>

                    <strong>
                        Today's Proof
                    </strong>


                    <span>
                        Complete a successful Mission
                        to strengthen your Momentum.
                    </span>

                </div>


                ${proof

                ? `

                            <b
                                class="
                                    momentum-proof-complete
                                "
                            >
                                ✓ COMPLETE
                            </b>

                        `

                : `

                            <b
                                class="
                                    momentum-proof-waiting
                                "
                            >
                                ○ WAITING
                            </b>

                        `
            }

            </div>


            <div
                class="momentum-next"
            >

                ${next

                ? `

                            <div
                                class="
                                    momentum-next-top
                                "
                            >

                                <span>
                                    NEXT EVOLUTION
                                </span>


                                <strong>
                                    ${next.name}
                                </strong>

                            </div>


                            <div
                                class="momentum-progress"
                            >

                                <div
                                    style="
                                        width:${progress}%;
                                    "
                                ></div>

                            </div>


                            <small>
                                ${next.min -
                state.momentum
                }
                                days remaining
                            </small>

                        `

                : `

                            <div
                                class="
                                    momentum-next-top
                                "
                            >

                                <span>
                                    EVOLUTION
                                </span>


                                <strong>
                                    Maximum reached
                                </strong>

                            </div>

                        `
            }

            </div>


            <div
                class="momentum-stats"
            >

                <span>
                    🛡 ${state.shields}
                    shield${state.shields === 1
                ? ""
                : "s"
            }
                </span>


                <span>
                    Best:
                    ${state.bestMomentum}
                </span>


                <span>
                    ${state.totalProofDays}
                    proof days
                </span>

            </div>

        `;

    }


    /* =========================================================
       RENDER EVERYTHING
    ========================================================= */

    function render() {

        renderCore();

        renderPanel();

    }


    /* =========================================================
       REGISTER PROOF
    ========================================================= */

    function registerProof() {

        const currentDay =
            today();


        /*
         * Already proved today.
         */

        if (
            state.lastProofDate ===
            currentDay
        ) {

            return false;

        }


        const oldMomentum =
            state.momentum;


        /*
         * Increase Momentum.
         */

        state.momentum += 1;


        /*
         * Successful Mission restores
         * Core Energy.
         */

        state.energy =
            Math.min(
                100,
                state.energy + 18
            );


        state.bestMomentum =
            Math.max(
                state.bestMomentum,
                state.momentum
            );


        state.lastProofDate =
            currentDay;


        state.lastCheckDate =
            currentDay;


        state.totalProofDays += 1;

        recordMomentumHistory();


        /*
         * Milestone shields.
         */

        const milestones = [
            7,
            14,
            30,
            60,
            100
        ];


        if (
            milestones.includes(
                state.momentum
            ) &&

            state.momentum >
            oldMomentum
        ) {

            state.shields += 1;


            showToast(
                "Momentum Shield earned",
                `${state.momentum} day milestone reached.`
            );

        }

        else {

            showToast(
                "Momentum +1",
                "Today's proof is complete."
            );

        }


        saveState();

        render();


        return true;

    }


    /* =========================================================
       MISSED DAYS
    ========================================================= */

    function checkMissedDays() {

        const currentDay =
            today();


        /*
         * First initialization.
         */

        if (
            !state.lastCheckDate
        ) {

            state.lastCheckDate =
                currentDay;

            saveState();

            return;

        }


        const difference =
            daysBetween(
                state.lastCheckDate,
                currentDay
            );


        /*
         * Same day.
         */

        if (
            difference <= 0
        ) {

            return;

        }


        /*
         * If yesterday was completed
         * and only one day passed,
         * there was no missed day.
         */

        if (
            state.lastProofDate ===
            state.lastCheckDate &&

            difference === 1
        ) {

            state.lastCheckDate =
                currentDay;


            saveState();

            return;

        }


        /*
         * Missed days.
         */

        const missed =
            Math.max(
                1,
                difference
            );


        /*
         * Shield protects the Momentum.
         */

        if (
            state.shields > 0
        ) {

            state.shields -= 1;


            state.energy =
                Math.max(
                    0,
                    state.energy - 5
                );


            showToast(
                "Momentum Shield used",
                "Your Momentum survived."
            );

        }

        else {

            /*
             * Energy damage.
             *
             * 1 missed day = -20
             * 2 missed days = -35 max
             * 3+ missed days = -35 max
             */

            state.energy =
                Math.max(

                    0,

                    state.energy -
                    Math.min(
                        35,
                        missed * 20
                    )

                );


            /*
             * Momentum only weakens
             * after Core Energy dies.
             */

            if (
                state.energy <= 0 &&

                state.momentum > 0
            ) {

                state.momentum =
                    Math.max(

                        0,

                        state.momentum -
                        Math.min(
                            3,
                            missed
                        )

                    );


                showToast(
                    "Momentum weakened",
                    "Your Core needs attention."
                );

            }

            else {

                showToast(
                    "Momentum at risk",
                    "Complete a Mission today."
                );

            }

        }


        state.lastCheckDate =
            currentDay;

        recordMomentumHistory();

        saveState();

        render();

    }


    /* =========================================================
       MISSION COMPLETION DETECTOR
    ========================================================= */

    function hookMissionCompletion() {

        /*
         * Prevent duplicate listeners.
         */

        if (
            window.__momentumMissionListener
        ) {

            return;

        }


        window.__momentumMissionListener =
            true;


        document.addEventListener(

            "click",

            event => {

                const button =
                    event.target.closest(
                        "#mission-list .complete-btn"
                    );


                if (!button) {

                    return;

                }


                /*
                 * Read Improvement Points
                 * before app.js processes
                 * the Mission.
                 */

                const before =
                    Number(
                        localStorage.getItem(
                            "dailyImprovementCount"
                        )
                    ) || 0;


                /*
                 * Give app.js time to complete
                 * the Mission.
                 */

                setTimeout(

                    () => {

                        const after =
                            Number(
                                localStorage.getItem(
                                    "dailyImprovementCount"
                                )
                            ) || 0;


                        /*
                         * Reward only if the
                         * Improvement Point count
                         * genuinely increased.
                         */

                        if (
                            after > before
                        ) {

                            console.log(
                                "🔥 Momentum: Mission completed."
                            );


                            registerProof();

                        }

                    },

                    150

                );

            },

            true

        );


        console.log(
            "✓ Momentum Mission detector installed."
        );

    }


    /* =========================================================
       RESET HOOK
    ========================================================= */

    function hookReset() {

        const original =
            window.resetData;


        if (
            typeof original !==
            "function"
        ) {

            return;

        }


        if (
            original.__momentumWrapped
        ) {

            return;

        }


        const wrapped =
            async function (...args) {

                const result =
                    await original.apply(
                        this,
                        args
                    );


                state = {
                    ...DEFAULT_STATE
                };


                isOpen =
                    false;


                momentumTestDate =
                    null;


                saveState();

                render();


                return result;

            };


        wrapped.__momentumWrapped =
            true;


        window.resetData =
            wrapped;

    }


    /* =========================================================
       TOAST
    ========================================================= */

    function showToast(
        title,
        message
    ) {

        let toast =
            document.getElementById(
                "momentumToast"
            );


        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );


            toast.id =
                "momentumToast";


            document.body.appendChild(
                toast
            );

        }


        toast.innerHTML = `

            <strong>
                ${escapeHTML(title)}
            </strong>

            <span>
                ${escapeHTML(message)}
            </span>

        `;


        toast.classList.add(
            "show"
        );


        clearTimeout(
            toast._timer
        );


        toast._timer =
            setTimeout(

                () => {

                    toast.classList.remove(
                        "show"
                    );

                },

                2800

            );

    }


    function escapeHTML(
        value
    ) {

        return String(value)

            .replaceAll(
                "&",
                "&amp;"
            )

            .replaceAll(
                "<",
                "&lt;"
            )

            .replaceAll(
                ">",
                "&gt;"
            )

            .replaceAll(
                '"',
                "&quot;"
            )

            .replaceAll(
                "'",
                "&#039;"
            );

    }


    /* =========================================================
       INITIALIZATION
    ========================================================= */

    function init() {

        const missions =
            document.getElementById(
                "missions"
            );


        if (!missions) {

            console.warn(
                "Momentum: Missions section not found."
            );

            return;

        }


        createMissionHeader();

        createCore();

        createPanel();


        /*
         * Process real missed days.
         */

        checkMissedDays();


        render();


        hookMissionCompletion();

        hookReset();


        /*
         * Recheck when returning
         * to the app.
         */

        document.addEventListener(

            "visibilitychange",

            () => {

                if (
                    !document.hidden
                ) {

                    checkMissedDays();

                    render();

                }

            }

        );


        window.addEventListener(

            "focus",

            () => {

                checkMissedDays();

                render();

            }

        );


        /*
         * Retry Mission hook.
         */

        setTimeout(
            hookMissionCompletion,
            500
        );


        setTimeout(
            hookMissionCompletion,
            1500
        );


        console.log(
            "✓ Momentum system ready."
        );

    }


    /* =========================================================
       PUBLIC API
    ========================================================= */

    window.Momentum = {

        getState:
            () => ({
                ...state
            }),

        getHistory:
            () => ({
                ...momentumHistory
            }),

       reload:
    reloadFromStorage,


        getLevel:
            () =>
                getLevel(),


        registerProof:
            registerProof,


        render:
            render,


        reset:
            () => {

                state = {
                    ...DEFAULT_STATE
                };


                isOpen =
                    false;


                momentumTestDate =
                    null;


                saveState();

                render();

            },


        /* =====================================================
           DEVELOPER TESTING
        ===================================================== */

        testSet(days = 0) {

            days =
                Math.max(
                    0,
                    Math.floor(
                        Number(days) || 0
                    )
                );


            state.momentum =
                days;


            state.energy =
                100;


            state.bestMomentum =
                Math.max(
                    state.bestMomentum,
                    days
                );


            /*
             * Mark current simulated day
             * as completed so visual testing
             * starts with an alive Core.
             */

            state.lastProofDate =
                today();


            state.lastCheckDate =
                today();


            saveState();

            render();


            console.log(
                `🔥 Momentum Test → ${days} days`
            );


            console.table({

                momentum:
                    state.momentum,

                energy:
                    state.energy,

                level:
                    getLevel().name,

                lastProofDate:
                    state.lastProofDate,

                lastCheckDate:
                    state.lastCheckDate

            });

        },


        testMissDays(days = 1) {

            days =
                Math.floor(
                    Number(days)
                );


            if (
                !Number.isInteger(days) ||
                days < 1
            ) {

                console.error(
                    "Use MomentumTest.missDays(1)"
                );

                return;

            }


            /*
             * Start from the last date
             * Momentum checked.
             */

            let startDate;


            if (
                state.lastCheckDate
            ) {

                startDate =
                    new Date(
                        state.lastCheckDate +
                        "T12:00:00"
                    );

            }

            else {

                startDate =
                    new Date();

            }


            /*
             * Move forward by the number
             * of missed days.
             */

            startDate.setDate(
                startDate.getDate() +
                days
            );


            momentumTestDate =
                startDate
                    .toISOString()
                    .slice(0, 10);


            /*
             * Run the SAME engine that
             * real calendar changes use.
             */

            checkMissedDays();


            render();


            console.log(
                `🔥 Momentum Test → ${days} missed day(s)`
            );


            console.table({

                missedDays:
                    days,

                momentum:
                    state.momentum,

                energy:
                    state.energy,

                level:
                    getLevel().name,

                lastProofDate:
                    state.lastProofDate,

                lastCheckDate:
                    state.lastCheckDate,

                shields:
                    state.shields

            });

        },


        testResetDate() {

            momentumTestDate =
                null;


            console.log(
                "🔥 Momentum Test → real date restored."
            );


            render();

        },


        testStatus() {

            console.table({

                momentum:
                    state.momentum,

                energy:
                    state.energy,

                level:
                    getLevel().name,

                lastProofDate:
                    state.lastProofDate,

                lastCheckDate:
                    state.lastCheckDate,

                shields:
                    state.shields,

                totalProofDays:
                    state.totalProofDays,

                simulatedDate:
                    momentumTestDate ||
                    "REAL DATE"

            });

        }

    };


    /* =========================================================
       MOMENTUM TEST SHORTCUTS
    ========================================================= */

    window.MomentumTest = {

        /*
         * Visual stages.
         */

        set(days = 0) {

            window.Momentum.testSet(
                days
            );

        },


        spark() {

            window.Momentum.testSet(
                0
            );

        },


        flame() {

            window.Momentum.testSet(
                3
            );

        },


        burning() {

            window.Momentum.testSet(
                7
            );

        },


        beacon() {

            window.Momentum.testSet(
                14
            );

        },


        guardian() {

            window.Momentum.testSet(
                30
            );

        },


        radiant() {

            window.Momentum.testSet(
                60
            );

        },


        eternal() {

            window.Momentum.testSet(
                100
            );

        },


        /*
         * Missed days.
         */

        missDays(days = 1) {

            window.Momentum.testMissDays(
                days
            );

        },


        oneDay() {

            window.Momentum.testMissDays(
                1
            );

        },


        twoDays() {

            window.Momentum.testMissDays(
                2
            );

        },


        threeDays() {

            window.Momentum.testMissDays(
                3
            );

        },


        /*
         * Utilities.
         */

        status() {

            window.Momentum.testStatus();

        },


        reset() {

            window.Momentum.reset();

        },


        resetDate() {

            window.Momentum.testResetDate();

        }

    };


    /* =========================================================
       START
    ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    }

    else {

        init();

    }

})();
