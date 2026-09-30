/* =========================================================
   MASTERY SYSTEM
   Stand Out
========================================================= */

const MASTERY_STORAGE_KEY =
    "standout_masteries";

let masteries = [];


/* =========================================================
   STORAGE
========================================================= */

function loadMasteries() {

    try {

        const stored =
            localStorage.getItem(
                MASTERY_STORAGE_KEY
            );

        if (!stored) {
            masteries = [];
            return;
        }

        const parsed =
            JSON.parse(stored);

        masteries =
            Array.isArray(parsed)
                ? parsed
                : [];

    } catch (error) {

        console.warn(
            "Could not load Masteries:",
            error
        );

        masteries = [];

    }

}


function saveMasteries() {

    try {

        localStorage.setItem(
            MASTERY_STORAGE_KEY,
            JSON.stringify(masteries)
        );

    } catch (error) {

        console.warn(
            "Could not save Masteries:",
            error
        );

    }

}


/* =========================================================
   CREATE MASTERY
========================================================= */

function createMastery(
    title,
    description = "",
    milestones = []
) {

    /* =============================================
       MAXIMUM 2 MASTERIES
    ============================================= */

    if (masteries.length >= 2) {

    openMasteryLimitModal();

    return null;
}
    title =
        String(title || "").trim();

    description =
        String(description || "").trim();


    if (!title) {
        return null;
    }


    const mastery = {

        id:
            "mastery_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 8),

        title,

        description,

        createdAt:
            new Date().toISOString(),

        completedAt:
            null,

        completed:
            false,

        milestones:
            milestones
                .map(
                    milestone => ({

                        id:
                            "milestone_" +
                            Date.now() +
                            "_" +
                            Math.random()
                                .toString(36)
                                .slice(2, 7),

                        title:
                            String(
                                milestone || ""
                            ).trim(),

                        completed:
                            false,

                        completedAt:
                            null,

                        evidence:
                            ""

                    })
                )
                .filter(
                    milestone =>
                        milestone.title
                )

    };


    /* =============================================
       ADD — DO NOT REPLACE
    ============================================= */

    masteries.push(
        mastery
    );


    saveMasteries();

    renderMasteries();


    return mastery;

}

/* =========================================================
   DELETE MASTERY
========================================================= */

function deleteMastery(
    masteryId
) {

    const index =
        masteries.findIndex(
            mastery =>
                mastery.id === masteryId
        );


    if (index === -1) {
        return;
    }


    masteries.splice(
        index,
        1
    );


    saveMasteries();

    renderMasteries();

}


/* =========================================================
   COMPLETE MILESTONE
========================================================= */

function completeMasteryMilestone(
    masteryId,
    milestoneId
) {

    const mastery =
        masteries.find(
            item =>
                item.id === masteryId
        );


    if (!mastery) {
        return;
    }


    const milestone =
        mastery.milestones.find(
            item =>
                item.id === milestoneId
        );


    if (!milestone) {
        return;
    }


    if (milestone.completed) {
        return;
    }


    milestone.completed =
        true;

    milestone.completedAt =
        new Date().toISOString();


    checkMasteryCompletion(
        mastery
    );


    saveMasteries();

    renderMasteries();

}


/* =========================================================
   UNCOMPLETE MILESTONE
========================================================= */

function uncompleteMasteryMilestone(
    masteryId,
    milestoneId
) {

    const mastery =
        masteries.find(
            item =>
                item.id === masteryId
        );


    if (!mastery) {
        return;
    }


    const milestone =
        mastery.milestones.find(
            item =>
                item.id === milestoneId
        );


    if (!milestone) {
        return;
    }


    milestone.completed =
        false;

    milestone.completedAt =
        null;


    mastery.completed =
        false;

    mastery.completedAt =
        null;


    saveMasteries();

    renderMasteries();

}


/* =========================================================
   CHECK MASTERY COMPLETION
========================================================= */

