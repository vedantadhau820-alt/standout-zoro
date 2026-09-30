function shiftRecurringDeadline(li, repeat) {

    if (!li) return;

    const oldDeadline = li.dataset.deadline;

    if (!oldDeadline) return;

    const oldDate = new Date(oldDeadline);

    if (isNaN(oldDate.getTime())) return;

    let nextDeadline = new Date(oldDate);


    /* =========================
       DAILY
    ========================= */

    if (repeat === "daily") {

        nextDeadline.setDate(
            nextDeadline.getDate() + 1
        );

    }


    /* =========================
       WEEKLY
    ========================= */

    else if (repeat === "weekly") {

        nextDeadline.setDate(
            nextDeadline.getDate() + 7
        );

    }


    /* =========================
       MONTHLY
    ========================= */

    else if (repeat === "monthly") {

        const originalDay =
            nextDeadline.getDate();

        nextDeadline.setMonth(
            nextDeadline.getMonth() + 1
        );

        /*
         * Handle:
         * Jan 31 → Feb 28
         */

        if (
            nextDeadline.getDate() !==
            originalDay
        ) {
            nextDeadline.setDate(0);
        }

    }


    else {
        return;
    }


    /* =========================
       SAVE ISO-LIKE LOCAL VALUE
    ========================= */

    const year =
        nextDeadline.getFullYear();

    const month =
        String(
            nextDeadline.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            nextDeadline.getDate()
        ).padStart(2, "0");

    const hours =
        String(
            nextDeadline.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            nextDeadline.getMinutes()
        ).padStart(2, "0");

    const newDeadline =
        `${year}-${month}-${day}T${hours}:${minutes}`;


    /* =========================
       UPDATE DATA
    ========================= */

    li.dataset.deadline =
        newDeadline;


    /* =========================
       UPDATE VISIBLE DEADLINE
    ========================= */

    const deadlineDisplay =
        li.querySelector(".deadlineDisplay");

    if (deadlineDisplay) {

        deadlineDisplay.textContent =
            nextDeadline.toLocaleDateString(
                [],
                {
                    day: "numeric",
                    month: "short"
                }
            )
            + ", " +
            nextDeadline.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
    }
}


function increaseSkillXP(skillName, amount) {
    const skills = document.querySelectorAll("#skill-list .skill");

    skills.forEach(skill => {
        const name = skill.querySelector("strong").textContent.trim();

        if (name === skillName.trim()) {
            let xp = parseInt(skill.dataset.xp);
            xp = xp + amount;

            skill.dataset.xp = xp;
            skill.setAttribute("data-xp", xp);

            skill.querySelector(".xp-count").textContent = xp;
            skill.querySelector(".progress-bar").style.width = xp + "%";

            checkSkillLevelUp(skill);
            saveData(); // 🔥 force persist
        }
    });
}

/*function increaseSkillXP(skillName, amount) {
    const skills = document.querySelectorAll("#skill-list .skill");

    skills.forEach(skillDiv => {
        if (skillDiv.querySelector("strong").textContent === skillName) {

            let xp = parseInt(skillDiv.dataset.xp) + amount;
            skillDiv.dataset.xp = xp;

            checkSkillLevelUp(skillDiv);
            saveData();
        }
    });
}
*/


function checkMissionAchievements() {
    missionMilestones.forEach(m => {
        if (completedMissionCount === m) unlockAchievement("mission" + m);
    });
}

function showPopup(achievementText) {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    document.getElementById("motivationQuote").innerText = randomQuote;
    document.getElementById("achievement").innerText = achievementText;

    const popup = document.getElementById("motivationPopup");
    popup.style.display = "flex";

    if (!window.isAchievementPlaying) {
        const sound = document.getElementById("popupSound");
        sound.currentTime = 0;
        sound.volume = 1.0;
        sound.play().catch(() => { });
    }
}

function closePopup() {
    const popup = document.getElementById("motivationPopup");
    const content = popup.querySelector(".popup-content");

    content.style.animation = "fadeOut 0.3s ease forwards";

    setTimeout(() => {
        popup.style.display = "none";
        content.style.animation = "popIn 0.4s ease forwards";
    }, 300);
}


/* =========================================================
   6. SKILLS MODULE
========================================================= */
function addSkill() {
    const skill = document.getElementById("skillInput").value;
    if (!skill) return closeModal();

    const div = document.createElement("div");
    div.className = "skill show";
    div.dataset.xp = "0";
    div.dataset.level = "0";

    div.innerHTML = `
        <strong>${skill}</strong>
        <span class="skill-level">Level 0</span>

        <div class="progress">
            <div class="progress-bar" style="width:0%"></div>
        </div>

        <small>XP: <span class="xp-count">0</span></small>
        <button class="remove-btn" onclick="deleteSkillDirect(this)">Remove</button>
    `;

    document.getElementById("skill-list").appendChild(div);
    saveData();
    closeModal();
}

function deleteSkillDirect(btn) {
    const skillDiv = btn.closest(".skill");
    const skillName = skillDiv.querySelector("strong").textContent;

    customConfirm(
        `Delete skill "${skillName}"?\nLinked missions will stop giving XP.`,
        () => {
            skillDiv.remove();

            // Remove skill link from missions
            document.querySelectorAll("#mission-list li").forEach(li => {
                if (li.dataset.skill === skillName) {
                    li.dataset.skill = "";
                }
            });

            saveData();
        }
    );
}



function updateSkill() {

    const skillDiv =
        window.skillBeingEdited;

    if (!skillDiv) {
        closeModal();
        return;
    }


    const input =
        document.getElementById(
            "editSkillInput"
        );


    const oldName =
        skillDiv
            .querySelector("strong")
            .textContent
            .trim();


    const newName =
        input.value.trim();


    if (!newName) {

        customAlert(
            "Please enter a skill name."
        );

        return;
    }


    if (newName === oldName) {

        closeModal();
        return;

    }


    /* =========================================
       UPDATE SKILL NAME
    ========================================= */

    skillDiv.querySelector(
        "strong"
    ).textContent =
        newName;


    /* =========================================
       UPDATE LINKED MISSIONS
    ========================================= */

    document
        .querySelectorAll(
            "#mission-list li"
        )
        .forEach(li => {

            if (
                li.dataset.skill ===
                oldName
            ) {

                li.dataset.skill =
                    newName;

            }

        });


    saveData();

    closeModal();

    window.skillBeingEdited =
        null;
}


function checkSkillLevelUp(skillDiv) {
    let xp = parseInt(skillDiv.dataset.xp);
    let levelTag = skillDiv.querySelector(".skill-level");

    if (!levelTag) {
        console.log("❌ No level tag found. Adding automatically...");
        levelTag = document.createElement("span");
        levelTag.className = "skill-level";
        levelTag.textContent = "Level 0";
        skillDiv.insertBefore(levelTag, skillDiv.querySelector(".progress"));
    }

    let level = parseInt(levelTag.textContent.replace("Level ", ""));

    while (xp >= 100) {
        xp -= 100;
        level++;
    }

    skillDiv.dataset.xp = xp;
    levelTag.textContent = "Level " + level;

    skillDiv.querySelector(".xp-count").textContent = xp;
    skillDiv.querySelector(".progress-bar").style.width = xp + "%";
}


function deleteSkill(skillName) {
    const skills = document.querySelectorAll("#skill-list .skill");
    skills.forEach(skill => {
        if (skill.querySelector("strong").textContent === skillName) skill.remove();
    });

    saveData();
    closeModal();
}


/* =========================================================
   7. GOALS MODULE
========================================================= */

let goalsData = JSON.parse(localStorage.getItem("goalsData")) || [];

goalsData.forEach(goal => {

    if (
        !goal.createdAt ||
        !goal.eligibleAt
    ) {

        goal.createdAt = null;
        goal.eligibleAt = Date.now();

    }

});

saveGoals();

let goalTestDate = null;

function getGoalNow() {

    if (goalTestDate) {
        return goalTestDate;
    }

    return Date.now();
}

function saveGoals() {
    localStorage.setItem("goalsData", JSON.stringify(goalsData));
}

