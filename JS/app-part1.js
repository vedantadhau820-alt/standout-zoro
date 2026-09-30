
if (!window.cardCatalog) {
    console.error("❌ cardCatalog not loaded");
    window.cardCatalog = [];
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").then(reg => {

        // 🔥 Update found → downloading started.
        reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (!newWorker) return;

            showUpdatingIndicator(); // 👈 IMMEDIATE feedback

            newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed") {
                    if (navigator.serviceWorker.controller) {
                        showUpdateReadyIndicator();
                    }
                }
            });
        });

        // 🔥 New SW takes control
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            hideUpdatingIndicator();
            location.reload();
        });
    });
}

function showUpdatingIndicator() {
    if (document.getElementById("sw-updating")) return;

    const bar = document.createElement("div");
    bar.id = "sw-updating";

    bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #f59e0b;
    color: #000;
    padding: 6px;
    text-align: center;
    font-size: 13px;
    z-index: 99999;
  `;

    bar.textContent = "⬇️ Updating app...";
    document.body.appendChild(bar);
}

function hideUpdatingIndicator() {
    document.getElementById("sw-updating")?.remove();
}

function showUpdateReadyIndicator() {
    showSmartNotification(
        "Update Ready",
        "New version downloaded."
    );
}

let dots = 0;
setInterval(() => {
    const el = document.getElementById("sw-updating");
    if (!el) return;
    dots = (dots + 1) % 4;
    el.textContent = "⬇️ Updating app" + ".".repeat(dots);
}, 500);


let currentMarketplaceFilter = "ALL";

function getISTDate() {
    return new Date(
        new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata"
        })
    );
}

// function getTodayKey() {
//     return getISTDate().toISOString().slice(0, 10);
// }

function getTodayKey() {
    const now = new Date();

    const istDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(now);

    return istDate;
}

function enforceDailyReset() {
    const today = getTodayKey();

    if (lastImprovementDate !== today) {
        dailyImprovementCount = 0;
        lastImprovementDate = today;

        localStorage.setItem("dailyImprovementCount", "0");
        localStorage.setItem("lastImprovementDate", today);

        console.log("✅ Daily reset enforced:", today);
    }
}

window.addEventListener("load", () => {
    enforceDailyReset();
});

setInterval(enforceDailyReset, 60 * 1000);

function getAppSnapshot() {
    return {
        version: "2.1.0",
        exportedAt: getISTDate().toISOString().slice(0, 10),

        completedMissions,
        dailyImprovementCount,
        lastImprovementDate,

        missions: localStorage.getItem("missions") || "",
        skills: localStorage.getItem("skills") || "",
        goals: localStorage.getItem("goals") || "",

        countdowns: JSON.parse(JSON.stringify(countdowns || [])),
        ownedCards: JSON.parse(JSON.stringify(ownedCards || {})),

        achievements: JSON.parse(JSON.stringify(achievementsData || [])),
        notifications: JSON.parse(JSON.stringify(appNotifications || [])),
        lastNotifCount: Number(localStorage.getItem("lastNotifCount")) || 0
    };
}

function restoreAppSnapshot(data) {
    resetData(true); // silent reset

    completedMissions = Number(data.completedMissions) || 0;
    dailyImprovementCount = Number(data.dailyImprovementCount) || 0;
    lastImprovementDate = data.lastImprovementDate || getISTDate().toISOString().slice(0, 10);

    localStorage.setItem("missions", data.missions || "");
    localStorage.setItem("skills", data.skills || "");
    localStorage.setItem("goals", data.goals || "");

    countdowns = Array.isArray(data.countdowns) ? data.countdowns : [];
    saveCountdowns();

    ownedCards = typeof data.ownedCards === "object" ? data.ownedCards : {};
    localStorage.setItem("ownedCards", JSON.stringify(ownedCards));

    achievementsData = Array.isArray(data.achievements)
        ? data.achievements
        : achievements.map(a => ({ ...a, unlocked: false }));

    localStorage.setItem("achievements", JSON.stringify(achievementsData));

    appNotifications = Array.isArray(data.notifications) ? data.notifications : [];
    localStorage.setItem("appNotifications", JSON.stringify(appNotifications));
    localStorage.setItem("lastNotifCount", data.lastNotifCount || 0);

    localStorage.setItem("completedMissions", completedMissions);
    localStorage.setItem("dailyImprovementCount", dailyImprovementCount);
    localStorage.setItem("lastImprovementDate", lastImprovementDate);

    loadData();
    renderAchievements();
    renderCountdowns();
    renderMarketplace();
    renderMyCards();
    updateNotificationBadge();

    document.getElementById("missionCounter").textContent = completedMissions;
}

/* =========================================================
   COMPLETE BACKUP
   Everything EXCEPT custom audio
========================================================= */

async function saveProgressToFile() {

    try {

        /* =====================================================
           1. COLLECT ALL LOCAL STORAGE
        ===================================================== */

        const localStorageData = {};

        for (
            let i = 0;
            i < localStorage.length;
            i++
        ) {

            const key =
                localStorage.key(i);

            if (!key) {
                continue;
            }

            localStorageData[key] =
                localStorage.getItem(key);

        }


        /* =====================================================
           2. COLLECT RUNTIME APPLICATION STATE
        ===================================================== */

        const runtimeState = {};


        /* -----------------------------------------------------
           MISSIONS
        ----------------------------------------------------- */

        if (
            typeof missions !==
            "undefined"
        ) {

            runtimeState.missions =
                JSON.parse(
                    JSON.stringify(
                        missions || []
                    )
                );

        }


        /* -----------------------------------------------------
           GOALS
        ----------------------------------------------------- */

        if (
            typeof goalsData !==
            "undefined"
        ) {

            runtimeState.goalsData =
                JSON.parse(
                    JSON.stringify(
                        goalsData || []
                    )
                );

        }


        /* -----------------------------------------------------
           COUNTDOWNS
        ----------------------------------------------------- */

        if (
            typeof countdowns !==
            "undefined"
        ) {

            runtimeState.countdowns =
                JSON.parse(
                    JSON.stringify(
                        countdowns || []
                    )
                );

        }


        /* -----------------------------------------------------
           COMPLETED MISSIONS
        ----------------------------------------------------- */

        if (
            typeof completedMissionCount !==
            "undefined"
        ) {

            runtimeState.completedMissionCount =
                Number(
                    completedMissionCount
                ) || 0;

        }


        /* -----------------------------------------------------
           DAILY IMPROVEMENT
        ----------------------------------------------------- */

        if (
            typeof dailyImprovementCount !==
            "undefined"
        ) {

            runtimeState.dailyImprovementCount =
                Number(
                    dailyImprovementCount
                ) || 0;

        }


        if (
            typeof lastImprovementDate !==
            "undefined"
        ) {

            runtimeState.lastImprovementDate =
                lastImprovementDate;

        }


        /* -----------------------------------------------------
           OWNED CARDS
        ----------------------------------------------------- */

        if (
            typeof ownedCards !==
            "undefined"
        ) {

            runtimeState.ownedCards =
                JSON.parse(
                    JSON.stringify(
                        ownedCards || {}
                    )
                );

        }


        /* -----------------------------------------------------
           ACHIEVEMENTS / BADGES
        ----------------------------------------------------- */

        if (
            typeof achievementsData !==
            "undefined"
        ) {

            runtimeState.achievementsData =
                JSON.parse(
                    JSON.stringify(
                        achievementsData || []
                    )
                );

        }


        /* -----------------------------------------------------
           NOTIFICATIONS
        ----------------------------------------------------- */

        if (
            typeof appNotifications !==
            "undefined"
        ) {

            runtimeState.appNotifications =
                JSON.parse(
                    JSON.stringify(
                        appNotifications || []
                    )
                );

        }


        /* -----------------------------------------------------
           SOUND SETTINGS
        ----------------------------------------------------- */

        if (
            typeof soundSettings !==
            "undefined"
        ) {

            runtimeState.soundSettings =
                JSON.parse(
                    JSON.stringify(
                        soundSettings || {}
                    )
                );

        }


        /* =====================================================
           3. MONTHLY REPORT
        ===================================================== */

        const monthlyReport = {};


        /* -----------------------------------------------------
           MONTHLY REPORT RUNTIME DATA
        ----------------------------------------------------- */

        if (
            typeof monthlyReportData !==
            "undefined"
        ) {

            monthlyReport.monthlyReportData =
                JSON.parse(
                    JSON.stringify(
                        monthlyReportData
                    )
                );

        }


        if (
            typeof monthlySummaryData !==
            "undefined"
        ) {

            monthlyReport.monthlySummaryData =
                JSON.parse(
                    JSON.stringify(
                        monthlySummaryData
                    )
                );

        }


        if (
            typeof monthlyStats !==
            "undefined"
        ) {

            monthlyReport.monthlyStats =
                JSON.parse(
                    JSON.stringify(
                        monthlyStats || {}
                    )
                );

        }


        /* =====================================================
           4. COLLECT MONTHLY-RELATED LOCAL STORAGE
        ===================================================== */

        monthlyReport.storage = {};


        for (
            let i = 0;
            i < localStorage.length;
            i++
        ) {

            const key =
                localStorage.key(i);

            if (!key) {
                continue;
            }


            /*
             * Anything related to the monthly report
             * is preserved separately as well.
             */

            const lowerKey =
                key.toLowerCase();


            if (
                lowerKey.includes(
                    "monthly"
                ) ||
                lowerKey.includes(
                    "momentum"
                ) ||
                lowerKey.includes(
                    "consistency"
                )
            ) {

                monthlyReport.storage[key] =
                    localStorage.getItem(key);

            }

        }


        /* =====================================================
           5. GET CUSTOM CARDS
        ===================================================== */

        let customCards = [];


        try {

            if (
                typeof getCustomCards ===
                "function"
            ) {

                customCards =
                    await getCustomCards();

            }

        } catch (error) {

            console.error(
                "Failed to backup custom cards:",
                error
            );

        }


        /* =====================================================
           6. GET CUSTOM AUDIO
        ===================================================== */

        let customAudio = [];


        try {

            /*
             * If your app exposes a function for retrieving
             * custom audio, use it.
             */

            if (
                typeof getCustomAudio ===
                "function"
            ) {

                customAudio =
                    await getCustomAudio();

            }

        } catch (error) {

            console.error(
                "Failed to backup custom audio:",
                error
            );

        }


        /* =====================================================
           7. BACKGROUND STATE
        ===================================================== */

        const backgroundState = {};


        /*
         * First capture known runtime variables.
         */

        if (
            typeof customBackground !==
            "undefined"
        ) {

            backgroundState.customBackground =
                customBackground;

        }


        if (
            typeof customBackgroundImage !==
            "undefined"
        ) {

            backgroundState.customBackgroundImage =
                customBackgroundImage;

        }


        if (
            typeof backgroundImage !==
            "undefined"
        ) {

            backgroundState.backgroundImage =
                backgroundImage;

        }


        /*
         * Capture background-related localStorage
         * independently so nothing gets lost.
         */

        backgroundState.storage = {};


        for (
            let i = 0;
            i < localStorage.length;
            i++
        ) {

            const key =
                localStorage.key(i);

            if (!key) {
                continue;
            }


            const lowerKey =
                key.toLowerCase();


            if (
                lowerKey.includes(
                    "background"
                ) ||
                lowerKey.includes(
                    "custombg"
                )
            ) {

                backgroundState.storage[key] =
                    localStorage.getItem(key);

            }

        }


        /* =====================================================
           8. CARD CATALOG
        ===================================================== */

        let cardCatalog = [];


        if (
            Array.isArray(
                window.cardCatalog
            )
        ) {

            cardCatalog =
                JSON.parse(
                    JSON.stringify(
                        window.cardCatalog
                    )
                );

        }


        /* =====================================================
           9. CREATE COMPLETE BACKUP
        ===================================================== */

        const backup = {

            /* -------------------------------------------------
               BACKUP INFORMATION
            ------------------------------------------------- */

            backupVersion: 4,

            backupType:
                "STANDOUT_COMPLETE",

            createdAt:
                new Date().toISOString(),


            /* -------------------------------------------------
               LOCAL STORAGE
            ------------------------------------------------- */

            localStorage:
                localStorageData,


            /* -------------------------------------------------
               RUNTIME STATE
            ------------------------------------------------- */

            runtimeState:
                runtimeState,


            /* -------------------------------------------------
               MONTHLY REPORT
            ------------------------------------------------- */

            monthlyReport:
                monthlyReport,


            /* -------------------------------------------------
               BACKGROUND
            ------------------------------------------------- */

            background:
                backgroundState,


            /* -------------------------------------------------
               CUSTOM CARDS
            ------------------------------------------------- */

            customCards:
                customCards,


            /* -------------------------------------------------
               CUSTOM AUDIO
            ------------------------------------------------- */

            customAudio:
                customAudio,


            /* -------------------------------------------------
               CARD CATALOG
            ------------------------------------------------- */

            cardCatalog:
                cardCatalog



        };

        /* -------------------------------------------------
   DAILY CHALLENGE
------------------------------------------------- */

        dailyChallenge:
        localStorage.getItem(
            "standout_daily_challenge"
        )



        /* =====================================================
           10. CONVERT TO JSON
        ===================================================== */

        const json =
            JSON.stringify(
                backup,
                null,
                2
            );


        /* =====================================================
           11. CREATE FILE
        ===================================================== */

        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );


        /* =====================================================
           12. DOWNLOAD
        ===================================================== */

        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            `standout-backup-${getBackupDate()}.json`;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        URL.revokeObjectURL(
            url
        );


        /* =====================================================
           13. SUCCESS
        ===================================================== */

        customAlert(
            "Complete backup created successfully."
        );


        console.log(
            "✓ Complete Standout backup created",
            backup
        );


    } catch (error) {

        console.error(
            "Backup failed:",
            error
        );


        customAlert(
            "Could not create complete backup."
        );

    }

    checkMissedDeadlines()
    window.location.reload();

}

/* =========================================================
   BACKUP DATE
========================================================= */

function getBackupDate() {

    const date = new Date();

    const pad = value =>
        String(value).padStart(2, "0");

    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds())
    ].join("-");
}

/* =========================================================
   COMPLETE RESTORE
   Restores EVERYTHING from backup
   EXCEPT custom audio
========================================================= */

async function loadProgressFromFile() {

    try {

        /* =====================================================
           1. CREATE FILE INPUT
        ===================================================== */

        const input =
            document.createElement("input");

        input.type = "file";
        input.accept = ".json,application/json";


        /* =====================================================
           2. WAIT FOR FILE
        ===================================================== */

        const file =
            await new Promise(resolve => {

                input.onchange = () => {

                    resolve(
                        input.files?.[0] ||
                        null
                    );

                };

                input.click();

            });


        if (!file) {

            return;

        }


        /* =====================================================
           3. READ FILE
        ===================================================== */

        const text =
            await file.text();

        let backup;


        try {

            backup =
                JSON.parse(text);

        } catch (error) {

            customAlert(
                "This backup file is not valid."
            );

            return;

        }


        /* =====================================================
           4. VALIDATE BACKUP
        ===================================================== */

        if (
            !backup ||
            backup.backupType !==
            "STANDOUT_COMPLETE"
        ) {

            customAlert(
                "This is not a valid Standout backup."
            );

            return;

        }


        if (
            !backup.localStorage ||
            typeof backup.localStorage !==
            "object"
        ) {

            customAlert(
                "Backup data is incomplete."
            );

            return;

        }


        /* =====================================================
           5. CONFIRM RESTORE
        ===================================================== */

        function customConfirm(
            message,
            title = "Are you sure?"
        ) {

            return new Promise(resolve => {

                const overlay =
                    document.createElement(
                        "div"
                    );


                overlay.className =
                    "custom-confirm-overlay";


                overlay.innerHTML = `

                    <div
                        class="custom-confirm-card"
                    >

                        <div
                            class="
                                custom-confirm-title
                            "
                        >
                            ${escapeHTML(title)}
                        </div>


                        <div
                            class="
                                custom-confirm-message
                            "
                        >
                            ${escapeHTML(message)}
                        </div>


                        <div
                            class="
                                custom-confirm-actions
                            "
                        >

                            <button
                                type="button"
                                class="
                                    custom-confirm-cancel
                                "
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                class="
                                    custom-confirm-ok
                                "
                            >
                                Continue
                            </button>

                        </div>

                    </div>

                `;


                document.body.appendChild(
                    overlay
                );


                const cancel =
                    overlay.querySelector(
                        ".custom-confirm-cancel"
                    );


                const ok =
                    overlay.querySelector(
                        ".custom-confirm-ok"
                    );


                function close(result) {

                    overlay.classList.remove(
                        "active"
                    );


                    setTimeout(() => {

                        overlay.remove();

                        resolve(result);

                    }, 200);

                }


                cancel.onclick =
                    () => close(false);


                ok.onclick =
                    () => close(true);


                overlay.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            overlay
                        ) {

                            close(false);

                        }

                    }
                );


                requestAnimationFrame(() => {

                    requestAnimationFrame(() => {

                        overlay.classList.add(
                            "active"
                        );

                    });

                });

            });

        }


        const confirmed =
            await customConfirm(
                "Your current progress will be replaced by the backup.",
                "Restore Backup?"
            );


        if (!confirmed) {

            return;

        }


        /* =====================================================
           6. STOP ACTIVE AUDIO
        ===================================================== */

        if (
            typeof stopActiveTone ===
            "function"
        ) {

            stopActiveTone();

        }


        if (
            typeof stopPreview ===
            "function"
        ) {

            stopPreview();

        }


        /* =====================================================
           7. CLEAR CURRENT LOCAL STORAGE
        ===================================================== */

        localStorage.clear();

        /* =====================================================
   RESET DAILY CHALLENGE
===================================================== */

        localStorage.removeItem(
            "standout_daily_challenge"
        );


        /* =====================================================
           8. RESTORE LOCAL STORAGE
        ===================================================== */

        Object.entries(
            backup.localStorage
        ).forEach(
            ([key, value]) => {

                try {

                    localStorage.setItem(
                        key,
                        value
                    );

                } catch (error) {

                    console.warn(
                        "Could not restore localStorage key:",
                        key,
                        error
                    );

                }

            }
        );

        /* =====================================================
   RESTORE DAILY CHALLENGE
===================================================== */

        if (
            backup.dailyChallenge !==
            undefined &&
            backup.dailyChallenge !== null
        ) {

            localStorage.setItem(
                "dailyChallengeState",
                backup.dailyChallenge
            );

        }

        /* =====================================================
   RELOAD IMPROVEMENT POINTS
===================================================== */

        try {

            const storedPoints =
                localStorage.getItem(
                    "completedMissions"
                );

            completedMissions =
                Math.max(
                    0,
                    Number(storedPoints) || 0
                );

        } catch (error) {

            console.warn(
                "Could not reload Improvement Points:",
                error
            );

        }

        try {

            const storedMissionCount =
                localStorage.getItem(
                    "completedMissionCount"
                );

            completedMissionCount =
                Math.max(
                    0,
                    Number(storedMissionCount) || 0
                );

        } catch (error) {

            console.warn(
                "Could not reload completed mission count:",
                error
            );

        }
        /* =====================================================
   RELOAD MISSION HISTORY
===================================================== */

        try {

            const storedHistory =
                localStorage.getItem(
                    "missionHistory"
                );

            missionHistory =
                storedHistory
                    ? JSON.parse(storedHistory)
                    : {};

        } catch (error) {

            console.warn(
                "Could not reload mission history:",
                error
            );

        }

        /* =====================================================
           9. RESTORE RUNTIME STATE
        ===================================================== */

        const runtime =
            backup.runtimeState || {};


        if (
            Array.isArray(
                runtime.missions
            )
        ) {

            missions =
                JSON.parse(
                    JSON.stringify(
                        runtime.missions
                    )
                );

        }


        if (
            Array.isArray(
                runtime.goalsData
            )
        ) {

            goalsData =
                JSON.parse(
                    JSON.stringify(
                        runtime.goalsData
                    )
                );

        }


        if (
            Array.isArray(
                runtime.countdowns
            )
        ) {

            countdowns =
                JSON.parse(
                    JSON.stringify(
                        runtime.countdowns
                    )
                );

        }


        if (
            runtime.completedMissions !==
            undefined
        ) {

            completedMissions =
                Math.max(
                    0,
                    Number(
                        runtime.completedMissions
                    ) || 0
                );

        }


        if (
            runtime.dailyImprovementCount !==
            undefined
        ) {

            dailyImprovementCount =
                Number(
                    runtime.dailyImprovementCount
                ) || 0;

        }


        if (
            runtime.lastImprovementDate !==
            undefined
        ) {

            lastImprovementDate =
                runtime.lastImprovementDate;

        }


        if (
            runtime.ownedCards
        ) {

            ownedCards =
                JSON.parse(
                    JSON.stringify(
                        runtime.ownedCards
                    )
                );

        }


        if (
            Array.isArray(
                runtime.achievementsData
            )
        ) {

            achievementsData =
                JSON.parse(
                    JSON.stringify(
                        runtime.achievementsData
                    )
                );

        }


        if (
            Array.isArray(
                runtime.appNotifications
            )
        ) {

            appNotifications =
                JSON.parse(
                    JSON.stringify(
                        runtime.appNotifications
                    )
                );

        }


        if (
            runtime.soundSettings
        ) {

            soundSettings =
                JSON.parse(
                    JSON.stringify(
                        runtime.soundSettings
                    )
                );

        }

        /* =====================================================
   SYNC RESTORED MISSION STATE
===================================================== */

        completedMissions =
            Math.max(
                0,
                Number(
                    localStorage.getItem(
                        "completedMissions"
                    )
                ) || 0
            );


        dailyImprovementCount =
            Math.max(
                0,
                Number(
                    localStorage.getItem(
                        "dailyImprovementCount"
                    )
                ) || 0
            );


        lastImprovementDate =
            localStorage.getItem(
                "lastImprovementDate"
            ) || "";


        /* -----------------------------------------------------
           MISSION HISTORY
        ----------------------------------------------------- */

        try {

            const storedHistory =
                localStorage.getItem(
                    "missionHistory"
                );

            missionHistory =
                storedHistory
                    ? JSON.parse(storedHistory)
                    : {};

        } catch (error) {

            console.error(
                "Could not restore mission history:",
                error
            );

            missionHistory = {};

        }


        /* -----------------------------------------------------
           UPDATE COUNTER
        ----------------------------------------------------- */

        const missionCounter =
            document.getElementById(
                "missionCounter"
            );

        if (missionCounter) {

            missionCounter.textContent =
                completedMissions;

        }


        /* =====================================================
           10. RESTORE MONTHLY REPORT
        ===================================================== */

        const monthlyReport =
            backup.monthlyReport || {};


        if (
            monthlyReport.monthlyReportData !==
            undefined
        ) {

            if (
                typeof monthlyReportData !==
                "undefined"
            ) {

                monthlyReportData =
                    JSON.parse(
                        JSON.stringify(
                            monthlyReport.monthlyReportData
                        )
                    );

            }

        }


        if (
            monthlyReport.monthlySummaryData !==
            undefined
        ) {

            if (
                typeof monthlySummaryData !==
                "undefined"
            ) {

                monthlySummaryData =
                    JSON.parse(
                        JSON.stringify(
                            monthlyReport.monthlySummaryData
                        )
                    );

            }

        }


        if (
            monthlyReport.monthlyStats !==
            undefined
        ) {

            if (
                typeof monthlyStats !==
                "undefined"
            ) {

                monthlyStats =
                    JSON.parse(
                        JSON.stringify(
                            monthlyReport.monthlyStats
                        )
                    );

            }

        }


        /* =====================================================
           11. RESTORE MONTHLY STORAGE
        ===================================================== */

        if (
            monthlyReport.storage &&
            typeof monthlyReport.storage ===
            "object"
        ) {

            Object.entries(
                monthlyReport.storage
            ).forEach(
                ([key, value]) => {

                    try {

                        localStorage.setItem(
                            key,
                            value
                        );

                    } catch (error) {

                        console.warn(
                            "Could not restore monthly data:",
                            key,
                            error
                        );

                    }

                }
            );

        }


        /* =====================================================
           12. RESTORE BACKGROUND
        ===================================================== */

        const background =
            backup.background || {};


        /*
         * Restore background-related
         * localStorage values.
         */

        if (
            background.storage &&
            typeof background.storage ===
            "object"
        ) {

            Object.entries(
                background.storage
            ).forEach(
                ([key, value]) => {

                    try {

                        localStorage.setItem(
                            key,
                            value
                        );

                    } catch (error) {

                        console.warn(
                            "Could not restore background setting:",
                            key,
                            error
                        );

                    }

                }
            );

        }


        /*
         * Restore runtime background variables
         * if they exist in this version of the app.
         */

        if (
            background.customBackground !==
            undefined
        ) {

            if (
                typeof customBackground !==
                "undefined"
            ) {

                customBackground =
                    background.customBackground;

            }

        }


        if (
            background.customBackgroundImage !==
            undefined
        ) {

            if (
                typeof customBackgroundImage !==
                "undefined"
            ) {

                customBackgroundImage =
                    background.customBackgroundImage;

            }

        }


        if (
            background.backgroundImage !==
            undefined
        ) {

            if (
                typeof backgroundImage !==
                "undefined"
            ) {

                backgroundImage =
                    background.backgroundImage;

            }

        }


        /* =====================================================
           13. RESTORE CUSTOM CARDS
        ===================================================== */

        if (
            Array.isArray(
                backup.customCards
            )
        ) {

            try {

                await openCustomCardDB();


                const db =
                    customCardDB ||
                    await openCustomCardDB();


                await new Promise(
                    (resolve, reject) => {

                        const transaction =
                            db.transaction(
                                "cards",
                                "readwrite"
                            );


                        const store =
                            transaction.objectStore(
                                "cards"
                            );


                        store.clear();


                        transaction.oncomplete =
                            () => resolve();


                        transaction.onerror =
                            () => reject(
                                transaction.error
                            );

                    }
                );


                for (
                    const card
                    of backup.customCards
                ) {

                    if (
                        !card ||
                        !card.id
                    ) {

                        continue;

                    }


                    await saveCustomCard(
                        card
                    );

                }

            } catch (error) {

                console.error(
                    "Failed to restore custom cards:",
                    error
                );

                customAlert(
                    "Progress restored, but custom cards could not be restored."
                );

                return;

            }

        }


        /* =====================================================
           14. RESTORE CUSTOM AUDIO
        ===================================================== */

        if (
            Array.isArray(
                backup.customAudio
            ) &&
            backup.customAudio.length > 0
        ) {

            try {

                if (
                    typeof restoreCustomAudio ===
                    "function"
                ) {

                    await restoreCustomAudio(
                        backup.customAudio
                    );

                } else {

                    console.warn(
                        "Backup contains custom audio, but restoreCustomAudio() is not available."
                    );

                }

            } catch (error) {

                console.error(
                    "Failed to restore custom audio:",
                    error
                );

            }

        }


        /* =====================================================
           15. RESTORE CARD CATALOG
        ===================================================== */

        if (
            Array.isArray(
                backup.cardCatalog
            )
        ) {

            window.cardCatalog =
                JSON.parse(
                    JSON.stringify(
                        backup.cardCatalog
                    )
                );

        }


        /* =====================================================
           16. RELOAD SOUND SETTINGS
        ===================================================== */

        try {

            if (
                typeof loadSoundSettings ===
                "function"
            ) {

                await loadSoundSettings();

            }

        } catch (error) {

            console.warn(
                "Could not reload sound settings:",
                error
            );

        }


        /* =====================================================
           17. RELOAD MAIN DATA
        ===================================================== */

        if (
            typeof loadData ===
            "function"
        ) {

            loadData();

        }

        /* =====================================================
   RELOAD MOMENTUM
===================================================== */

        if (
            typeof Momentum !== "undefined" &&
            typeof Momentum.reload === "function"
        ) {

            Momentum.reload();

        }


        /* =====================================================
           18. LOAD CUSTOM CARDS
        ===================================================== */

        if (
            typeof loadCustomCardsIntoMarketplace ===
            "function"
        ) {

            await loadCustomCardsIntoMarketplace();

        }


        /* =====================================================
           19. REAPPLY BACKGROUND
        ===================================================== */

        try {

            if (
                typeof loadCustomBackground ===
                "function"
            ) {

                loadCustomBackground();

            }

        } catch (error) {

            console.warn(
                "Could not restore custom background:",
                error
            );

        }


        try {

            if (
                typeof renderCustomBackground ===
                "function"
            ) {

                renderCustomBackground();

            }

        } catch (error) {

            console.warn(
                "Could not render custom background:",
                error
            );

        }

        /* =====================================================
   SYNC RESTORED RUNTIME STATE
===================================================== */

        try {

            /* -------------------------------------------------
               IMPROVEMENT POINTS
            ------------------------------------------------- */

            completedMissions =
                Math.max(
                    0,
                    Number(
                        localStorage.getItem(
                            "completedMissions"
                        )
                    ) || 0
                );


            /* -------------------------------------------------
               DAILY IMPROVEMENT
            ------------------------------------------------- */

            dailyImprovementCount =
                Math.max(
                    0,
                    Number(
                        localStorage.getItem(
                            "dailyImprovementCount"
                        )
                    ) || 0
                );


            /* -------------------------------------------------
               LAST IMPROVEMENT DATE
            ------------------------------------------------- */

            lastImprovementDate =
                localStorage.getItem(
                    "lastImprovementDate"
                ) || "";


            /* -------------------------------------------------
               MISSION HISTORY
               
               IMPORTANT:
               Replace the in-memory object.
               Writing to localStorage alone does NOT update
               the existing missionHistory object.
            ------------------------------------------------- */

            const storedMissionHistory =
                localStorage.getItem(
                    "missionHistory"
                );

            missionHistory =
                storedMissionHistory
                    ? JSON.parse(
                        storedMissionHistory
                    )
                    : {};



            /* -------------------------------------------------
               UPDATE IMPROVEMENT COUNTER UI
            ------------------------------------------------- */

            const missionCounter =
                document.getElementById(
                    "missionCounter"
                );

            if (missionCounter) {

                missionCounter.textContent =
                    completedMissions;

            }


            console.log(
                "✓ Restored Improvement Points:",
                completedMissions
            );

            console.log(
                "✓ Restored Daily Improvement:",
                dailyImprovementCount
            );

            console.log(
                "✓ Restored Mission History:",
                missionHistory
            );

        } catch (error) {

            console.error(
                "Failed to synchronize restored mission state:",
                error
            );

        }

        /* =====================================================
   FINAL MOMENTUM SYNC AFTER RESTORE
===================================================== */

        if (
            typeof Momentum !== "undefined" &&
            typeof Momentum.reload === "function"
        ) {
            Momentum.reload();
        }

        /* =====================================================
           20. REFRESH UI
        ===================================================== */

        if (
            typeof renderMissions ===
            "function"
        ) {

            renderMissions();

        }


        /* =====================================================
   CHECK RESTORED MISSION DEADLINES
===================================================== */

        if (
            typeof checkMissedDeadlines ===
            "function"
        ) {

            checkMissedDeadlines();

        }

        if (
            typeof renderGoals ===
            "function"
        ) {

            renderGoals();

        }


        if (
            typeof renderSkills ===
            "function"
        ) {

            renderSkills();

        }


        if (
            typeof renderCountdowns ===
            "function"
        ) {

            renderCountdowns();

        }


        if (
            typeof renderAchievements ===
            "function"
        ) {

            renderAchievements();

        }


        if (
            typeof renderMarketplace ===
            "function"
        ) {

            renderMarketplace(
                window.currentMarketplaceFilter ||
                "ALL"
            );

        }


        if (
            typeof renderMyCards ===
            "function"
        ) {

            renderMyCards();

        }


        if (
            typeof renderCustomCardsManager ===
            "function"
        ) {

            await renderCustomCardsManager();

        }


        /* =====================================================
           21. REFRESH MONTHLY REPORT
        ===================================================== */

        if (
            typeof renderMonthlyReport ===
            "function"
        ) {

            renderMonthlyReport();

        }


        if (
            typeof renderMonthlySummary ===
            "function"
        ) {

            renderMonthlySummary();

        }


        if (
            typeof renderMonthlyGoals ===
            "function"
        ) {

            renderMonthlyGoals();

        }


        if (
            typeof renderMonthlyMomentum ===
            "function"
        ) {

            renderMonthlyMomentum();

        }


        /* =====================================================
           22. REFRESH MONTHLY BADGES
        ===================================================== */

        if (
            typeof renderMonthlyBadgePage ===
            "function"
        ) {

            renderMonthlyBadgePage();

        }


        if (
            typeof renderBadgeCollection ===
            "function"
        ) {

            renderBadgeCollection();

        }


        /* =====================================================
           23. REFRESH SOUND UI
        ===================================================== */

        if (
            typeof renderSoundSettings ===
            "function"
        ) {

            try {

                renderSoundSettings();

            } catch (error) {

                console.warn(
                    "Could not refresh sound UI:",
                    error
                );

            }

        }


        /* =====================================================
           24. SUCCESS
        ===================================================== */

        customAlert(
            "Backup restored successfully."
        );


        console.log(
            "✓ Complete Standout backup restored."
        );


    } catch (error) {

        console.error(
            "Restore failed:",
            error
        );


        customAlert(
            "Could not restore backup."
        );

    }

    window.location.reload();

}

document.getElementById("importProgressFile").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const text = reader.result.replace(/^\uFEFF/, "").trim();
            const data = JSON.parse(text);
            console.log("RAW FILE TEXT:", reader.result);
            console.log("PARSED DATA:", data);

            restoreAppSnapshot(data);
            customAlert("Progress restored successfully!");
        } catch (err) {
            console.error("Restore failed:", err);
            customAlert("Invalid or corrupted backup file.");
        }
    };

    reader.readAsText(file);
    e.target.value = "";
});

window.saveProgressToFile = saveProgressToFile;
window.loadProgressFromFile = loadProgressFromFile;

const DAILY_IMPROVEMENT_LIMIT = 10;

let dailyImprovementCount = parseInt(localStorage.getItem("dailyImprovementCount")) || 0;
let lastImprovementDate = localStorage.getItem("lastImprovementDate") || new Date().toDateString();


let isMarketplaceOpen = false;


let ownedCards = {};

try {
    const savedOwnedCards = localStorage.getItem("ownedCards");

    if (savedOwnedCards) {
        ownedCards = JSON.parse(savedOwnedCards);
    }
} catch (error) {
    console.error("Failed to load ownedCards:", error);
    ownedCards = {};
}

function renderMarketplace(filterGrade = "ALL") {
    const shop = document.getElementById("cardShop");
    if (!shop) return;

    shop.innerHTML = "";

    let cards = [...window.cardCatalog];



    if (filterGrade !== "ALL") {
        cards = cards.filter(c => c.grade === filterGrade);
    }

    // ✅ SINGLE SORT (safe)
    cards.sort((a, b) => {
        const aLimited = a.limited ? 1 : 0;
        const bLimited = b.limited ? 1 : 0;
        if (aLimited !== bLimited) return bLimited - aLimited;

        const aOwned = ownedCards[a.id] ? 1 : 0;
        const bOwned = ownedCards[b.id] ? 1 : 0;
        if (aOwned !== bOwned) return bOwned - aOwned;

        const aCanBuy = completedMissions >= a.cost ? 1 : 0;
        const bCanBuy = completedMissions >= b.cost ? 1 : 0;
        if (aCanBuy !== bCanBuy) return bCanBuy - aCanBuy;

        return gradeRank(b.grade) - gradeRank(a.grade);
    });

    /* =========================================================
   CARDS PAGE TABS
========================================================= */

    document
        .querySelectorAll("[data-card-tab]")
        .forEach(tab => {

            tab.addEventListener("click", () => {

                const target =
                    tab.dataset.cardTab;

                /*
                 * Update tab buttons
                 */
                document
                    .querySelectorAll("[data-card-tab]")
                    .forEach(button => {
                        button.classList.remove("active");
                    });

                tab.classList.add("active");


                /*
                 * Update views
                 */
                const marketplaceView =
                    document.getElementById(
                        "cards-marketplace-view"
                    );

                const collectionView =
                    document.getElementById(
                        "cards-collection-view"
                    );

                if (!marketplaceView ||
                    !collectionView) {
                    return;
                }


                if (target === "collection") {

                    marketplaceView.classList.remove(
                        "active"
                    );

                    collectionView.classList.add(
                        "active"
                    );

                    renderMyCards();

                } else {

                    collectionView.classList.remove(
                        "active"
                    );

                    marketplaceView.classList.add(
                        "active"
                    );

                    renderMarketplace(
                        currentMarketplaceFilter
                    );
                }

            });

        });

    cards.forEach(card => {

        if (card.seasonReward === true) return;
        const isOwned = !!ownedCards[card.id];
        const expired = isExpired(card);

        if (expired && !isOwned) return;

        const canBuy = completedMissions >= card.cost;
        const mintDate =
            isOwned && ownedCards[card.id]?.mintedAt
                ? formatDate(ownedCards[card.id].mintedAt)
                : "";

        const div = document.createElement("div");
        div.className = `
      flex-card
      grade-${card.grade.toLowerCase()}
      ${isOwned ? "owned" : "locked"}
      ${card.limited ? "limited" : ""}
    `;

        div.innerHTML = `
  <img
  src="${card.image}"
  class="${isOwned ? "owned-card-image" : "market-card-image"}"
  alt="${card.title}"
>
  <span class="grade-badge">${card.grade}</span>

  ${card.limited ? `<span class="limited-badge">LIMITED</span><strong>` : ""}

  <div class="card-body">
    <h3>${card.title}</h3>
    <p class="card-quote">${card.quote}</p>

    ${card.limited && !expired && !isOwned && card.expiresAt
                ? `<h6 class="expire-text">Will expire on: ${card.expiresAt.slice(0, 10)}</h6>`
                : ""
            }

    ${isOwned
                ? `<button class="buy-btn" disabled>OWNED</button>`
                : `<button class="buy-btn" ${!canBuy ? "disabled" : ""}>
             ${card.cost} pts
           </button>`
            }

    ${isOwned && mintDate ? `<div class="mint-date">Minted on ${mintDate}</div>
    <div class="mint-date">Card Cost ${card.cost} pts</div>` : ""}
  </div>
`;


        if (!isOwned && canBuy && !expired) {
            div.querySelector(".buy-btn").onclick = () => buyCard(card.id);
        }

        shop.appendChild(div);
    });
}


function isExpired(card) {
    if (!card.limited || !card.expiresAt) return false;

    const now = window.__timeTravelNow || Date.now();
    return new Date(card.expiresAt).getTime() < now;
}

function buyCard(cardId) {
    const card = window.cardCatalog.find(c => c.id === cardId);
    if (!card) return;

    // ❌ Prevent minting expired limited cards
    if (card.limited && isExpired(card)) {
        customAlert("This limited edition card is no longer available.");
        return;
    }

    if (completedMissions < card.cost) {
        customAlert("Not enough Improvement Points.");
        return;
    }

    customConfirm(
        `Mint "${card.title}" for ${card.cost} points?\nThis is permanent.`,
        () => {
            completedMissions -= card.cost;
            document.getElementById("missionCounter").textContent = completedMissions;

            ownedCards[card.id] = {
                mintedAt: getISTDate().toISOString().slice(0, 10)   // ✅ ISO format
            };

            localStorage.setItem("ownedCards", JSON.stringify(ownedCards));
            localStorage.setItem("completedMissions", completedMissions);

            renderMarketplace(currentMarketplaceFilter);
            renderMyCards();

            // showSmartNotification(
            //   "Card Minted",
            //   `"${card.title}" is now part of your identity.`
            // );

            showMintedCard(card);
        }
    );
}


function formatDate(isoDate) {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return d.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function renderMyCards() {

    const container =
        document.getElementById("ownedCards");

    const seasonContainer =
        document.getElementById("seasonCards");

    const seasonSection =
        document.getElementById(
            "seasonCardsSection"
        );


    if (!container) return;


    /* =====================================================
       LOAD OWNED CARDS
    ===================================================== */

    let currentOwnedCards = {};

    try {

        currentOwnedCards =
            JSON.parse(
                localStorage.getItem(
                    "ownedCards"
                ) || "{}"
            );

    } catch (error) {

        console.error(
            "Could not load owned cards:",
            error
        );

        currentOwnedCards = {};
    }


    if (
        typeof window.ownedCards !==
        "undefined"
    ) {

        window.ownedCards =
            currentOwnedCards;

    }


    /* =====================================================
       FIND OWNED CARDS
    ===================================================== */

    const ownedList =
        (window.cardCatalog || [])
            .filter(
                card =>
                    currentOwnedCards[
                    card.id
                    ]
            )
            .sort(
                (a, b) =>
                    gradeRank(b.grade) -
                    gradeRank(a.grade)
            );


    /* =====================================================
       SEPARATE SEASON CARDS
    ===================================================== */

    const normalCards =
        ownedList.filter(
            card =>
                !card.seasonReward
        );


    const seasonCards =
        ownedList.filter(
            card =>
                card.seasonReward
        );


    /* =====================================================
       NORMAL CARDS
    ===================================================== */

    container.innerHTML = "";


    if (
        normalCards.length === 0
    ) {

        container.innerHTML = `
            <p style="opacity:.6;">
                No regular cards minted yet.
            </p>
        `;

    } else {

        normalCards.forEach(
            card => {

                const data =
                    currentOwnedCards[
                    card.id
                    ];

                const mintedAt =
                    data?.mintedAt
                        ? formatDate(
                            data.mintedAt
                        )
                        : "Unknown";


                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    `flex-card owned grade-${card.grade.toLowerCase()}`;


                div.innerHTML = `

                    <img
                        src="${card.image}"
                        alt="${card.title}"
                        class="owned-card-image"
                    >

                    <span class="grade-badge">
                        ${card.grade}
                    </span>

                    ${card.limited
                        ? `
                                <span class="limited-badge">
                                    LIMITED
                                </span>
                            `
                        : ""
                    }

                    <div class="card-body">

                        <h3>
                            ${card.title}
                        </h3>

                        <p class="card-quote">
                            ${card.quote}
                        </p>

                        <p class="mint-date">
                            Minted on ${mintedAt}
                        </p>

                        <button
                            class="buy-btn"
                            disabled
                        >
                            OWNED
                        </button>

                    </div>
                `;


                container.appendChild(
                    div
                );

            }
        );

    }


    /* =====================================================
       SEASON CARDS
    ===================================================== */

    if (!seasonContainer) {
        return;
    }


    seasonContainer.innerHTML = "";


    if (
        seasonCards.length === 0
    ) {

        if (seasonSection) {

            seasonSection.style.display =
                "none";

        }

        return;
    }


    if (seasonSection) {

        seasonSection.style.display =
            "block";

    }


    seasonCards.forEach(
        card => {

            const data =
                currentOwnedCards[
                card.id
                ];


            const mintedAt =
                data?.mintedAt
                    ? formatDate(
                        data.mintedAt
                    )
                    : "Unknown";


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "season-owned-card";

            const seasonNumber = card.season
                ? card.season
                    .replace("season-", "")
                    .padStart(2, "0")
                : String(SEASON.number).padStart(2, "0");


            div.innerHTML = `

    <div class="season-owned-card-art">

        <img
            src="${card.image}"
            alt="${card.title}"
        >

        <span class="season-owned-card-badge">
    SEASON ${seasonNumber}
</span>

        <div class="season-owned-card-body">

            <h3>
                ${card.title}
            </h3>

            <p>
                ${card.quote}
            </p>

            <div class="season-owned-card-meta">
                Minted on ${mintedAt}
            </div>

        </div>

    </div>

`;


            seasonContainer.appendChild(
                div
            );

        }
    );

}

const GRADE_ORDER = ["E", "D", "C", "B", "A", "S", "w"];

function gradeRank(grade) {
    return GRADE_ORDER.indexOf(grade) + 1;
}

document.querySelectorAll(".card-filters button").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".card-filters button")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const grade = btn.textContent === "All"
            ? "ALL"
            : btn.textContent;

        currentMarketplaceFilter = grade;

        renderMarketplace(grade);
    };
});

window.addEventListener("load", () => {
    renderMarketplace();
    renderMyCards();
});


document.getElementById("marketplaceIcon").onclick = () => {

    if (isMarketplaceOpen) {

        showPage("missions");

        isMarketplaceOpen = false;

    } else {

        showPage("marketplace-cards");

        isMarketplaceOpen = true;

        /*
         * Always open Cards on Marketplace tab
         */
        document
            .querySelectorAll("[data-card-tab]")
            .forEach(button => {
                button.classList.remove("active");
            });

        const marketplaceTab =
            document.querySelector(
                '[data-card-tab="marketplace"]'
            );

        if (marketplaceTab) {
            marketplaceTab.classList.add("active");
        }


        const marketplaceView =
            document.getElementById(
                "cards-marketplace-view"
            );

        const collectionView =
            document.getElementById(
                "cards-collection-view"
            );

        if (marketplaceView) {
            marketplaceView.classList.add("active");
        }

        if (collectionView) {
            collectionView.classList.remove("active");
        }

        renderMarketplace(
            currentMarketplaceFilter
        );
    }
};
/* =========================================================
   MONTHLY REPORT TOGGLE
========================================================= */

const monthlyReportIcon = document.getElementById("monthlyReportIcon");

if (monthlyReportIcon) {
    monthlyReportIcon.addEventListener("click", () => {
        const report = document.getElementById("monthlyReport");
        const missions = document.getElementById("missions");

        if (!report || !missions) return;

        const isOpen = report.classList.contains("active");

        if (isOpen) {
            report.classList.remove("active");
            missions.classList.add("active");
        } else {
            document.querySelectorAll("section").forEach(section => {
                section.classList.remove("active");
            });

            report.classList.add("active");
            renderMonthlyReport();
        }

        updatePlusBtn(isOpen ? "missions" : "monthlyReport");
    });
}

let playlist = [];
let currentTrackIndex = 0;
let timerInterval = null;
let currentMusic = null;
let music = new Audio();

/* =========================================================
   PRESET MUSIC CACHE
========================================================= */

const MUSIC_CACHE_NAME = "mission-app-music-v1";

const MUSIC_FILES = [
    "Music/m1.mp3",
    "Music/m2.mp3",
    "Music/m3.mp3",
    "Music/m4.mp3",
    "Music/m5.mp3",
    "Music/m6.mp3"
];

async function cacheAllMusic() {

    try {

        const cache =
            await caches.open(MUSIC_CACHE_NAME);

        for (const file of MUSIC_FILES) {

            try {

                const existing =
                    await cache.match(file);

                if (existing) {
                    continue;
                }

                await cache.add(file);

                console.log(
                    "Music cached:",
                    file
                );

            } catch (error) {

                console.warn(
                    "Could not cache music:",
                    file,
                    error
                );
            }
        }

        console.log("Preset music cache ready.");

    } catch (error) {

        console.warn(
            "Music cache unavailable:",
            error
        );
    }
}

async function getCachedMusicURL(file) {

    try {

        const cache =
            await caches.open(MUSIC_CACHE_NAME);

        let response =
            await cache.match(file);

        /*
         * If the background cache has not finished yet,
         * download this specific track now.
         */
        if (!response) {

            console.log(
                "Music not cached yet. Downloading:",
                file
            );

            response =
                await fetch(file);

            if (!response.ok) {
                throw new Error(
                    `Failed to load music: ${response.status}`
                );
            }

            await cache.put(
                file,
                response.clone()
            );
        }

        const blob =
            await response.blob();

        return URL.createObjectURL(blob);

    } catch (error) {

        console.warn(
            "Cached music failed, using normal URL:",
            error
        );

        /*
         * Final fallback.
         * The music can still play even if
         * Cache Storage isn't available.
         */
        return file;
    }
}

function stopAllMusic() {
    if (!music) return;

    music.pause();
    music.onended = null;
    music.onerror = null;
    music.removeAttribute("src");
    music.load();
}


function openFolderPicker() {
    const picker = document.getElementById("folderPicker");
    if (picker) {
        picker.click();
    } else {
        console.error("❌ folderPicker not found");
    }
}

document.getElementById("folderPicker").addEventListener("change", function (e) {
    stopAllMusic();

    const files = Array.from(e.target.files)
        .filter(file => file.type.startsWith("audio/"));

    if (files.length === 0) {
        customAlert("No audio files found in this folder.");
        return;
    }

    playlist = files;
    musicMode = "playlist";
    currentTrackIndex = 0;

    // hidePresetUI(); // 🔥 HIDE preset controls

    customConfirm(
        `Play ${playlist.length} songs from this folder?`,
        () => {
            playCurrentTrack();
            closeMusicModal();
        }
    );

    e.target.value = "";
});


function resumeMusicOnUserGesture() {
    const resume = () => {
        music.play().catch(() => { });
        document.removeEventListener("click", resume);
        document.removeEventListener("touchstart", resume);
    };

    document.addEventListener("click", resume);
    document.addEventListener("touchstart", resume);
}


function playCurrentTrack() {

    stopAllAppAudio();

    if (musicMode !== "playlist") return;
    if (!playlist[currentTrackIndex]) return;

    const file = playlist[currentTrackIndex];
    const url = URL.createObjectURL(file);

    music.src = url;
    music.loop = false;
    music.volume = document.getElementById("musicVolume").value;

    music.play()
        .then(() => { })
        .catch(() => {
            // 🔥 FIX autoplay block
            resumeMusicOnUserGesture();
        });

    music.onended = () => {
        if (musicMode !== "playlist") return;

        currentTrackIndex++;
        if (currentTrackIndex >= playlist.length) {
            currentTrackIndex = 0;
        }
        playCurrentTrack();
    };
}



async function setSelectedMusic() {

    const file =
        document.getElementById("musicSelect").value;

    /*
  * Stop every other application audio source.
  */
    stopAllAppAudio();

    /*
     * "None" selected.
     */
    if (!file) {

        musicMode = "none";
        playlist = [];
        currentTrackIndex = 0;

        closeMusicModal();

        return;
    }

    musicMode = "preset";

    playlist = [];

    currentTrackIndex = 0;

    /*
     * Get the cached audio.
     * If it isn't cached yet, it will be
     * downloaded and cached now.
     */
    const audioURL =
        await getCachedMusicURL(file);

    music.src = audioURL;

    music.loop = true;

    music.volume =
        document.getElementById("musicVolume").value;

    music.load();

    try {

        await music.play();

    } catch (error) {

        console.warn(
            "Music playback waiting for user gesture:",
            error
        );
    }

    closeMusicModal();
}




function showPresetUI() {
    document.getElementById("presetControls").style.display = "block";
}

function hidePresetUI() {
    document.getElementById("presetControls").style.display = "none";
}


let musicMode = "preset"; // "preset" | "playlist"



// =========================
//   NOTIFICATION SYSTEM
// =========================

let appNotifications = JSON.parse(localStorage.getItem("appNotifications")) || [];

// Save notif list
function saveNotifications() {
    localStorage.setItem("appNotifications", JSON.stringify(appNotifications));
}

// Add new notification
function pushNotification(title, msg) {
    appNotifications.unshift({
        title,
        msg,
        time: new Date().toLocaleString()
    });

    updateNotificationBadge();
    saveNotifications();
}
function clearAllNotifications() {
    appNotifications = [];                 // Clear array
    localStorage.removeItem("appNotifications"); // Remove from localStorage
    localStorage.removeItem("lastNotifCount");   // Reset unread count tracker

    // Update UI
    document.getElementById("notificationList").innerHTML =
        `<p style="opacity:0.6;">No notifications</p>`;

    const badge = document.getElementById("notifyBadge");
    badge.style.display = "none";
    badge.textContent = "";

    console.log("All notifications cleared.");
}

// Update badge count
function updateNotificationBadge() {
    const badge = document.getElementById("notifyBadge");
    if (!badge) return;

    const lastCount = parseInt(localStorage.getItem("lastNotifCount")) || 0;

    const unread = appNotifications.length - lastCount;

    if (unread <= 0) {
        badge.style.display = "none";
    } else {
        badge.style.display = "inline-block";
        badge.textContent = unread;
    }
}

// =========================================================
// NOTIFICATION DRAWER — OPEN / CLOSE
// =========================================================

document.getElementById("notifyBell").onclick = (e) => {

    e.preventDefault();
    e.stopPropagation();

    const drawer =
        document.getElementById(
            "notificationDrawer"
        );

    if (!drawer) return;


    const isOpen =
        drawer.classList.contains(
            "notification-open"
        );


    if (!isOpen) {

        renderNotifications();

        drawer.classList.add(
            "notification-open"
        );

        // Clear notification badge
        const badge =
            document.getElementById(
                "notifyBadge"
            );

        if (badge) {

            badge.style.display =
                "none";

            badge.textContent =
                "";
        }


        // Mark notifications as read
        localStorage.setItem(
            "lastNotifCount",
            appNotifications.length
        );

        updateNotificationBadge();

        saveNotifications();

    } else {

        drawer.classList.remove(
            "notification-open"
        );
    }
};
document.getElementById("notificationDrawer").addEventListener("click", function (e) {
    e.stopPropagation();
});


document.addEventListener("click", function () {
    const drawer = document.getElementById("notificationDrawer");
    if (drawer && drawer.style.display === "block") {
        drawer.style.display = "none";
    }
});



// ----------------------------
// NOW define renderNotifications
// ----------------------------
function renderNotifications() {
    const container = document.getElementById("notificationList");
    container.innerHTML = "";

    if (appNotifications.length === 0) {
        container.innerHTML = `<p style="opacity:0.7; text-align:center;">No notifications</p>`;
        return;
    }

    appNotifications.forEach(n => {
        const div = document.createElement("div");
        div.className = "notification-card";

        div.innerHTML = `
            <strong>${n.title}</strong><br>
            <span>${n.msg}</span>
            <span class="notification-time">${n.time}</span>
        `;

        container.appendChild(div);
    });
}

// Initialize badge on load
window.addEventListener("load", updateNotificationBadge);

function showSmartNotification(title, message) {
    const popup = document.getElementById("smartNotify");
    document.getElementById("notifyTitle").innerText = title;
    document.getElementById("notifyMsg").innerText = message;

    popup.style.display = "block";
    popup.style.opacity = 0;
    popup.style.transform = "translateY(-40px)";

    setTimeout(() => {
        popup.style.transition = "all 0.4s ease";
        popup.style.opacity = 1;
        popup.style.transform = "translateY(0)";
    }, 20);

    // auto hide
    setTimeout(() => {
        popup.style.opacity = 0;
        popup.style.transform = "translateY(-40px)";
        setTimeout(() => popup.style.display = "none", 400);
    }, 3000);
}

function dailyGoalReminder() {
    const today = new Date().toDateString();
    const lastRun = localStorage.getItem("dailyGoalReminder");

    if (lastRun === today) return; // already sent today

    localStorage.setItem("dailyGoalReminder", today);

    const goals = document.querySelectorAll("#goal-list .goal");
    goals.forEach(goal => {
        const title = goal.querySelector(".goal-title")?.textContent;
        if (title) {
            pushNotification("Goal Reminder", `Don't forget your goal: "${title}"`);
        }
    });
}