function checkMasteryCompletion(
    mastery
) {

    if (
        !mastery.milestones.length
    ) {

        mastery.completed =
            false;

        mastery.completedAt =
            null;

        return;

    }


    const allCompleted =
        mastery.milestones.every(
            milestone =>
                milestone.completed
        );


    if (allCompleted) {

        mastery.completed =
            true;

        mastery.completedAt =
            new Date().toISOString();

    }

}


/* =========================================================
   PROGRESS
========================================================= */

function getMasteryProgress(
    mastery
) {

    const total =
        mastery.milestones.length;


    if (!total) {
        return 0;
    }


    const completed =
        mastery.milestones.filter(
            milestone =>
                milestone.completed
        ).length;


    return Math.round(
        (
            completed /
            total
        ) * 100
    );

}


/* =========================================================
   MILESTONE COUNT
========================================================= */

function getMasteryMilestoneCount(
    mastery
) {

    const total =
        mastery.milestones.length;


    const completed =
        mastery.milestones.filter(
            milestone =>
                milestone.completed
        ).length;


    return {
        completed,
        total
    };

}


/* =========================================================
   MASTERY STAGE
========================================================= */

function getMasteryStage(
    mastery
) {

    const progress =
        getMasteryProgress(
            mastery
        );


    if (progress === 0) {
        return "Not Started";
    }

    if (progress < 25) {
        return "Exploring";
    }

    if (progress < 50) {
        return "Developing";
    }

    if (progress < 75) {
        return "Advancing";
    }

    if (progress < 100) {
        return "Near Mastery";
    }

    return "Mastered";

}


/* =========================================================
   FIND MASTERY
========================================================= */

function getMastery(
    masteryId
) {

    return masteries.find(
        mastery =>
            mastery.id === masteryId
    ) || null;

}


/* =========================================================
   GET ALL MASTERIES
========================================================= */

function getAllMasteries() {

    return [
        ...masteries
    ];

}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeMastery() {

    loadMasteries();

    renderMasteries();

}


/* =========================================================
   RENDER
========================================================= */

function renderMasteries() {

    const container =
        document.getElementById(
            "mastery-list"
        );

    if (!container) {
        console.warn(
            "Mastery list container not found."
        );
        return;
    }


    if (!masteries.length) {

        container.innerHTML = `

            <div class="mastery-empty">

                <div class="mastery-empty-icon">
                    +
                </div>

                <strong>
                    No Masteries Yet
                </strong>

                <span>
                    Choose something you want
                    to become exceptionally good at.
                </span>

                <button
                    type="button"
                    class="mastery-empty-add-btn"
                    onclick="openMasteryModal()"
                >
                    CREATE MASTERY
                </button>

            </div>

        `;

        return;
    }


    container.innerHTML =
        masteries
            .map(
                mastery =>
                    renderMasteryCard(
                        mastery
                    )
            )
            .join("");

}


/* =========================================================
   RENDER CARD
========================================================= */

function renderMasteryCard(
    mastery
) {

    const progress =
        getMasteryProgress(
            mastery
        );


    const counts =
        getMasteryMilestoneCount(
            mastery
        );


    const stage =
        getMasteryStage(
            mastery
        );


    return `

        <article
            class="
                mastery-card
                ${mastery.completed
            ? "mastered"
            : ""
        }
            "
        >

            <div
                class="mastery-card-header"
            >
            

                <div>

                    <span
                        class="mastery-eyebrow"
                    >
                        MASTERY
                    </span>

                    <h3>
                        ${escapeMasteryHTML(
            mastery.title
        )}
                    </h3>

                </div>
                


                <span
                    class="mastery-stage"
                >
                    ${stage}
                </span>
                <div class="mastery-card-actions">

    <button
        type="button"
        class="mastery-action-btn"
        onclick="openMasteryEditModal('${mastery.id}')"
        aria-label="Edit Mastery"
    >
        ⋯
    </button>

<button
    type="button"
    class="mastery-add-btn"
    onclick="openMasteryModal()"
    aria-label="Create another Mastery"
>
    +
</button>

</div>

            </div>


            ${mastery.description

            ? `
                        <p
                            class="mastery-description"
                        >
                            ${escapeMasteryHTML(
                mastery.description
            )}
                        </p>
                    `

            : ""
        }


            <div
                class="mastery-progress-row"
            >

                <strong>
                    ${progress}%
                </strong>

                <span>
                    ${counts.completed}
                    /
                    ${counts.total}
                    milestones
                </span>

            </div>


            <div
                class="mastery-progress"
            >

                <div
                    class="mastery-progress-fill"
                    style="
                        width:${progress}%;
                    "
                ></div>

            </div>


            <div
                class="mastery-milestones"
            >

                ${mastery.milestones
            .map(
                milestone =>
                    renderMasteryMilestone(
                        mastery,
                        milestone
                    )
            )
            .join("")
        }

            </div>

        </article>

    `;

}