/* ---------------------------------------------------------
   GOAL REWARD
--------------------------------------------------------- */

function getGoalReward(priority) {

    if (priority === "Low") {
        return 3;
    }

    if (priority === "Medium") {
        return 7;
    }

    if (priority === "High") {
        return 15;
    }

    return 0;
}

function getGoalCommitmentDays(priority) {

    if (priority === "Low") {
        return 3;
    }

    if (priority === "Medium") {
        return 7;
    }

    if (priority === "High") {
        return 25;
    }

    return 0;
}

/* ---------------------------------------------------------
   ADD GOAL
--------------------------------------------------------- */

function addGoal() {

    const title =
        document.getElementById("goalInput").value.trim();

    const priority =
        document.getElementById("priorityInput").value;

    const deadline =
        document.getElementById("goalDeadline").value;

    if (!title) {
        closeModal();
        return;
    }

    if (!deadline) {
        customAlert("Please set a deadline.");
        return;
    }

    if (isPastDateTime(deadline)) {

        customAlert(
            "Deadline cannot be in the past."
        );

        return;
    }


    /* -----------------------------------------
       MINIMUM DEADLINE
    ----------------------------------------- */

    const createdAt =
        getGoalNow();

    const commitmentDays =
        getGoalCommitmentDays(priority);

    const eligibleAt =
        createdAt +
        (
            commitmentDays *
            24 *
            60 *
            60 *
            1000
        );

    const deadlineTime =
        new Date(deadline).getTime();

    console.log("GOAL DEADLINE TEST");
    console.log("Created:", new Date(createdAt));
    console.log("Eligible:", new Date(eligibleAt));
    console.log("Deadline:", new Date(deadlineTime));
    console.log("Difference:", deadlineTime - createdAt);
    console.log(
        "Required:",
        commitmentDays * 24 * 60 * 60 * 1000
    );


    if (deadlineTime < eligibleAt) {

        customAlert(
            `Your ${priority.toLowerCase()} priority goal must have a deadline at least ${commitmentDays} days from now.`
        );
        return;
    }


    const newGoal = {

        id: Date.now().toString(),

        title,

        priority,

        deadline,

        createdAt,

        eligibleAt,

        achieved: false,

        achievedAt: null,

        overduePenaltyApplied: false,

        warned: false

    };

    goalsData.push(newGoal);

    saveGoals();

    renderGoals();

    closeModal();
}


/* ---------------------------------------------------------
   EDIT GOAL
--------------------------------------------------------- */

function openEditGoal(goalId) {

    const goal = goalsData.find(g => g.id === goalId);

    if (!goal) return;

    // Achieved goals are permanently locked
    if (goal.achieved) {
        customAlert("Achieved goals cannot be edited.");
        return;
    }

    // High priority goals are locked
    if (goal.priority === "High") {
        customAlert("High priority goals cannot be edited.");
        return;
    }

    const content =
        document.getElementById("modal-content");

    const modal =
        document.getElementById("modal");

    modal.classList.add("active");

    content.innerHTML = `
        <h3>Edit Goal</h3>

        <input
            id="editGoalInput"
            value="${escapeHTML(goal.title)}"
            placeholder="Goal"
        >

        <label>Priority</label>

        <select id="editGoalPriority">

            <option value="Low"
                ${goal.priority === "Low" ? "selected" : ""}>
                Low
            </option>

            <option value="Medium"
                ${goal.priority === "Medium" ? "selected" : ""}>
                Medium
            </option>

        </select>

        <label>Deadline</label>

        <input
            id="editGoalDeadline"
            type="datetime-local"
            value="${goal.deadline || ""}"
        >

        <button onclick="updateGoal('${goal.id}')">
            Update
        </button>

        <button onclick="closeModal()">
            Cancel
        </button>
    `;
}


/* ---------------------------------------------------------
   UPDATE GOAL
--------------------------------------------------------- */

function updateGoal(goalId) {

    const goal = goalsData.find(g => g.id === goalId);

    if (!goal) return;

    if (goal.achieved) {
        customAlert("Achieved goals cannot be edited.");
        return;
    }

    if (goal.priority === "High") {
        customAlert("High priority goals cannot be edited.");
        return;
    }

    const newTitle =
        document.getElementById("editGoalInput")
            .value.trim();

    const newPriority =
        document.getElementById("editGoalPriority")
            .value;

    const newDeadline =
        document.getElementById("editGoalDeadline")
            .value;

    if (!newTitle) {
        customAlert("Goal name cannot be empty.");
        return;
    }

    if (!newDeadline) {
        customAlert("Please set a deadline.");
        return;
    }

    if (isPastDateTime(newDeadline)) {
        customAlert("Deadline cannot be in the past.");
        return;
    }

    /* -----------------------------------------
   MINIMUM DEADLINE
----------------------------------------- */

    const editedAt =
        getGoalNow();

    const commitmentDays =
        getGoalCommitmentDays(
            newPriority
        );

    const eligibleAt =
        editedAt +
        (
            commitmentDays *
            24 *
            60 *
            60 *
            1000
        );

    const deadlineTime =
        new Date(newDeadline).getTime();


    if (deadlineTime < eligibleAt) {

        customAlert(
            `This ${newPriority.toLowerCase()} priority goal requires at least ${commitmentDays} days before its deadline.`
        );

        return;
    }

    goal.title = newTitle;

    goal.priority = newPriority;
    goal.deadline = newDeadline;


    /* -----------------------------------------
       RESET COMMITMENT PERIOD
    ----------------------------------------- */

    const editableAt = getGoalNow();



    goal.createdAt =
        editedAt;

    goal.eligibleAt =
        editedAt +
        (
            commitmentDays *
            24 *
            60 *
            60 *
            1000
        );


    /* -----------------------------------------
       RESET DEADLINE STATE
    ----------------------------------------- */

    goal.warned = false;

    goal.overduePenaltyApplied = false;

    saveGoals();

    renderGoals();

    closeModal();
}


/* ---------------------------------------------------------
   RENDER GOALS
--------------------------------------------------------- */
function getGoalCompletionDate() {

    const date = new Date(getGoalNow());

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}


function canCompleteGoalToday() {

    const today =
        getGoalCompletionDate();

    const lastGoalCompletionDate =
        localStorage.getItem(
            "lastGoalCompletionDate"
        );

    return (
        lastGoalCompletionDate !== today
    );
}

function renderGoals() {

    const container =
        document.getElementById("goal-list");

    container.innerHTML = "";

    goalsData.forEach(goal => {

        const div =
            document.createElement("div");

        div.className = "goal show";

        div.dataset.goalId = goal.id;

        div.dataset.deadline =
            goal.deadline || "";

        if (goal.achieved) {
            div.classList.add("goal-achieved");
        }

        let formattedDeadline = "";

        if (goal.deadline) {

            const d =
                new Date(goal.deadline);

            formattedDeadline =
                d.toLocaleDateString([], {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })

        }

        const reward =
            getGoalReward(goal.priority);

        const isLocked =
            goal.achieved ||
            goal.priority === "High";

        div.innerHTML = `

            <div class="goal-header">

                <span class="goal-title">
                    ${escapeHTML(goal.title)}
                </span>

                <span class="goal-priority ${goal.priority}">
                    ${goal.priority}
                </span>

            </div>


            <div class="goal-meta">

                <span class="goal-deadline">
                    ${formattedDeadline}
                </span>

            </div>


            <div class="goal-status-row">

                <span class="goal-timer"></span>
                <span class="goal-overdue"></span>

            </div>


<div class="goal-actions">

    ${goal.achieved
                ? `
            <span class="achieved-badge">
                ✓ Achieved
            </span>
        `
                : `
            <button
    class="goal-achieve-btn"
    ${goal.eligibleAt && getGoalNow() < goal.eligibleAt
                    ? "disabled"
                    : ""
                }
    onclick="event.stopPropagation();
    markGoalAchieved('${goal.id}')"
>
    ${goal.eligibleAt && getGoalNow() < goal.eligibleAt
                    ? "Locked"
                    : "Achieve"
                }
</button>

            ${goal.priority === "High"
                    ? `
                    <span class="goal-locked">
                        🔒 Locked
                    </span>
                `
                    : `
                    <button
                        class="goal-edit-btn"
                        onclick="event.stopPropagation();
                        openEditGoal('${goal.id}')"
                    >
                        Edit
                    </button>
                `
                }

            <button
                class="goal-remove-btn"
                onclick="event.stopPropagation();
                removeGoal('${goal.id}')"
            >
                Remove
            </button>
        `
            }

</div>
        `;

        container.appendChild(div);
    });

    updateGoalTimers();
}


