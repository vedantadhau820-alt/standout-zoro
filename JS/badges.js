/* =========================================================
   MONTHLY BADGES
========================================================= */

const MONTHLY_BADGES = {

    /* -----------------------------------------------------
       AUGUST 2026 — TEST BADGE
    ----------------------------------------------------- */

    "2026-08": {

        id: "aug-2026",

        title: "The Relentless",

        artwork: "badges/aug-2026.png",

        requirements: {
            missions: 10,
            goals: 1,
            activeDays: 5
        }

    },


    /* -----------------------------------------------------
       SEPTEMBER 2026
    ----------------------------------------------------- */

    "2026-09": {

        id: "sep-2026",

        title: "The Disciplined",

        artwork: "sep-2026.png",

        requirements: {

            missions: 20,

            goals: 1,

            activeDays: 15

        }

    }

};


/* =========================================================
   CURRENT BADGE KEY
========================================================= */

function getCurrentBadgeKey() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    return `${year}-${month}`;
}

/* =========================================================
   GET CURRENT MONTHLY BADGE
========================================================= */

function getCurrentMonthlyBadge() {

    const key =
        getCurrentBadgeKey();


    return (
        MONTHLY_BADGES[key] ||
        null
    );

}


/* =========================================================
   MONTHLY GOAL COUNT
========================================================= */

function getMonthlyGoalCount() {

    const key =
        getCurrentBadgeKey();


    const [year, month] =
        key
            .split("-")
            .map(Number);


    /*
       goalsData already contains
       the user's goals.
    */

    if (
        !Array.isArray(
            goalsData
        )
    ) {

        return 0;

    }


    return goalsData.filter(
        goal => {

            /*
               Only achieved goals count.
            */

            if (
                !goal.achieved ||
                !goal.achievedAt
            ) {

                return false;

            }


            const achievedDate =
                new Date(
                    goal.achievedAt
                );


            return (

                achievedDate.getFullYear()
                === year

                &&

                achievedDate.getMonth() + 1
                === month

            );

        }
    ).length;

}


/* =========================================================
   MONTHLY MISSION COUNT
========================================================= */

function getMonthlyMissionCount() {

    const key =
        getCurrentBadgeKey();


    const [year, month] =
        key
            .split("-")
            .map(Number);


    /*
       Mission history is stored
       in localStorage.
    */

    let history = {};

    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    "missionHistory"
                )
            ) || {};

    } catch (error) {

        console.warn(
            "Could not read mission history:",
            error
        );

        return 0;

    }


    const monthPrefix =
        `${year}-${String(month).padStart(2, "0")}`;


    let completed =
        0;


    Object.keys(history)

        .filter(
            date =>
                date.startsWith(
                    monthPrefix
                )
        )

        .forEach(
            date => {

                const day =
                    history[date];


                if (!day) {

                    return;

                }


                completed +=
                    Number(
                        day.completed
                    ) || 0;

            }
        );


    return completed;

}


/* =========================================================
   MONTHLY ACTIVE DAYS
========================================================= */

function getMonthlyActiveDays() {

    const key =
        getCurrentBadgeKey();


    const [year, month] =
        key
            .split("-")
            .map(Number);


    let history = {};

    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    "missionHistory"
                )
            ) || {};

    } catch (error) {

        console.warn(
            "Could not read mission history:",
            error
        );

        return 0;

    }


    const monthPrefix =
        `${year}-${String(month).padStart(2, "0")}`;


    let activeDays =
        0;


    Object.keys(history)

        .filter(
            date =>
                date.startsWith(
                    monthPrefix
                )
        )

        .forEach(
            date => {

                const day =
                    history[date];


                if (!day) {

                    return;

                }


                /*
                   A day is active when
                   at least one mission
                   was completed.
                */

                if (
                    Number(
                        day.completed
                    ) > 0
                ) {

                    activeDays++;

                }

            }
        );


    return activeDays;

}


/* =========================================================
   MONTHLY BADGE PROGRESS
========================================================= */

function getMonthlyBadgeProgress() {

    const badge =
        getCurrentMonthlyBadge();


    /*
       No badge configured
       for this month.
    */

    if (!badge) {

        return null;

    }


    const requirements =
        badge.requirements;


    const progress = {

        missions:
            getMonthlyMissionCount(),

        goals:
            getMonthlyGoalCount(),

        activeDays:
            getMonthlyActiveDays()

    };


    /*
       Check every requirement.
    */

    const earned =

        progress.missions >=
        requirements.missions

        &&

        progress.goals >=
        requirements.goals

        &&

        progress.activeDays >=
        requirements.activeDays;


    return {

        badge,

        progress,

        earned

    };

}


/* =========================================================
   BADGE REQUIREMENT STATUS
========================================================= */