/* =========================================================
   RENDER MILESTONE
========================================================= */

function renderMasteryMilestone(
    mastery,
    milestone
) {

    return `

        <button
            type="button"
            class="
                mastery-milestone
                ${milestone.completed
            ? "completed"
            : ""
        }
            "
            onclick="
                ${milestone.completed

            ? `uncompleteMasteryMilestone(
                            '${mastery.id}',
                            '${milestone.id}'
                        )`

            : `completeMasteryMilestone(
                            '${mastery.id}',
                            '${milestone.id}'
                        )`
        }
            "
        >

            <span
                class="mastery-milestone-check"
            >
                ${milestone.completed
            ? "✓"
            : ""
        }
            </span>


            <span
                class="mastery-milestone-title"
            >
                ${escapeMasteryHTML(
            milestone.title
        )}
            </span>

        </button>

    `;

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeMasteryHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.createMastery =
    createMastery;

window.deleteMastery =
    deleteMastery;

window.completeMasteryMilestone =
    completeMasteryMilestone;

window.uncompleteMasteryMilestone =
    uncompleteMasteryMilestone;

window.getMastery =
    getMastery;

window.getAllMasteries =
    getAllMasteries;

window.getMasteryProgress =
    getMasteryProgress;


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeMastery
);

/* =========================================================
   MASTERY CREATION MODAL
========================================================= */

function openMasteryModal() {

    const modal =
        document.getElementById("mastery-modal");

    if (!modal) {
        return;
    }

    const title =
        document.getElementById("mastery-title");

    const description =
        document.getElementById("mastery-description");

    const inputs =
        document.getElementById("mastery-milestone-inputs");

    const error =
        document.getElementById("mastery-form-error");


    /* =============================================
       ALWAYS RESET THE CREATION FORM
    ============================================= */

    if (title) {
        title.value = "";
    }

    if (description) {
        description.value = "";
    }

    if (inputs) {
        inputs.innerHTML = "";
    }

    if (error) {
        error.textContent = "";
    }


    /* =============================================
       CREATE FRESH MILESTONE FIELDS
    ============================================= */

    addMasteryMilestoneInput();
    addMasteryMilestoneInput();


    /* =============================================
       OPEN MODAL
    ============================================= */

    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    setTimeout(() => {

        if (title) {
            title.focus();
        }

    }, 100);

}


function closeMasteryModal() {

    const modal =
        document.getElementById(
            "mastery-modal"
        );

    if (!modal) {
        return;
    }


    modal.classList.remove(
        "open"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   ADD MILESTONE INPUT
========================================================= */

function addMasteryMilestoneInput() {

    const container =
        document.getElementById(
            "mastery-milestone-inputs"
        );

    if (!container) {
        return;
    }


    const currentCount =
        container.querySelectorAll(
            ".mastery-milestone-input-row"
        ).length;


    /*
     * Prevent excessive milestones.
     */

    if (currentCount >= 12) {
        return;
    }


    const row =
        document.createElement(
            "div"
        );

    row.className =
        "mastery-milestone-input-row";


    row.innerHTML = `

        <span class="mastery-milestone-number">
            ${currentCount + 1}
        </span>

        <input
            type="text"
            class="mastery-milestone-input"
            maxlength="120"
            placeholder="Milestone ${currentCount + 1}"
            autocomplete="off"
        >

        <button
            type="button"
            class="mastery-remove-milestone"
            aria-label="Remove milestone"
        >
            ×
        </button>

    `;


    const removeButton =
        row.querySelector(
            ".mastery-remove-milestone"
        );


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            () => {

                row.remove();

                renumberMasteryMilestones();

            }
        );

    }


    container.appendChild(
        row
    );

}