/* ---------------------------------------------------------
   ACHIEVE GOAL
--------------------------------------------------------- */
// function canCompleteGoalToday() {

//     const today =
//         getISTDate()
//             .toISOString()
//             .slice(0, 10);

//     const lastGoalCompletionDate =
//         localStorage.getItem(
//             "lastGoalCompletionDate"
//         );

//     return (
//         lastGoalCompletionDate !== today
//     );
// }

function markGoalAchieved(goalId) {

    const goal =
        goalsData.find(g => g.id === goalId);

    if (!goal || goal.achieved) return;

    /* -----------------------------------------
   COMMITMENT CHECK
----------------------------------------- */

    const now = getGoalNow();

    if (goal.eligibleAt && now < goal.eligibleAt) {

        const remaining =
            goal.eligibleAt - now;

        const days =
            Math.ceil(
                remaining /
                (1000 * 60 * 60 * 24)
            );

        customAlert(
            `This ${goal.priority.toLowerCase()} priority goal requires a ${getGoalCommitmentDays(goal.priority)}-day commitment.\n\n${days} day${days !== 1 ? "s" : ""} remaining.`
        );

        return;
    }


    /* -----------------------------------------
   DAILY GOAL COMPLETION LIMIT
----------------------------------------- */

    if (!canCompleteGoalToday()) {

        customAlert(
            "You can only complete one goal per day."
        );

        return;
    }

    // Safety: cannot complete overdue goals
    if (
        goal.deadline &&
        new Date(goal.deadline).getTime() <= now
    ) {
        customAlert(
            "This goal is overdue and can no longer be achieved."
        );

        return;
    }

    goal.achieved = true;

    goal.achievedAt =
        new Date().toLocaleDateString([], {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

    localStorage.setItem(
        "lastGoalCompletionDate",
        getGoalCompletionDate()
    );

    const reward =
        getGoalReward(goal.priority);

    completedMissions += reward;

    localStorage.setItem(
        "completedMissions",
        completedMissions
    );

    document.getElementById(
        "missionCounter"
    ).textContent = completedMissions;

    saveGoals();

    renderGoals();

    renderMarketplace(currentMarketplaceFilter);

    // Celebration
    // playAppTone("mint");

    playGoalAchievementVideo()

    pushNotification(
        "Goal Achieved 🎯",
        `"${goal.title}" completed • +${reward} Improvement Points`
    );

    showSmartNotification(
        "Goal Completed!",
        `+${reward} Improvement Points earned`
    );
}


/* ---------------------------------------------------------
   GOAL ACHIEVEMENT ANIMATION
--------------------------------------------------------- */

function playGoalAchievementVideo() {

    const overlay =
        document.createElement("div");

    overlay.className =
        "goal-achievement-video";

    overlay.innerHTML = `

        <div class="goal-achievement-video-content">

            <div class="goal-achievement-video-title">
                GOAL ACHIEVED
            </div>

            <div class="goal-achievement-video-frame">

                <video
                    autoplay
                    playsinline
                    preload="auto"
                >
                    <source
                        src="/AchievedGoal.mp4"
                        type="video/mp4"
                    >
                </video>

            </div>

            <button
                type="button"
                class="goal-achievement-continue"
            >
                Continue
            </button>

        </div>
    `;

    document.body.appendChild(overlay);


    const video =
        overlay.querySelector("video");

    const continueButton =
        overlay.querySelector(
            ".goal-achievement-continue"
        );


    /* =========================================
       PLAY
    ========================================= */

    video.play().catch(error => {

        console.warn(
            "Goal achievement video could not autoplay:",
            error
        );

    });


    /* =========================================
       CLOSE
    ========================================= */

    function closeVideo() {

        if (
            overlay.classList.contains(
                "closing"
            )
        ) {
            return;
        }

        video.pause();
        stopAllAppAudio();

        overlay.classList.add(
            "closing"
        );

        setTimeout(() => {

            overlay.remove();

        }, 350);
    }


    /* =========================================
       CONTINUE BUTTON
    ========================================= */

    continueButton.addEventListener(
        "click",
        closeVideo
    );


    /* =========================================
       VIDEO FINISHED
    ========================================= */

    video.addEventListener(
        "ended",
        closeVideo
    );


    /* =========================================
       VIDEO ERROR
    ========================================= */

    video.addEventListener(
        "error",
        closeVideo
    );


    /* =========================================
       SHOW
    ========================================= */

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            overlay.classList.add(
                "active"
            );

        });

    });

}


/* ---------------------------------------------------------
   GOAL TIMER + OVERDUE SYSTEM
--------------------------------------------------------- */

function updateGoalTimers() {

    const goalElements =
        document.querySelectorAll(
            "#goal-list .goal"
        );

    goalElements.forEach(el => {

        const goalId =
            el.dataset.goalId;

        const goal =
            goalsData.find(
                g => g.id === goalId
            );

        if (!goal || goal.achieved) return;

        if (!goal.deadline) return;


        const commitment =
            el.querySelector(".goal-commitment");

        const overdueBadge =
            el.querySelector(".goal-overdue");

        const achieveButton =
            el.querySelector(".goal-achieve-btn");

        /* -------------------------
   COMMITMENT PERIOD
------------------------- */

        if (
            commitment &&
            goal.eligibleAt
        ) {

            const commitmentDiff =
                goal.eligibleAt - getGoalNow();


            if (commitmentDiff > 0) {


                if (achieveButton) {
                    achieveButton.disabled = true;
                    achieveButton.textContent = "Locked";
                }

                const days =
                    Math.floor(
                        commitmentDiff /
                        (1000 * 60 * 60 * 24)
                    );

                const hours =
                    Math.floor(
                        (
                            commitmentDiff %
                            (1000 * 60 * 60 * 24)
                        ) /
                        (1000 * 60 * 60)
                    );

                if (days > 0) {

                    commitment.textContent =
                        `🔒 Commitment: ${days}d ${hours}h remaining`;

                } else {

                    commitment.textContent =
                        `🔒 Commitment: ${hours}h remaining`;

                }

            } else {

                commitment.textContent =
                    "✓ Ready to achieve";

                if (achieveButton) {
                    achieveButton.disabled = false;
                    achieveButton.textContent = "Achieve";
                }

            }

        }

        const deadline =
            new Date(goal.deadline).getTime();

        const diff =
            deadline - getGoalNow();

        const timer =
            el.querySelector(".goal-timer");




        /* -------------------------
           STILL ACTIVE
        ------------------------- */

        if (diff > 0) {

            const days =
                Math.floor(
                    diff /
                    (1000 * 60 * 60 * 24)
                );

            const hours =
                Math.floor(
                    (diff %
                        (1000 * 60 * 60 * 24)) /
                    (1000 * 60 * 60)
                );

            const minutes =
                Math.floor(
                    (diff %
                        (1000 * 60 * 60)) /
                    (1000 * 60)
                );

            if (days > 0) {

                timer.textContent =
                    `${days}d ${hours}h left`;

            } else {

                timer.textContent =
                    `${hours}h ${minutes}m left`;
            }

            overdueBadge.innerHTML = "";


            // Due soon notification
            if (
                diff <= 2 * 60 * 60 * 1000 &&
                !goal.warned
            ) {

                goal.warned = true;

                pushNotification(
                    "Goal Deadline",
                    `"${goal.title}" is due within 2 hours.`
                );

                saveGoals();
            }

            return;
        }


        /* -------------------------
           OVERDUE
        ------------------------- */

        timer.textContent = "";

        overdueBadge.innerHTML =
            `<span class="overdue-badge">
                Overdue
            </span>`;


        /*
         * PENALTY
         *
         * Only happens once.
         */

        if (!goal.overduePenaltyApplied) {

            goal.overduePenaltyApplied = true;

            const penalty =
                getGoalReward(goal.priority);

            completedMissions = Math.max(
                0,
                completedMissions - penalty
            );
            localStorage.setItem(
                "completedMissions",
                completedMissions
            );

            document.getElementById(
                "missionCounter"
            ).textContent =
                completedMissions;


            pushNotification(
                "⚠ Goal Failed",
                `"${goal.title}" expired. -${penalty} Improvement Points`
            );


            showSmartNotification(
                "Goal Overdue",
                `-${penalty} Improvement Points`
            );


            saveGoals();

            renderMarketplace(
                currentMarketplaceFilter
            );
        }
    });
}