/* =========================================================
1. GLOBAL VARIABLES + STORED DATA
========================================================= */
let completedMissions = parseInt(localStorage.getItem("completedMissions")) || 0;
let missionHistory = JSON.parse(localStorage.getItem("missionHistory")) || {};
let completedMissionCount =
    Number(
        localStorage.getItem(
            "completedMissionCount"
        )
    ) || 0;
window.addEventListener("load", () => {
    checkMissedDeadlines();
});

/* =========================================================
   MONTHLY REPORT — PERFORMANCE HISTORY
========================================================= */

function getPerformanceDate() {
    return getISTDate().toISOString().slice(0, 10);
}

function recordMissionPerformance(
    li,
    status,
    pointsDelta = 0
) {
    if (!li) return;

    const date =
        li.dataset.repeat !== "none" &&
            li.dataset.repeatKey
            ? li.dataset.repeatKey
            : getPerformanceDate();

    if (!missionHistory[date]) {
        missionHistory[date] = {
            completed: 0,
            missed: 0,
            pointsDelta: 0,
            events: []
        };
    }

    const missionId =
        li.dataset.missionId ||
        li.dataset.deadline ||
        li.querySelector(".mission-text")?.textContent?.trim() ||
        "unknown";

    const missionName =
        li.querySelector(".mission-text")
            ?.textContent
            ?.trim() ||
        "Mission";

    /*
     * One mission occurrence =
     *
     * mission identity + logical date
     */
    const occurrenceKey =
        `${missionId}|${date}`;

    const existingEvent =
        missionHistory[date].events.find(
            event =>
                event.key === occurrenceKey
        );

    /*
     * If this occurrence has already been
     * recorded, don't create another event.
     */
    if (existingEvent) {

        /*
         * Allow an existing event to transition
         * from "missed" → "completed" only if
         * the app legitimately allows that.
         *
         * For now, keep the first recorded state.
         */
        return;
    }

    const isRecurring =
        li.dataset.repeat &&
        li.dataset.repeat !== "none";

    const isHardcore =
        li.dataset.hardcore === "true";

    let missionType = "one-time";

    if (isHardcore) {
        missionType = "hardcore";
    } else if (isRecurring) {
        missionType = "recurring";
    }

    missionHistory[date].events.push({
        key: occurrenceKey,
        missionId,
        mission: missionName,

        type: missionType,

        status,
        pointsDelta,

        timestamp:
            new Date().toISOString()
    });

    if (status === "completed") {
        missionHistory[date].completed++;
    }

    if (status === "missed") {
        missionHistory[date].missed++;
    }

    missionHistory[date].pointsDelta +=
        pointsDelta;

    localStorage.setItem(
        "missionHistory",
        JSON.stringify(missionHistory)
    );
}

/* =========================================================
   MONTHLY REPORT — METRICS ENGINE
========================================================= */

function calculateMonthMetrics(year, month) {
    const metrics = {
        completed: 0,
        missed: 0,
        activeDays: 0,
        improvementPoints: 0,
        consistency: 0
    };

    const monthPrefix =
        `${year}-${String(month + 1).padStart(2, "0")}`;

    const days =
        Object.keys(missionHistory)
            .filter(date => date.startsWith(monthPrefix));

    days.forEach(date => {
        const day = missionHistory[date];

        if (!day) return;

        metrics.completed +=
            Number(day.completed) || 0;

        metrics.missed +=
            Number(day.missed) || 0;

        metrics.improvementPoints +=
            Number(day.pointsDelta) || 0;

        /*
         * A day counts as active when
         * something actually happened.
         */
        const events =
            Array.isArray(day.events)
                ? day.events
                : [];

        if (events.length > 0) {
            metrics.activeDays++;
        }
    });

    const totalMissions =
        metrics.completed +
        metrics.missed;

    if (totalMissions > 0) {
        metrics.consistency =
            Math.round(
                (metrics.completed /
                    totalMissions) * 100
            );
    }

    return metrics;
}