function getMonthlyBadgeRequirementStatus() {

    const data =
        getMonthlyBadgeProgress();


    if (!data) {

        return null;

    }


    const requirements =
        data.badge.requirements;


    return {

        missions: {

            current:
                data.progress.missions,

            required:
                requirements.missions,

            complete:
                data.progress.missions >=
                requirements.missions

        },


        goals: {

            current:
                data.progress.goals,

            required:
                requirements.goals,

            complete:
                data.progress.goals >=
                requirements.goals

        },


        activeDays: {

            current:
                data.progress.activeDays,

            required:
                requirements.activeDays,

            complete:
                data.progress.activeDays >=
                requirements.activeDays

        }

    };

}


/* =========================================================
   BADGE DEBUG
========================================================= */

function debugMonthlyBadge() {

    const key =
        getCurrentBadgeKey();


    const badge =
        getCurrentMonthlyBadge();


    const progress =
        getMonthlyBadgeProgress();


    console.log(
        "================================="
    );

    console.log(
        "MONTHLY BADGE TEST"
    );

    console.log(
        "================================="
    );


    console.log(
        "Current Month:",
        key
    );


    console.log(
        "Badge:",
        badge
    );


    console.log(
        "Progress:",
        progress
    );


    if (progress) {

        console.log(
            `Missions: ${progress.progress.missions} / ${progress.badge.requirements.missions}`
        );

        console.log(
            `Goals: ${progress.progress.goals} / ${progress.badge.requirements.goals}`
        );

        console.log(
            `Active Days: ${progress.progress.activeDays} / ${progress.badge.requirements.activeDays}`
        );

        console.log(
            "Earned:",
            progress.earned
        );

    }

    console.log(
        "================================="
    );

}

/* =========================================================
   MONTHLY BADGE PAGE NAVIGATION
========================================================= */

/* =========================================================
   MONTHLY BADGE PAGE TOGGLE
========================================================= */

function toggleMonthlyBadgePage() {

    const page =
        document.getElementById(
            "monthlyBadgePage"
        );

    const plusButton =
        document.getElementById(
            "globalAddBtn"
        );


    if (!page) {
        return;
    }


    const isOpen =
        page.classList.contains(
            "active"
        );


    /* =========================================
       CLOSE BADGE PAGE
    ========================================= */

    if (isOpen) {

        page.classList.remove(
            "active"
        );


        const missions =
            document.getElementById(
                "missions"
            );


        if (missions) {

            missions.classList.add(
                "active"
            );

        }


        /* SHOW + BUTTON */

        if (plusButton) {

            plusButton.style.display =
                "";

        }


        return;

    }


    /* =========================================
       OPEN BADGE PAGE
    ========================================= */

    document
        .querySelectorAll("section")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    page.classList.add(
        "active"
    );


    /* HIDE + BUTTON */

    if (plusButton) {

        plusButton.style.display =
            "none";

    }


    renderMonthlyBadgePage();

}
/* =========================================================
   NAV LOGO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const navButton =
            document.getElementById(
                "monthlyBadgeNavBtn"
            );


        if (!navButton) {
            return;
        }


        navButton.addEventListener(
            "click",
            toggleMonthlyBadgePage
        );

    }
);

/* =========================================================
   RENDER MONTHLY BADGE PAGE
========================================================= */