/* ---------------------------------------------------------
   REMOVE GOAL
--------------------------------------------------------- */

function removeGoal(goalId) {

    const goal =
        goalsData.find(g => g.id === goalId);

    if (!goal) return;

    // Achieved = permanent


    customConfirm(
        `Remove "${goal.title}"?`,
        () => {

            goalsData =
                goalsData.filter(
                    g => g.id !== goalId
                );

            saveGoals();

            renderGoals();
        }
    );
}


/* ---------------------------------------------------------
   SAFE TEXT
--------------------------------------------------------- */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ---------------------------------------------------------
   GOAL TIMER
--------------------------------------------------------- */

setInterval(
    updateGoalTimers,
    1000
);

/* =========================================================
   8. COUNTDOWNS MODULE
========================================================= */
let countdowns = JSON.parse(localStorage.getItem("countdowns")) || [];

function saveCountdowns() {
    localStorage.setItem("countdowns", JSON.stringify(countdowns));
}

function addCountdown() {
    const titleInput = document.getElementById("countdownTitle");
    const timeInput = document.getElementById("countdownDateTime");

    const title = titleInput.value.trim();
    const dateTime = timeInput.value;

    // ❌ EMPTY CHECK
    if (!title || !dateTime) {
        closeModal();
        return;
    }

    // ❌ PAST TIME CHECK (HARD STOP)
    if (isPastDateTime(dateTime)) {
        customAlert("Countdown time cannot be in the past.");
        return; // 🔥 DO NOT CONTINUE
    }

    const [datePart, timePart] =
    dateTime.split("T");

const targetIST =
    new Date(
        `${datePart}T${timePart}:00+05:30`
    );

countdowns.push({
    title,
    date: targetIST.toISOString(),
    startTime: new Date().toISOString()
});

    saveCountdowns();
    renderCountdowns();

    // 🔥 CLEANUP
    titleInput.value = "";
    timeInput.value = "";

    closeModal();
}





function removeCountdown(index) {
    countdowns.splice(index, 1);
    saveCountdowns();
    renderCountdowns();
}

function renderCountdowns() {
    const list = document.getElementById("countdown-list");
    const counter = document.getElementById("countdownCounter");

    if (!list) return;

    list.innerHTML = "";

    if (counter) {
        counter.textContent = countdowns.length;
    }

    list.innerHTML = "";

    document.getElementById("countdownCounter").textContent = countdowns.length;

    if (countdowns.length === 0) {
        list.textContent = "No countdowns added";
        return;
    }

    countdowns.forEach((c, index) => {
        const div = document.createElement("div");
        div.className = "goal show";

        div.innerHTML = `
      <strong>${c.title}</strong>
      <div class="timer-row">
  <div class="timer-bar-container">
    <div class="timer-bar" id="timerbar-${index}"></div>
  </div>
  <div class="timer-text" id="timer-${index}"></div>
</div>
      <button class="remove-btn2" onclick="removeCountdown(${index})">Remove</button>
    `;

        list.appendChild(div);
    });

    updateTimers();
}