/* =========================================================
   RENUMBER MILESTONES
========================================================= */

function renumberMasteryMilestones() {

    const container =
        document.getElementById(
            "mastery-milestone-inputs"
        );

    if (!container) {
        return;
    }


    const rows =
        container.querySelectorAll(
            ".mastery-milestone-input-row"
        );


    rows.forEach(
        (row, index) => {

            const number =
                row.querySelector(
                    ".mastery-milestone-number"
                );

            const input =
                row.querySelector(
                    ".mastery-milestone-input"
                );


            if (number) {

                number.textContent =
                    index + 1;

            }


            if (input) {

                input.placeholder =
                    `Milestone ${index + 1}`;

            }

        }
    );

}


/* =========================================================
   SUBMIT MASTERY
========================================================= */

function submitMasteryCreation() {

    const titleInput =
        document.getElementById(
            "mastery-title"
        );

    const descriptionInput =
        document.getElementById(
            "mastery-description"
        );

    const error =
        document.getElementById(
            "mastery-form-error"
        );


    const title =
        titleInput
            ? titleInput.value.trim()
            : "";


    const description =
        descriptionInput
            ? descriptionInput.value.trim()
            : "";


    if (!title) {

        if (error) {

            error.textContent =
                "Give your Mastery a name.";

        }

        return;

    }


    const milestoneInputs =
        document.querySelectorAll(
            "#mastery-milestone-inputs .mastery-milestone-input"
        );


    const milestones =
        Array.from(
            milestoneInputs
        )
            .map(
                input =>
                    input.value.trim()
            )
            .filter(
                value =>
                    value.length > 0
            );


    if (!milestones.length) {

        if (error) {

            error.textContent =
                "Add at least one milestone.";

        }

        return;

    }


    createMastery(
        title,
        description,
        milestones
    );


    closeMasteryModal();

}


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.openMasteryModal =
    openMasteryModal;

window.closeMasteryModal =
    closeMasteryModal;

window.addMasteryMilestoneInput =
    addMasteryMilestoneInput;

window.submitMasteryCreation =
    submitMasteryCreation;

    /* =========================================================
   EDIT MASTERY
========================================================= */