function renderMonthlyBadgePage() {

    checkAndAwardMonthlyBadge();

    const data =
        getMonthlyBadgeProgress();


    if (!data) {
        return;
    }


    const badge =
        data.badge;

    renderMonthlyBadgeArtwork(
        badge.artwork,
        data.earned
    );

    const progress =
        data.progress;

    const requirements =
        badge.requirements;


    const monthElement =
        document.getElementById(
            "monthlyBadgeMonth"
        );


    const titleElement =
        document.getElementById(
            "monthlyBadgeTitle"
        );


    const statusElement =
        document.getElementById(
            "monthlyBadgeStatus"
        );


    const artworkElement =
        document.getElementById(
            "monthlyBadgeArtwork"
        );


    const descriptionElement =
        document.getElementById(
            "monthlyBadgeDescription"
        );


    const requirementsElement =
        document.getElementById(
            "monthlyBadgeRequirements"
        );


    const requirementCountElement =
        document.getElementById(
            "monthlyBadgeRequirementCount"
        );


    const earnedMessage =
        document.getElementById(
            "monthlyBadgeEarnedMessage"
        );


    if (!monthElement) {
        return;
    }


    /* -----------------------------------------
       MONTH
    ----------------------------------------- */

    /* -----------------------------------------
   MONTH
----------------------------------------- */

    const badgeKey =
        getCurrentBadgeKey();

    const [
        badgeYear,
        badgeMonth
    ] = badgeKey.split("-");

    const date =
        new Date(
            Number(badgeYear),
            Number(badgeMonth) - 1,
            1
        );

    const monthName =
        date.toLocaleDateString(
            [],
            {
                month: "long"
            }
        );

    monthElement.textContent =
        `${monthName} ${badgeYear}`;


    /* -----------------------------------------
       TITLE
    ----------------------------------------- */

    titleElement.textContent =
        badge.title;


    /* -----------------------------------------
       STATUS
    ----------------------------------------- */

    if (data.earned) {

        statusElement.textContent =
            "EARNED";

        statusElement.classList.add(
            "earned"
        );

        artworkElement.classList.remove(
            "locked"
        );

        artworkElement.classList.add(
            "earned"
        );

        descriptionElement.textContent =
            "You completed this month's challenge.";

        earnedMessage.classList.add(
            "active"
        );

    } else {

        statusElement.textContent =
            "LOCKED";

        statusElement.classList.remove(
            "earned"
        );

        artworkElement.classList.add(
            "locked"
        );

        artworkElement.classList.remove(
            "earned"
        );

        descriptionElement.textContent =
            "Complete this month's challenges to earn this badge.";

        earnedMessage.classList.remove(
            "active"
        );

    }


    /* -----------------------------------------
       REQUIREMENTS
    ----------------------------------------- */

    let completedRequirements =
        0;

    let totalRequirements =
        0;


    const requirementData = [

        {
            name: "Missions",

            current:
                progress.missions,

            required:
                requirements.missions

        },

        {
            name: "Goals",

            current:
                progress.goals,

            required:
                requirements.goals

        },

        {
            name: "Active Days",

            current:
                progress.activeDays,

            required:
                requirements.activeDays

        }

    ];


    requirementsElement.innerHTML =
        "";


    requirementData.forEach(
        requirement => {

            totalRequirements++;


            const complete =
                requirement.current >=
                requirement.required;


            if (complete) {

                completedRequirements++;

            }


            const percentage =
                Math.min(
                    100,

                    Math.round(
                        (
                            requirement.current /
                            requirement.required
                        ) * 100
                    )
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "monthly-badge-requirement";


            row.innerHTML = `

                <div class="
                    monthly-badge-requirement-top
                ">

                    <span class="
                        monthly-badge-requirement-name
                    ">
                        ${requirement.name}
                    </span>


                    <span class="
                        monthly-badge-requirement-value
                        ${complete ? "complete" : ""}
                    ">

                        ${complete ? "✓ " : ""}

                        ${requirement.current}
                        /
                        ${requirement.required}

                    </span>

                </div>


                <div class="
                    monthly-badge-progress
                ">

                    <div
                        class="
                            monthly-badge-progress-fill
                        "
                        style="
                            width: ${percentage}%;
                        "
                    ></div>

                </div>

            `;


            requirementsElement.appendChild(
                row
            );

        }
    );


    requirementCountElement.textContent =
        `${completedRequirements} / ${totalRequirements}`;

    renderBadgeCollection();

}

/* =========================================================
   MONTHLY BADGE ARTWORK
========================================================= */

function renderMonthlyBadgeArtwork(
    artwork,
    earned
) {

    const artworkElement =
        document.getElementById(
            "monthlyBadgeArtwork"
        );

    const innerElement =
        document.getElementById(
            "monthlyBadgeArtworkInner"
        );


    if (
        !artworkElement ||
        !innerElement
    ) {
        return;
    }


    artworkElement.classList.toggle(
        "locked",
        !earned
    );

    artworkElement.classList.toggle(
        "earned",
        earned
    );


    /* -----------------------------------------
       RELENTLESS
    ----------------------------------------- */

    if (artwork === "badges/aug-2026.png") {

        innerElement.innerHTML = `

            <div class="badge-art-relentless">

                <div class="badge-art-ring">

                    <span class="badge-art-symbol">
                        ⚡
                    </span>

                </div>

                <span class="badge-art-year">
                    AUG 2026
                </span>

            </div>

        `;

        return;

    }


    /* -----------------------------------------
       DISCIPLINED
    ----------------------------------------- */

    if (artwork === "disciplined") {

        innerElement.innerHTML = `

            <div class="badge-art-disciplined">

                <div class="badge-art-ring">

                    <span class="badge-art-symbol">
                        ◆
                    </span>

                </div>

                <span class="badge-art-year">
                    SEP 2026
                </span>

            </div>

        `;

        return;

    }


    /* -----------------------------------------
       FALLBACK
    ----------------------------------------- */

    innerElement.innerHTML = `

        <div class="badge-art-fallback">
            ★
        </div>

    `;

}

/* =========================================================
   EARNED BADGES
========================================================= */

function getEarnedBadges() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "earnedBadges"
            )
        ) || [];

    } catch (error) {

        console.warn(
            "Could not read earned badges:",
            error
        );

        return [];

    }

}