function updateTimers() {
    clearInterval(window.timerInterval);

    window.timerInterval = setInterval(() => {
        countdowns.forEach((c, index) => {
            const now = new Date().getTime();
            const target = new Date(c.date).getTime();
            const diff = target - now;

            const totalDuration = target - new Date(countdowns[index].startTime || c.date).getTime();
            const remaining = diff;

            let percent = (remaining / totalDuration) * 100;

            // clamp values
            if (percent < 0) percent = 0;
            if (percent > 100) percent = 100;

            const bar = document.getElementById(`timerbar-${index}`);
            if (bar) bar.style.width = percent + "%";
            // Notify when 1 hour left
            if (diff > 0 && diff <= 60 * 60 * 1000 && !c.warned) {
                c.warned = true;
                pushNotification("Countdown Ending Soon", `"${c.title}" ends in 1 hour`);
            }


            const el = document.getElementById(`timer-${index}`);
            if (!el) return;

            if (diff <= 0) {
                el.style.color = "red";
                el.textContent = "Time's up!";
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            el.textContent = `${days}d ${hours}h ${mins}m ${secs}s`;
        });
    }, 1000);
}




/* =========================================================
   9. RESET & DATA MANAGEMENT
========================================================= */
function saveData() {
    localStorage.setItem(
    "completedMissionCount",
    completedMissionCount
);
    localStorage.setItem("missionHistory", JSON.stringify(missionHistory));
    // Save deducted flag on missions
    document.querySelectorAll("#mission-list li").forEach(li => {
        if (li.dataset.deducted) {
            li.setAttribute("data-deducted", "true");
        }
    });


    // 🔥 STORE XP INTO HTML ATTRIBUTES
    document.querySelectorAll("#skill-list .skill").forEach(skill => {
        skill.setAttribute("data-xp", skill.dataset.xp || "0");
    });

    localStorage.setItem("missions", document.getElementById("mission-list").innerHTML);
    localStorage.setItem("skills", document.getElementById("skill-list").innerHTML);
    localStorage.setItem("goals", document.getElementById("goal-list").innerHTML);

    document.querySelectorAll("#mission-list li").forEach(li => {
        if (li.dataset.overdueNotified) {
            li.setAttribute("data-overdue-notified", "true");
        }
    });

}

function loadData() {

    /* =====================================================
       SYNC IMPROVEMENT POINTS FROM STORAGE
    ===================================================== */

    completedMissions = Math.max(
        0,
        Number(
            localStorage.getItem(
                "completedMissions"
            )
        ) || 0
    );

    try {
        const storedHistory =
            localStorage.getItem("missionHistory");

        missionHistory =
            storedHistory
                ? JSON.parse(storedHistory)
                : {};

    } catch (error) {
        console.warn(
            "Could not load mission history:",
            error
        );

        missionHistory = {};
    }


    document.getElementById("mission-list").innerHTML =
        localStorage.getItem("missions") || "";
    document.getElementById("skill-list").innerHTML =
        localStorage.getItem("skills") || "";
    document.getElementById("goal-list").innerHTML =
        localStorage.getItem("goals") || "";

    // --- FIX MISSIONS AFTER LOADING ---
    document.querySelectorAll("#mission-list li").forEach(li => {

        // 1. Ensure overdueMark exists
        if (!li.querySelector(".overdueMark")) {
            const span = document.createElement("span");
            span.className = "overdueMark";
            li.appendChild(span);
        }

        // 2. Ensure deadlineDisplay exists
        if (!li.querySelector(".deadlineDisplay")) {
            const dspan = document.createElement("span");
            dspan.className = "deadlineDisplay";
            li.appendChild(dspan);
        }

        // 3. Restore deadline
        const savedDeadline = li.getAttribute("data-deadline");
        if (savedDeadline) li.dataset.deadline = savedDeadline;

        // 4. Restore deducted flag
        if (li.getAttribute("data-deducted") === "true") {
            li.dataset.deducted = "true";
        }

        // 5. Restore overdue notification flag
        if (li.getAttribute("data-overdue-notified") === "true") {
            li.dataset.overdueNotified = "true";
        }

        // ===============================
        // 🔥 HARDCORE MODE RESTORE (NEW)
        // ===============================
        if (li.getAttribute("data-hardcore") === "true") {
            li.dataset.hardcore = "true";
        }

        if (li.getAttribute("data-hardcore-punished") === "true") {
            li.dataset.hardcorePunished = "true";
        }
        // ===============================

        // 6. Reattach edit modal click
        li.addEventListener("click", (e) => {
            if (e.target.classList.contains("complete-btn")) return;
            openModal("edit-mission", li);
        });
    });

    // ---- SKILLS ----
    document.querySelectorAll("#skill-list .skill").forEach(div => {
        div.addEventListener("click", () => openModal("edit-skill", div));
        div.classList.add("show");
    });

    // ---- GOALS ----
    document.querySelectorAll("#goal-list .goal").forEach(div => {
        div.classList.add("show");
        const removeBtn = div.querySelector(".remove-btn");
        if (removeBtn) {
            removeBtn.onclick = () => removeGoal(removeBtn);
        }
    });

    // ---- SKILL XP ----
    document.querySelectorAll("#skill-list .skill").forEach(skill => {
        const xp = parseInt(skill.getAttribute("data-xp") || "0");
        skill.dataset.xp = xp;
        skill.querySelector(".xp-count").textContent = xp;
        skill.querySelector(".progress-bar").style.width = xp + "%";
    });

    const missionCounter =
        document.getElementById("missionCounter");

    if (missionCounter) {
        missionCounter.textContent =
            completedMissions;
    }
}

/* =========================================================
   COMPLETE APP RESET
   EVERYTHING → FACTORY STATE
========================================================= */

/* =========================================================
   COMPLETE APP RESET
   EVERYTHING → FACTORY STATE
========================================================= */

/* =========================================================
   COMPLETE APP RESET
   EVERYTHING → FACTORY STATE
========================================================= */

async function resetData() {

    try {

        /* =====================================================
           1. STOP ACTIVE AUDIO
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
           2. DELETE CUSTOM AUDIO DATABASE
        ===================================================== */

        try {

            if (
                typeof deleteCustomAudioDatabase ===
                "function"
            ) {

                await deleteCustomAudioDatabase();

            }

        } catch (error) {

            console.warn(
                "Could not reset custom audio:",
                error
            );

        }


        /* =====================================================
           3. RESET SOUND SETTINGS
        ===================================================== */

        localStorage.removeItem(
            "standout_sound_settings"
        );


        if (
            typeof DEFAULT_SOUND_SETTINGS !==
            "undefined"
        ) {

            soundSettings = {
                ...DEFAULT_SOUND_SETTINGS
            };

        }


        /* =====================================================
           4. RESET ALL LOCAL STORAGE
        ===================================================== */

        localStorage.clear();

        ownedCards = {};

        /* =====================================================
   RESET SEASON
   Full app reset → Season returns to factory state.
===================================================== */

        if (
            window.StandOutSeason &&
            typeof window.StandOutSeason.resetSeason === "function"
        ) {
            try {
                window.StandOutSeason.resetSeason();

                console.log("✓ Season state reset.");

            } catch (error) {

                console.warn(
                    "Could not reset Season state:",
                    error
                );

            }
        }


        /* =====================================================
           5. RESET MISSION HISTORY
        ===================================================== */

        /*
         * IMPORTANT:
         *
         * Monthly reports are calculated directly from
         * missionHistory.
         *
         * Clearing LocalStorage alone is not enough because
         * missionHistory already exists in memory.
         */

        missionHistory = {};


        localStorage.removeItem(
            "missionHistory"
        );


        /* =====================================================
           6. RESET BACKGROUND
        ===================================================== */

        const backgroundStorageKeys = [

            "customBackground",
            "customBackgroundImage",
            "backgroundImage",
            "backgroundImageData",
            "background",
            "appBackground",
            "customBg",
            "customBgImage",
            "backgroundSettings",
            "backgroundOpacity",
            "backgroundBlur"

        ];


        backgroundStorageKeys.forEach(
            key => {

                try {

                    localStorage.removeItem(
                        key
                    );

                } catch (error) {

                    console.warn(
                        "Could not remove background key:",
                        key,
                        error
                    );

                }

            }
        );


        /* =====================================================
           7. RESET BACKGROUND CSS VARIABLES
        ===================================================== */

        document.documentElement.style.removeProperty(
            "--custom-background"
        );

        document.documentElement.style.removeProperty(
            "--background-image"
        );

        document.documentElement.style.removeProperty(
            "--background-opacity"
        );

        document.documentElement.style.removeProperty(
            "--background-blur"
        );

        document.documentElement.style.removeProperty(
            "--bg-image"
        );

        document.documentElement.style.removeProperty(
            "--app-background"
        );


        /* =====================================================
           8. RESET BODY BACKGROUND
        ===================================================== */

        document.body.style.backgroundImage =
            "";

        document.body.style.backgroundSize =
            "";

        document.body.style.backgroundPosition =
            "";

        document.body.style.backgroundRepeat =
            "";

        document.body.style.backgroundAttachment =
            "";

        document.body.style.backgroundColor =
            "";


        /* =====================================================
           9. RESET BACKGROUND LAYERS
        ===================================================== */

        const backgroundLayer =
            document.getElementById(
                "customBackgroundLayer"
            );


        if (backgroundLayer) {

            backgroundLayer.style.backgroundImage =
                "";

            backgroundLayer.style.opacity =
                "";

            backgroundLayer.style.filter =
                "";

        }


        const backgroundOverlay =
            document.getElementById(
                "customBackgroundOverlay"
            );


        if (backgroundOverlay) {

            backgroundOverlay.style.opacity =
                "";

            backgroundOverlay.style.background =
                "";

            backgroundOverlay.style.filter =
                "";

            backgroundOverlay.style.backdropFilter =
                "";

        }


        document
            .querySelectorAll(
                ".custom-background, .background-layer, .app-background, .background-image-layer"
            )
            .forEach(
                element => {

                    element.remove();

                }
            );


        /* =====================================================
           10. RESET CARD CATALOG
           Keep only built-in cards.
        ===================================================== */

        if (
            Array.isArray(
                window.cardCatalog
            )
        ) {

            window.cardCatalog =
                window.cardCatalog.filter(
                    card =>
                        !card.custom
                );

        }


        /* =====================================================
           11. RESET TIMER
        ===================================================== */

        if (
            window.timerInterval
        ) {

            clearInterval(
                window.timerInterval
            );

            window.timerInterval =
                null;

        }


        /* =====================================================
           12. RESET PREVIEW / AUDIO REFERENCES
        ===================================================== */

        if (
            typeof activeTone !==
            "undefined"
        ) {

            activeTone = null;

        }


        if (
            typeof previewAudio !==
            "undefined"
        ) {

            previewAudio = null;

        }


        if (
            typeof previewType !==
            "undefined"
        ) {

            previewType = null;

        }


        /* =====================================================
           13. RESET UI LISTS
        ===================================================== */

        const missionList =
            document.getElementById(
                "mission-list"
            );


        const skillList =
            document.getElementById(
                "skill-list"
            );


        const goalList =
            document.getElementById(
                "goal-list"
            );


        const countdownList =
            document.getElementById(
                "countdown-list"
            );


        if (missionList) {

            missionList.innerHTML =
                "";

        }


        if (skillList) {

            skillList.innerHTML =
                "";

        }


        if (goalList) {

            goalList.innerHTML =
                "";

        }


        if (countdownList) {

            countdownList.innerHTML =
                "";

        }


        /* =====================================================
           14. RESET COUNTERS
        ===================================================== */

        const missionCounter =
            document.getElementById(
                "missionCounter"
            );


        const countdownCounter =
            document.getElementById(
                "countdownCounter"
            );


        if (missionCounter) {

            missionCounter.textContent =
                "0";

        }


        if (countdownCounter) {

            countdownCounter.textContent =
                "0";

        }


        /* =====================================================
           15. RESET NOTIFICATIONS UI
        ===================================================== */

        const notificationList =
            document.getElementById(
                "notificationList"
            );


        if (notificationList) {

            notificationList.innerHTML =
                `<p style="opacity:.6;">
                    No notifications
                </p>`;

        }


        const notificationBadge =
            document.getElementById(
                "notifyBadge"
            );


        if (notificationBadge) {

            notificationBadge.style.display =
                "none";

            notificationBadge.textContent =
                "";

        }


        /* =====================================================
           16. RESET CUSTOM CARD MANAGER
        ===================================================== */

        const customCardsManager =
            document.getElementById(
                "customCardsManager"
            );


        if (customCardsManager) {

            customCardsManager.innerHTML =
                `
                <div class="custom-cards-empty">
                    You haven't created any
                    custom cards yet.
                </div>
                `;

        }


        /* =====================================================
           17. RESET MONTHLY SUMMARY
        ===================================================== */

        const monthlySummaryTitle =
            document.getElementById(
                "monthlySummaryTitle"
            );


        const monthlySummaryText =
            document.getElementById(
                "monthlySummaryText"
            );


        const monthlySummaryCompletion =
            document.getElementById(
                "monthlySummaryCompletion"
            );


        const monthlySummaryConsistency =
            document.getElementById(
                "monthlySummaryConsistency"
            );


        const monthlySummaryGoals =
            document.getElementById(
                "monthlySummaryGoals"
            );


        const monthlyConsistency =
            document.getElementById(
                "monthlyConsistency"
            );


        const monthlyCompleted =
            document.getElementById(
                "monthlyCompleted"
            );


        const monthlyMissed =
            document.getElementById(
                "monthlyMissed"
            );


        const monthlyActiveDays =
            document.getElementById(
                "monthlyActiveDays"
            );


        const monthlyImprovementPoints =
            document.getElementById(
                "monthlyImprovementPoints"
            );


        if (monthlySummaryTitle) {

            monthlySummaryTitle.textContent =
                new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1
                ).toLocaleDateString(
                    [],
                    {
                        month: "long"
                    }
                );

        }


        if (monthlySummaryText) {

            monthlySummaryText.textContent =
                "No summary available yet.";

        }


        if (monthlySummaryCompletion) {

            monthlySummaryCompletion.textContent =
                "0%";

        }


        if (monthlySummaryConsistency) {

            monthlySummaryConsistency.textContent =
                "0%";

        }


        if (monthlySummaryGoals) {

            monthlySummaryGoals.textContent =
                "0/0";

        }


        if (monthlyConsistency) {

            monthlyConsistency.textContent =
                "0%";

        }


        if (monthlyCompleted) {

            monthlyCompleted.textContent =
                "0";

        }


        if (monthlyMissed) {

            monthlyMissed.textContent =
                "0";

        }


        if (monthlyActiveDays) {

            monthlyActiveDays.textContent =
                "0";

        }


        if (monthlyImprovementPoints) {

            monthlyImprovementPoints.textContent =
                "0";

        }


        /* =====================================================
           18. RESET MONTHLY ACTIVITY CALENDAR
        ===================================================== */

        const monthlyActivityCalendar =
            document.getElementById(
                "monthlyActivityCalendar"
            );


        if (monthlyActivityCalendar) {

            monthlyActivityCalendar.innerHTML =
                "";

        }


        /* =====================================================
           19. RESET MONTHLY GRAPH
        ===================================================== */

        const monthlyConsistencyGraph =
            document.getElementById(
                "monthlyConsistencyGraph"
            );


        if (monthlyConsistencyGraph) {

            monthlyConsistencyGraph.innerHTML =
                "";

        }


        /* =====================================================
           20. RESET MONTHLY GOALS / MOMENTUM
        ===================================================== */

        const monthlyGoals =
            document.getElementById(
                "monthlyGoals"
            );


        if (monthlyGoals) {

            monthlyGoals.innerHTML =
                "";

        }


        const monthlyMomentum =
            document.getElementById(
                "monthlyMomentum"
            );


        if (monthlyMomentum) {

            monthlyMomentum.innerHTML =
                "";

        }


        /* =====================================================
           21. RESET MARKETPLACE
        ===================================================== */

        if (
            typeof renderMarketplace ===
            "function"
        ) {

            renderMarketplace(
                "ALL"
            );

        }


        if (
            typeof renderMyCards ===
            "function"
        ) {

            renderMyCards();

        }


        /* =====================================================
           22. RESET ACHIEVEMENTS
        ===================================================== */

        if (
            typeof renderAchievements ===
            "function"
        ) {

            renderAchievements();

        }


        /* =====================================================
           23. RESET CUSTOM CARD CONTROLS
        ===================================================== */

        if (
            typeof initializeCustomCardGradeControls ===
            "function"
        ) {

            initializeCustomCardGradeControls();

        }


        /* =====================================================
           24. RESET SOUND UI
        ===================================================== */

        if (
            typeof renderSoundSettings ===
            "function"
        ) {

            try {

                renderSoundSettings();

            } catch (error) {

                console.warn(
                    "Could not reset sound UI:",
                    error
                );

            }

        }


        /* =====================================================
           25. RESET MONTHLY REPORT STORAGE
        ===================================================== */

        const monthlyStorageKeys = [

            "monthlyReport",
            "monthlyReports",
            "monthlySummary",
            "monthlySummaryData",
            "monthlyReportData",
            "monthlyGoals",
            "monthlyMomentum",
            "monthlyStats",
            "monthlyHistory"

        ];


        monthlyStorageKeys.forEach(
            key => {

                try {

                    localStorage.removeItem(
                        key
                    );

                } catch (error) {

                    console.warn(
                        "Could not remove monthly key:",
                        key,
                        error
                    );

                }

            }
        );


        /* =====================================================
           26. RESET MONTHLY RUNTIME VARIABLES
        ===================================================== */

        if (
            typeof monthlyReportData !==
            "undefined"
        ) {

            monthlyReportData = null;

        }


        if (
            typeof monthlySummaryData !==
            "undefined"
        ) {

            monthlySummaryData = null;

        }


        if (
            typeof monthlyStats !==
            "undefined"
        ) {

            monthlyStats = {};

        }


        /* =====================================================
           27. RESET NOTIFICATION BADGE
        ===================================================== */

        if (
            typeof updateNotificationBadge ===
            "function"
        ) {

            updateNotificationBadge();

        }


        /* =====================================================
   28. RESET COMPLETE
===================================================== */

        console.log(
            "✓ COMPLETE APP RESET"
        );

        reloadAfterAlert = true;

        customAlert(
            "Reset completed. Please Reopen The App."
        );

    } catch (error) {

        console.error(
            "Complete reset failed:",
            error
        );

        customAlert(
            "Reset failed. Check the console."
        );

    }

}