function openMasteryEditModal(masteryId) {

    const mastery =
        getMastery(masteryId);

    if (!mastery) {
        return;
    }


    const modal =
        document.getElementById(
            "mastery-edit-modal"
        );

    const idInput =
        document.getElementById(
            "mastery-edit-id"
        );

    const titleInput =
        document.getElementById(
            "mastery-edit-title"
        );

    const descriptionInput =
        document.getElementById(
            "mastery-edit-description"
        );

    const milestonesContainer =
        document.getElementById(
            "mastery-edit-milestones"
        );

    const error =
        document.getElementById(
            "mastery-edit-error"
        );


    if (!modal) {
        return;
    }


    if (idInput) {
        idInput.value = mastery.id;
    }

    if (titleInput) {
        titleInput.value = mastery.title;
    }

    if (descriptionInput) {
        descriptionInput.value =
            mastery.description || "";
    }

    if (error) {
        error.textContent = "";
    }


    if (milestonesContainer) {

        milestonesContainer.innerHTML = "";

        mastery.milestones.forEach(
            milestone => {

                addEditMasteryMilestone(
                    milestone
                );

            }
        );

    }


    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeMasteryEditModal() {

    const modal =
        document.getElementById(
            "mastery-edit-modal"
        );

    if (!modal) {
        return;
    }


    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}

/* =========================================================
   EDIT MILESTONE INPUT
========================================================= */

function addEditMasteryMilestone(
    existingMilestone = null
) {

    const container =
        document.getElementById(
            "mastery-edit-milestones"
        );

    if (!container) {
        return;
    }


    const count =
        container.querySelectorAll(
            ".mastery-milestone-input-row"
        ).length;


    if (count >= 12) {
        return;
    }


    const row =
        document.createElement("div");

    row.className =
        "mastery-milestone-input-row";


    row.dataset.milestoneId =
        existingMilestone
            ? existingMilestone.id
            : "";


    row.innerHTML = `

        <span class="mastery-milestone-number">
            ${count + 1}
        </span>

        <input
            type="text"
            class="mastery-milestone-input"
            maxlength="120"
            placeholder="Milestone ${count + 1}"
            value="${
                existingMilestone
                    ? escapeMasteryHTML(
                        existingMilestone.title
                    )
                    : ""
            }"
            autocomplete="off"
        >

        <button
            type="button"
            class="mastery-remove-milestone"
            aria-label="Remove milestone"
        >
            ×
        </button>

    `;


    const removeButton =
        row.querySelector(
            ".mastery-remove-milestone"
        );


    removeButton.addEventListener(
        "click",
        () => {

            row.remove();

            renumberEditMasteryMilestones();

        }
    );


    container.appendChild(row);

}


function renumberEditMasteryMilestones() {

    const container =
        document.getElementById(
            "mastery-edit-milestones"
        );

    if (!container) {
        return;
    }


    container
        .querySelectorAll(
            ".mastery-milestone-input-row"
        )
        .forEach(
            (row, index) => {

                const number =
                    row.querySelector(
                        ".mastery-milestone-number"
                    );

                const input =
                    row.querySelector(
                        ".mastery-milestone-input"
                    );


                if (number) {
                    number.textContent =
                        index + 1;
                }

                if (input) {
                    input.placeholder =
                        `Milestone ${index + 1}`;
                }

            }
        );

}


window.addEditMasteryMilestone =
    addEditMasteryMilestone;

    /* =========================================================
   SAVE MASTERY EDITS
========================================================= */

function saveMasteryEdits() {

    const id =
        document.getElementById(
            "mastery-edit-id"
        )?.value;


    const mastery =
        getMastery(id);


    if (!mastery) {
        return;
    }


    const title =
        document.getElementById(
            "mastery-edit-title"
        )?.value.trim();


    const description =
        document.getElementById(
            "mastery-edit-description"
        )?.value.trim();


    const error =
        document.getElementById(
            "mastery-edit-error"
        );


    if (!title) {

        if (error) {
            error.textContent =
                "Give your Mastery a name.";
        }

        return;

    }


    const rows =
        document.querySelectorAll(
            "#mastery-edit-milestones " +
            ".mastery-milestone-input-row"
        );


    const updatedMilestones = [];


    rows.forEach(row => {

        const input =
            row.querySelector(
                ".mastery-milestone-input"
            );


        const text =
            input
                ? input.value.trim()
                : "";


        if (!text) {
            return;
        }


        const existingId =
            row.dataset.milestoneId;


        /*
         * Preserve the original milestone ID
         * whenever possible.
         */

        const oldMilestone =
            existingId
                ? mastery.milestones.find(
                    item =>
                        item.id ===
                        existingId
                )
                : null;


        updatedMilestones.push({

            id:
                oldMilestone
                    ? oldMilestone.id
                    : (
                        "milestone_" +
                        Date.now() +
                        "_" +
                        Math.random()
                            .toString(36)
                            .slice(2, 8)
                    ),

            title:
                text,

            completed:
                oldMilestone
                    ? oldMilestone.completed
                    : false,

            completedAt:
                oldMilestone
                    ? oldMilestone.completedAt
                    : null,

            evidence:
                oldMilestone
                    ? oldMilestone.evidence || ""
                    : ""

        });

    });


    if (!updatedMilestones.length) {

        if (error) {
            error.textContent =
                "Add at least one milestone.";
        }

        return;

    }


    mastery.title =
        title;

    mastery.description =
        description;

    mastery.milestones =
        updatedMilestones;


    /*
     * Recalculate completion after editing.
     */

    checkMasteryCompletion(
        mastery
    );


    saveMasteries();

    renderMasteries();

    closeMasteryEditModal();

}

window.openMasteryEditModal =
    openMasteryEditModal;

window.closeMasteryEditModal =
    closeMasteryEditModal;

window.saveMasteryEdits =
    saveMasteryEdits;

    /* =========================================================
   DELETE MASTERY CONFIRMATION
========================================================= */

function openDeleteMasteryModal() {

    const editId =
        document.getElementById(
            "mastery-edit-id"
        );

    const deleteModal =
        document.getElementById(
            "mastery-delete-modal"
        );


    if (!editId || !deleteModal) {
        return;
    }


    if (!editId.value) {
        return;
    }


    deleteModal.dataset.masteryId =
        editId.value;


    deleteModal.classList.add(
        "open"
    );

    deleteModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeDeleteMasteryModal() {

    const modal =
        document.getElementById(
            "mastery-delete-modal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "open"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    delete modal.dataset.masteryId;

}


function confirmDeleteMastery() {

    const modal =
        document.getElementById(
            "mastery-delete-modal"
        );


    if (!modal) {
        return;
    }


    const masteryId =
        modal.dataset.masteryId;


    if (!masteryId) {
        return;
    }


    /*
     * Use the existing delete function.
     */

    deleteMastery(
        masteryId
    );


    closeDeleteMasteryModal();

    closeMasteryEditModal();

}


window.openDeleteMasteryModal =
    openDeleteMasteryModal;

window.closeDeleteMasteryModal =
    closeDeleteMasteryModal;

window.confirmDeleteMastery =
    confirmDeleteMastery;

  function renderMasteryMilestone(
    mastery,
    milestone
) {

    return `

        <div
            class="
                mastery-milestone-wrapper
                ${
                    milestone.completed
                        ? "completed"
                        : ""
                }
            "
        >

            <button
                type="button"
                class="mastery-milestone"
                onclick="
                    ${
                        milestone.completed

                            ? `uncompleteMasteryMilestone(
                                '${mastery.id}',
                                '${milestone.id}'
                            )`

                            : `completeMasteryMilestone(
                                '${mastery.id}',
                                '${milestone.id}'
                            )`
                    }
                "
            >

                <span
                    class="mastery-milestone-check"
                >
                    ${
                        milestone.completed
                            ? "✓"
                            : ""
                    }
                </span>


                <span
                    class="mastery-milestone-title"
                >
                    ${escapeMasteryHTML(
                        milestone.title
                    )}
                </span>

            </button>


            ${
                milestone.completed

                    ? `
                        <div
                            id="evidence-${mastery.id}-${milestone.id}"
                            class="mastery-evidence"
                        >

                            <button
                                type="button"
                                class="mastery-evidence-btn"
                                onclick="
                                    openMasteryEvidence(
                                        '${mastery.id}',
                                        '${milestone.id}'
                                    )
                                "
                            >
                                ${
                                    milestone.evidence
                                        ? "View Evidence"
                                        : "Add Evidence"
                                }
                            </button>


                            ${
                                milestone.evidence

                                    ? `
                                        <p
                                            class="mastery-evidence-preview"
                                        >
                                            ${escapeMasteryHTML(
                                                milestone.evidence
                                            )}
                                        </p>
                                    `

                                    : ""
                            }

                        </div>
                    `

                    : ""
            }

        </div>

    `;

}

/* =========================================================
   EVIDENCE
========================================================= */

function toggleMasteryEvidence(
    masteryId,
    milestoneId
) {

    const evidence =
        document.getElementById(
            `evidence-${masteryId}-${milestoneId}`
        );

    if (!evidence) {
        return;
    }

    evidence.classList.toggle("show");

}


/* =========================================================
   EVIDENCE MODAL
========================================================= */

let activeEvidenceMasteryId = null;
let activeEvidenceMilestoneId = null;


function openMasteryEvidence(
    masteryId,
    milestoneId
) {

    const mastery =
        getMastery(masteryId);

    if (!mastery) {
        return;
    }


    const milestone =
        mastery.milestones.find(
            item =>
                item.id === milestoneId
        );

    if (!milestone) {
        return;
    }


    const modal =
        document.getElementById(
            "mastery-evidence-modal"
        );

    const title =
        document.getElementById(
            "mastery-evidence-title"
        );

    const milestoneTitle =
        document.getElementById(
            "mastery-evidence-milestone"
        );

    const input =
        document.getElementById(
            "mastery-evidence-input"
        );

    const error =
        document.getElementById(
            "mastery-evidence-error"
        );


    if (!modal || !input) {
        return;
    }


    activeEvidenceMasteryId =
        masteryId;

    activeEvidenceMilestoneId =
        milestoneId;


    if (title) {

        title.textContent =
            milestone.evidence
                ? "Edit Evidence"
                : "Add Evidence";

    }


    if (milestoneTitle) {

        milestoneTitle.textContent =
            milestone.title;

    }


    input.value =
        milestone.evidence || "";


    if (error) {
        error.textContent = "";
    }


    updateMasteryEvidenceCounter();


    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    setTimeout(() => {

        input.focus();

        input.setSelectionRange(
            input.value.length,
            input.value.length
        );

    }, 150);

}


function closeMasteryEvidenceModal() {

    const modal =
        document.getElementById(
            "mastery-evidence-modal"
        );

    if (!modal) {
        return;
    }


    modal.classList.remove(
        "open"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    activeEvidenceMasteryId =
        null;

    activeEvidenceMilestoneId =
        null;

}

window.toggleMasteryEvidence =
    toggleMasteryEvidence;

window.openMasteryEvidence =
    openMasteryEvidence;


    /* =========================================================
   SAVE EVIDENCE
========================================================= */

function saveMasteryEvidence() {

    if (
        !activeEvidenceMasteryId ||
        !activeEvidenceMilestoneId
    ) {
        return;
    }


    const mastery =
        getMastery(
            activeEvidenceMasteryId
        );

    if (!mastery) {
        return;
    }


    const milestone =
        mastery.milestones.find(
            item =>
                item.id ===
                activeEvidenceMilestoneId
        );

    if (!milestone) {
        return;
    }


    const input =
        document.getElementById(
            "mastery-evidence-input"
        );

    const error =
        document.getElementById(
            "mastery-evidence-error"
        );


    const evidence =
        input
            ? input.value.trim()
            : "";


    if (!evidence) {

        if (error) {

            error.textContent =
                "Add some evidence before saving.";

        }

        return;

    }


    milestone.evidence =
        evidence;


    saveMasteries();

    renderMasteries();

    closeMasteryEvidenceModal();

}

/* =========================================================
   EVIDENCE CHARACTER COUNTER
========================================================= */

function updateMasteryEvidenceCounter() {

    const input =
        document.getElementById(
            "mastery-evidence-input"
        );

    const counter =
        document.getElementById(
            "mastery-evidence-count"
        );


    if (!input || !counter) {
        return;
    }


    counter.textContent =
        input.value.length;

}


document.addEventListener(
    "input",
    event => {

        if (
            event.target.id ===
            "mastery-evidence-input"
        ) {

            updateMasteryEvidenceCounter();

        }

    }
);

window.openMasteryEvidence =
    openMasteryEvidence;

window.closeMasteryEvidenceModal =
    closeMasteryEvidenceModal;

window.saveMasteryEvidence =
    saveMasteryEvidence;

/* =========================================================
   MASTERY LIMIT ALERT
========================================================= */

function openMasteryLimitModal() {

    const modal =
        document.getElementById(
            "mastery-limit-modal"
        );

    if (!modal) {
        return;
    }

    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeMasteryLimitModal() {

    const modal =
        document.getElementById(
            "mastery-limit-modal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


window.openMasteryLimitModal =
    openMasteryLimitModal;

window.closeMasteryLimitModal =
    closeMasteryLimitModal;