function saveEarnedBadges(
    badges
) {

    localStorage.setItem(
        "earnedBadges",
        JSON.stringify(
            badges
        )
    );

}

/* =========================================================
   AWARD CURRENT BADGE
========================================================= */

function checkAndAwardMonthlyBadge() {

    const data =
        getMonthlyBadgeProgress();


    if (!data) {
        return false;
    }


    if (!data.earned) {
        return false;
    }


    const badge =
        data.badge;


    const earnedBadges =
        getEarnedBadges();


    /*
       Already earned?
       Do nothing.
    */

    const alreadyEarned =
        earnedBadges.some(
            earned =>
                earned.id === badge.id
        );


    if (alreadyEarned) {

        return false;

    }


    /*
       Save permanent badge.
    */

    earnedBadges.push({

        id:
            badge.id,

        title:
            badge.title,

        artwork:
            badge.artwork,

        month:
            getCurrentBadgeKey(),

        earnedAt:
            Date.now()

    });


    saveEarnedBadges(
        earnedBadges
    );


    console.log(
        `🏅 Badge earned: ${badge.title}`
    );


    return true;

}


/* =========================================================
   BADGE COLLECTION
========================================================= */

/* =========================================================
   BADGE COLLECTION
========================================================= */

function renderBadgeCollection() {

    const earnedBadges =
        getEarnedBadges();


    const collection =
        document.getElementById(
            "monthlyBadgeCollection"
        );


    if (!collection) {

        return;

    }


    if (
        earnedBadges.length === 0
    ) {

        collection.innerHTML = `

            <div class="
                badge-collection-empty
            ">

                <span>
                    🏅
                </span>

                <p>
                    No badges earned yet.
                </p>

            </div>

        `;

        return;

    }


    collection.innerHTML = "";


    earnedBadges
        .slice()
        .reverse()
        .forEach(
            badge => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "badge-collection-item";


                item.innerHTML = `

                    <div
                        class="
                            badge-collection-art
                        "
                    >

                        <img
                            src="${badge.artwork}"
                            alt="${badge.title}"
                            class="
                                badge-collection-image
                            "
                        >

                    </div>


                    <div
                        class="
                            badge-collection-info
                        "
                    >

                        <strong>
                            ${badge.title}
                        </strong>

                        <span>
                            ${badge.month}
                        </span>

                    </div>

                `;


                collection.appendChild(
                    item
                );

            }
        );

}

/* =========================================================
   MONTHLY BADGE ARTWORK
========================================================= */

function renderMonthlyBadgeArtwork(
    artwork,
    earned
) {

    const artworkElement =
        document.getElementById(
            "monthlyBadgeArtwork"
        );

    const innerElement =
        document.getElementById(
            "monthlyBadgeArtworkInner"
        );


    if (
        !artworkElement ||
        !innerElement
    ) {

        return;

    }


    artworkElement.classList.toggle(
        "locked",
        !earned
    );


    artworkElement.classList.toggle(
        "earned",
        earned
    );


    innerElement.innerHTML = `

        <img
            src="${artwork}"
            class="monthly-badge-image"
            alt="Monthly badge"
        >

    `;

}


// Temp

/* =========================================================
   TEMPORARY TEST
   LONG-PRESS LOCKED GOAL → PLAY ACHIEVEMENT VIDEO
========================================================= 

/* document.addEventListener(
    "pointerdown",
    function (event) {

        const button =
            event.target.closest(
                ".goal-achieve-btn"
            );

        if (!button) {
            return;
        }

        /*
         * Only work on locked buttons.
         
        if (!button.disabled) {
            return;
        }

        let longPressTimer =
            setTimeout(() => {

                console.log(
                    "TEMP TEST: Locked goal long-pressed"
                );

                playGoalAchievementVideo();

            }, 800);


        /*
         * Store timer on the button
         * so pointerup can cancel it.
         *
        button._longPressTimer =
            longPressTimer;

    }
);


/* ---------------------------------------------------------
   CANCEL LONG PRESS
--------------------------------------------------------- *

document.addEventListener(
    "pointerup",
    function (event) {

        const button =
            event.target.closest(
                ".goal-achieve-btn"
            );

        if (!button) {
            return;
        }

        if (button._longPressTimer) {

            clearTimeout(
                button._longPressTimer
            );

            button._longPressTimer =
                null;
        }

    }
);


/* ---------------------------------------------------------
   CANCEL IF POINTER LEAVES
--------------------------------------------------------- *

document.addEventListener(
    "pointercancel",
    function (event) {

        const button =
            event.target.closest(
                ".goal-achieve-btn"
            );

        if (!button) {
            return;
        }

        if (button._longPressTimer) {

            clearTimeout(
                button._longPressTimer
            );

            button._longPressTimer =
                null;
        }

    }
);
*/