function isPastDateTime(dateTimeValue) {
    if (!dateTimeValue) return false; // allow empty deadlines
    return new Date(dateTimeValue).getTime() < Date.now();
}


/* =========================================================
   10. INITIALIZATION
========================================================= */
window.addEventListener("load", () => {
    loadData();
    enforceDailyReset();
    if (
        typeof window.refreshDailyChallenge ===
        "function"
    ) {
        window.refreshDailyChallenge();
    }
    renderMarketplace();
    refreshRecurringMissions();
    checkMissedDeadlines();
    renderAchievements();
    renderCountdowns();
    renderGoals();

    /* =====================================================
       MONTHLY REPORT
    ===================================================== */

    if (
        typeof renderMonthlyReport ===
        "function"
    ) {
        renderMonthlyReport();
    }


    setTimeout(() => {

        cacheAllMusic();

    }, 1000);


    const activePage = document.querySelector("section.active")
        ? document.querySelector("section.active").id
        : "missions";

    showPage(activePage);
});

document.querySelectorAll("#goal-list .goal").forEach(div => {
    div.classList.add("show");
    const removeBtn = div.querySelector(".remove-btn");
    if (removeBtn) {
        removeBtn.onclick = () => removeGoal(removeBtn);
    }
});

//Cheats

let resetHoldTimer = null;
const RESET_HOLD_DURATION = 5000; // 5 seconds

const resetBtn = document.getElementById("resetDataBtn"); // your reset button ID

resetBtn.addEventListener("touchstart", startResetHold);
resetBtn.addEventListener("mousedown", startResetHold);

resetBtn.addEventListener("touchend", cancelResetHold);
resetBtn.addEventListener("mouseup", cancelResetHold);
resetBtn.addEventListener("mouseleave", cancelResetHold);

function startResetHold() {
    resetHoldTimer = setTimeout(() => {
        openCheatModal();
        if (navigator.vibrate) navigator.vibrate(80);
    }, RESET_HOLD_DURATION);
}

function cancelResetHold() {
    clearTimeout(resetHoldTimer);
}
function openCheatModal() {
    const modal = document.getElementById("cheatModal");
    modal.classList.add("active");

    if (input) input.value;

    setTimeout(() => {
        document.getElementById("cheatInput").focus();
    }, 150);
}

function closeCheatModal() {
    document.getElementById("cheatModal").classList.remove("active");
}

function confirmCheat() {
    const code = document.getElementById("cheatInput").value.trim();

    if (code !== "Thala") {
        customAlert("Invalid cheat code.");
        return;
    }
    if (navigator.vibrate) navigator.vibrate(80);
    // ✅ CHEAT SUCCESS
    completedMissions = 9999;
    dailyImprovementCount = 0;

    localStorage.setItem("completedMissions", completedMissions);
    document.getElementById("missionCounter").textContent = completedMissions;

    document.getElementById("cheatInput").value = "";

    closeCheatModal();

    showSmartNotification(
        "Cheat Activated",
        "9999 Improvement Points granted."
    );
}

function skipDayCheat() {
    // Get current logical day
    const currentDay = lastImprovementDate
        ? new Date(lastImprovementDate)
        : new Date();

    // Move +1 day
    currentDay.setDate(currentDay.getDate() + 1);

    const nextDayKey = currentDay.toISOString().slice(0, 10);

    // Apply skip
    lastImprovementDate = nextDayKey;
    dailyImprovementCount = 0;

    localStorage.setItem("lastImprovementDate", nextDayKey);
    localStorage.setItem("dailyImprovementCount", "0");

    closeCheatModal();

    showSmartNotification(
        "⏭ Day Skipped",
        `New day activated (${nextDayKey})`
    );

    console.log("⏭ Day skipped to:", nextDayKey);
};


// New After August 2026

/* =========================================================
   FULL CARD MINT REVEAL
========================================================= */

function showMintedCard(card) {
    if (!card) return;

    document.getElementById("mintReveal")?.remove();

    const overlay = document.createElement("div");

    overlay.id = "mintReveal";

    overlay.innerHTML = `
        <div class="mint-reveal-content">

            <div class="mint-reveal-label">
                CARD MINTED
            </div>

            <div class="mint-card-stage">

                <div class="mint-card-light"></div>

                <img
                    class="mint-reveal-image"
                    src="${card.image}"
                    alt="${card.title}"
                >

            </div>

            <div class="mint-reveal-earned">
                YOU EARNED THIS
            </div>

            <h2 class="mint-reveal-title">
                ${card.title}
            </h2>

            <p class="mint-reveal-quote">
                ${card.quote || ""}
            </p>

            <button
                class="mint-reveal-close"
                onclick="closeMintedCard()"
            >
                Continue
            </button>

        </div>
    `;

    document.body.appendChild(overlay);

    // Start animation
    requestAnimationFrame(() => {
        overlay.classList.add("show");
    });


    playAppTone("mint");


    // Close by tapping outside
    overlay.addEventListener("click", e => {

        if (e.target === overlay) {
            closeMintedCard();
        }

    });
}


function closeMintedCard() {

    const reveal =
        document.getElementById("mintReveal");

    if (!reveal) return;

    reveal.classList.remove("show");

    setTimeout(() => {
        reveal.remove();
    }, 300);
}


window.showMintedCard =
    showMintedCard;

window.closeMintedCard =
    closeMintedCard;

/* =========================================================
   CUSTOM CARD CREATOR
========================================================= */

let customCardImageData = "";


/* =========================================================
   OPEN MODAL
========================================================= */

function openCustomCardModal() {

    const modal =
        document.getElementById(
            "customCardModal"
        );

    if (!modal) return;

    modal.classList.add("active");

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeCustomCardModal() {

    const modal =
        document.getElementById(
            "customCardModal"
        );

    if (!modal) return;

    modal.classList.remove("active");

}


/* =========================================================
   IMAGE PICKER
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const picker =
            document.getElementById(
                "customCardImagePicker"
            );

        const input =
            document.getElementById(
                "customCardImage"
            );


        if (picker && input) {

            picker.addEventListener(
                "click",
                () => {

                    input.click();

                }
            );


            input.addEventListener(
                "change",
                event => {

                    const file =
                        event.target.files?.[0];

                    if (!file) return;


                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {

                        customAlert(
                            "Please choose an image."
                        );

                        return;

                    }



                    const reader = new FileReader();

                    reader.onload = () => {

                        const img = new Image();

                        img.onload = () => {

                            const MAX_SIZE = 1000;

                            let width = img.width;
                            let height = img.height;


                            /* Keep aspect ratio */

                            if (width > MAX_SIZE || height > MAX_SIZE) {

                                if (width > height) {

                                    height =
                                        Math.round(
                                            height *
                                            (MAX_SIZE / width)
                                        );

                                    width = MAX_SIZE;

                                } else {

                                    width =
                                        Math.round(
                                            width *
                                            (MAX_SIZE / height)
                                        );

                                    height = MAX_SIZE;

                                }

                            }


                            const canvas =
                                document.createElement(
                                    "canvas"
                                );

                            canvas.width = width;
                            canvas.height = height;


                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );


                            ctx.drawImage(
                                img,
                                0,
                                0,
                                width,
                                height
                            );


                            /*
                             * Convert to compressed JPEG.
                             * This dramatically reduces IndexedDB usage.
                             */

                            customCardImageData =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.82
                                );


                            const preview =
                                document.getElementById(
                                    "customCardImagePreview"
                                );

                            const placeholder =
                                document.getElementById(
                                    "customCardImagePlaceholder"
                                );


                            if (preview) {

                                preview.src =
                                    customCardImageData;

                                preview.style.display =
                                    "block";

                            }


                            if (placeholder) {

                                placeholder.style.display =
                                    "none";

                            }

                        };


                        img.onerror = () => {

                            console.error(
                                "Could not process card image."
                            );

                            customCardImageData = "";

                            customAlert(
                                "Could not process this image."
                            );

                        };


                        img.src =
                            reader.result;

                    };

                    reader.readAsDataURL(file);

                }
            );

        }


        /* =================================================
           LIMITED TOGGLE
        ================================================= */

        const limited =
            document.getElementById(
                "customCardLimited"
            );

        const expirationGroup =
            document.getElementById(
                "customCardExpirationGroup"
            );


        if (
            limited &&
            expirationGroup
        ) {

            limited.addEventListener(
                "change",
                () => {

                    expirationGroup.style.display =
                        limited.checked
                            ? "block"
                            : "none";

                }
            );

        }

    }
);


/* =========================================================
   CREATE CARD
   STEP 1 ONLY
========================================================= */

/* =========================================================
   CREATE / EDIT CUSTOM CARD
========================================================= */

async function createCustomCard() {

    const title =
        document.getElementById(
            "customCardTitle"
        )?.value.trim();

    const quote =
        document.getElementById(
            "customCardQuote"
        )?.value.trim();

    const grade =
        document.getElementById(
            "customCardGrade"
        )?.value || "A";

    const cost =
        Number(
            document.getElementById(
                "customCardCost"
            )?.value
        );

    const limited =
        document.getElementById(
            "customCardLimited"
        )?.checked || false;

    const expiresAt =
        document.getElementById(
            "customCardExpiresAt"
        )?.value || null;


    /* =====================================================
       VALIDATION
    ===================================================== */

    const imageData =
        window.customCardImageData ||
        customCardImageData ||
        "";


    /*
     * New cards require artwork.
     * Edited cards can reuse their existing artwork.
     */

    if (!imageData) {

        customAlert(
            "Please choose card artwork."
        );

        return;

    }


    if (!title) {

        customAlert(
            "Please enter a card title."
        );

        return;

    }


    if (!quote) {

        customAlert(
            "Please enter a quote."
        );

        return;

    }


    if (
        !Number.isFinite(cost) ||
        cost < 0
    ) {

        customAlert(
            "Please enter a valid card cost."
        );

        return;

    }


    const costRanges = {

        E: { min: 5, max: 14 },
        D: { min: 15, max: 24 },
        C: { min: 25, max: 49 },
        B: { min: 50, max: 79 },
        A: { min: 80, max: 150 },
        S: { min: 151, max: 200 }

    };

    const range =
        costRanges[grade];

    if (!range) {

        customAlert(
            "Invalid card grade."
        );

        return;
    }

    if (
        !Number.isFinite(cost) ||
        cost < range.min ||
        cost > range.max
    ) {

        customAlert(
            `${grade} cards must cost between ${range.min} and ${range.max} points.`
        );

        return;
    }


    /* =====================================================
       CREATE OR UPDATE ID
    ===================================================== */

    const existingCard =
        window.customCardEditId || null;

    if (existingCard) {

        const ownedCards =
            JSON.parse(
                localStorage.getItem("ownedCards") ||
                "{}"
            );

        if (ownedCards[existingCard]) {

            customAlert(
                "Owned cards cannot be edited."
            );

            return;

        }

    }

    if (
        existingCard &&
        grade === "W"
    ) {

        customAlert(
            "Limited Edition cards cannot be edited."
        );

        return;

    }


    const card = {

        id:
            existingCard ||
            `custom_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 8)}`,

        title,

        quote,

        grade,

        cost,

        image:
            imageData,

        limited: false,

        expiresAt: null,

        custom:
            true

    };


    /* =====================================================
       SAVE TO INDEXEDDB
    ===================================================== */

    try {

        await saveCustomCard(
            card
        );

    } catch (error) {

        console.error(
            "Failed to save custom card:",
            error
        );

        customAlert(
            "Could not save the card."
        );

        return;

    }


    /* =====================================================
       UPDATE CURRENT CATALOG
    ===================================================== */

    window.cardCatalog =
        (window.cardCatalog || [])
            .filter(
                existing =>
                    existing.id !== card.id
            );


    window.cardCatalog.push(
        card
    );


    /* =====================================================
       REFRESH MARKETPLACE
    ===================================================== */

    if (
        typeof renderMarketplace ===
        "function"
    ) {

        renderMarketplace(
            window.currentMarketplaceFilter ||
            "ALL"
        );

    }


    /* =====================================================
       REFRESH CUSTOM CARD MANAGER
    ===================================================== */

    if (
        typeof renderCustomCardsManager ===
        "function"
    ) {

        await renderCustomCardsManager();

    }


    /* =====================================================
       CLOSE
    ===================================================== */

    closeCustomCardModal();


    /* =====================================================
       RESET
    ===================================================== */

    resetCustomCardForm();


    window.customCardEditId =
        null;


    /* =====================================================
       SUCCESS
    ===================================================== */

    customAlert(
        existingCard
            ? `"${title}" updated successfully.`
            : `"${title}" added to the marketplace.`
    );

}

function resetCustomCardForm() {

    customCardImageData = "";

    const title =
        document.getElementById(
            "customCardTitle"
        );

    const quote =
        document.getElementById(
            "customCardQuote"
        );

    const cost =
        document.getElementById(
            "customCardCost"
        );

    const image =
        document.getElementById(
            "customCardImagePreview"
        );

    const placeholder =
        document.getElementById(
            "customCardImagePlaceholder"
        );

    const file =
        document.getElementById(
            "customCardImage"
        );

    const expirationGroup =
        document.getElementById(
            "customCardExpirationGroup"
        );


    if (title) title.value = "";

    if (quote) quote.value = "";

    if (cost) cost.value = "";

    const grade =
        document.getElementById(
            "customCardGrade"
        );

    if (grade) {

        grade.value = "A";

        grade.disabled = false;

    }

    if (file) file.value = "";


    if (expirationGroup) {
        expirationGroup.style.display = "none";
    }

    if (image) {

        image.src = "";

        image.style.display =
            "none";

    }

    if (placeholder) {

        placeholder.style.display =
            "flex";

    }

}

function updateCustomCardCostRange() {

    const grade =
        document.getElementById(
            "customCardGrade"
        );

    const cost =
        document.getElementById(
            "customCardCost"
        );

    if (!grade || !cost) {
        return;
    }


    const ranges = {

        E: {
            min: 5,
            max: 14
        },

        D: {
            min: 15,
            max: 24
        },

        C: {
            min: 25,
            max: 49
        },

        B: {
            min: 50,
            max: 79
        },

        A: {
            min: 80,
            max: 150
        },

        S: {
            min: 151,
            max: 200
        }

    };


    const range =
        ranges[grade.value];

    if (!range) {
        return;
    }


    cost.min =
        range.min;

    cost.max =
        range.max;


    /*
     * If the current value is outside
     * the selected grade's range,
     * automatically move it into range.
     */

    const current =
        Number(cost.value);


    if (
        !Number.isFinite(current) ||
        current < range.min
    ) {

        cost.value =
            range.min;

    } else if (
        current > range.max
    ) {

        cost.value =
            range.max;

    }


    cost.placeholder =
        `${range.min}–${range.max}`;
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const grade =
            document.getElementById(
                "customCardGrade"
            );

        if (!grade) {
            return;
        }


        grade.addEventListener(
            "change",
            updateCustomCardCostRange
        );


        updateCustomCardCostRange();

    }
);

/* =========================================================
   ACHIEVED GOAL — LONG PRESS DELETE
========================================================= */

let achievedGoalPressTimer = null;
let achievedGoalPressId = null;
let achievedGoalPressElement = null;


/* ---------------------------------------------------------
   START LONG PRESS
--------------------------------------------------------- */

document.addEventListener("pointerdown", function (event) {

    const goalElement =
        event.target.closest(
            "#goal-list .goal.goal-achieved"
        );

    if (!goalElement) return;

    const goalId =
        goalElement.dataset.goalId;

    if (!goalId) return;


    achievedGoalPressId = goalId;

    achievedGoalPressElement =
        goalElement;


    achievedGoalPressTimer =
        setTimeout(function () {

            achievedGoalPressTimer = null;

            showAchievedGoalDeleteConfirmation(
                achievedGoalPressId
            );

        }, 800);

});


/* ---------------------------------------------------------
   CANCEL LONG PRESS
--------------------------------------------------------- */

function cancelAchievedGoalLongPress() {

    if (achievedGoalPressTimer !== null) {

        clearTimeout(
            achievedGoalPressTimer
        );

        achievedGoalPressTimer = null;
    }

    achievedGoalPressId = null;
    achievedGoalPressElement = null;
}


document.addEventListener(
    "pointerup",
    cancelAchievedGoalLongPress
);

document.addEventListener(
    "pointercancel",
    cancelAchievedGoalLongPress
);

document.addEventListener(
    "pointerleave",
    cancelAchievedGoalLongPress
);


/* ---------------------------------------------------------
   CONFIRM DELETE
--------------------------------------------------------- */

function showAchievedGoalDeleteConfirmation(
    goalId
) {

    const goal =
        goalsData.find(
            g => g.id === goalId
        );


    if (!goal || !goal.achieved) {
        return;
    }


    customConfirm(
    `Delete "${goal.title}"?\n\nThis achieved goal will be permanently removed.`,
    function () {
        deleteAchievedGoal(goalId);
    }
);
}


/* ---------------------------------------------------------
   DELETE ACHIEVED GOAL
--------------------------------------------------------- */

function deleteAchievedGoal(
    goalId
) {

    const goal =
        goalsData.find(
            g => g.id === goalId
        );


    if (!goal) return;


    // Safety: only achieved goals
    if (!goal.achieved) {
        return;
    }


    goalsData =
        goalsData.filter(
            g => g.id !== goalId
        );


    saveGoals();

    renderGoals();

}
