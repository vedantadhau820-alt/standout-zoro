/* =========================================================
   CUSTOM CARDS
   IndexedDB + Marketplace Integration
========================================================= */

const CUSTOM_CARD_DB_NAME = "standout-custom-cards";
const CUSTOM_CARD_DB_VERSION = 1;
const CUSTOM_CARD_STORE = "cards";

let customCardDB = null;


/* =========================================================
   OPEN DATABASE
========================================================= */

function openCustomCardDB() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            CUSTOM_CARD_DB_NAME,
            CUSTOM_CARD_DB_VERSION
        );


        request.onupgradeneeded = event => {

            const db = event.target.result;

            if (
                !db.objectStoreNames.contains(
                    CUSTOM_CARD_STORE
                )
            ) {

                db.createObjectStore(
                    CUSTOM_CARD_STORE,
                    {
                        keyPath: "id"
                    }
                );

            }

        };


        request.onsuccess = event => {

            customCardDB =
                event.target.result;

            resolve(customCardDB);

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}


/* =========================================================
   SAVE CARD
========================================================= */

function saveCustomCard(card) {

    return new Promise(async (resolve, reject) => {

        try {

            const db =
                customCardDB ||
                await openCustomCardDB();


            if (
                !db.objectStoreNames.contains(
                    CUSTOM_CARD_STORE
                )
            ) {

                throw new Error(
                    "Custom card object store does not exist."
                );

            }


            const transaction =
                db.transaction(
                    CUSTOM_CARD_STORE,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    CUSTOM_CARD_STORE
                );


            const request =
                store.put(card);


            request.onerror = () => {

                reject(
                    request.error ||
                    new Error(
                        "IndexedDB put failed."
                    )
                );

            };


            transaction.oncomplete = () => {

                resolve(card);

            };


            transaction.onerror = () => {

                reject(
                    transaction.error ||
                    new Error(
                        "IndexedDB transaction failed."
                    )
                );

            };


            transaction.onabort = () => {

                reject(
                    transaction.error ||
                    new Error(
                        "IndexedDB transaction aborted."
                    )
                );

            };

        } catch (error) {

            reject(error);

        }

    });

}


/* =========================================================
   GET ALL CUSTOM CARDS
========================================================= */

function getCustomCards() {

    return new Promise(async (resolve, reject) => {

        try {

            const db =
                customCardDB ||
                await openCustomCardDB();


            const transaction =
                db.transaction(
                    CUSTOM_CARD_STORE,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    CUSTOM_CARD_STORE
                );


            const request =
                store.getAll();


            request.onsuccess = () => {

                resolve(
                    request.result || []
                );

            };


            request.onerror = () => {

                reject(
                    request.error
                );

            };

        } catch (error) {

            reject(error);

        }

    });

}


/* =========================================================
   DELETE CUSTOM CARD
========================================================= */

function deleteCustomCard(id) {

    return new Promise(async (resolve, reject) => {

        try {

            const db =
                customCardDB ||
                await openCustomCardDB();


            const transaction =
                db.transaction(
                    CUSTOM_CARD_STORE,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    CUSTOM_CARD_STORE
                );


            store.delete(id);


            transaction.oncomplete = () => {

                resolve();

            };


            transaction.onerror = () => {

                reject(
                    transaction.error
                );

            };

        } catch (error) {

            reject(error);

        }

    });

}


/* =========================================================
   LOAD CUSTOM CARDS INTO MARKETPLACE
========================================================= */

async function loadCustomCardsIntoMarketplace() {

    try {

        const customCards =
            await getCustomCards();


        /*
         * Remove old injected custom cards.
         */

        window.cardCatalog =
            (window.cardCatalog || [])
                .filter(
                    card => !card.custom
                );


        /*
         * Add saved custom cards.
         */

        window.cardCatalog.push(
            ...customCards
        );


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
         * Refresh owned cards if available.
         */

        if (
            typeof renderMyCards ===
            "function"
        ) {

            renderMyCards();

        }

    } catch (error) {

        console.error(
            "Failed to load custom cards:",
            error
        );

    }

}


/* =========================================================
   LIMITED EDITION CONTROLLER
========================================================= */

function initializeCustomCardGradeControls() {

    const limited =
        document.getElementById(
            "customCardLimited"
        );


    const grade =
        document.getElementById(
            "customCardGrade"
        );


    const expirationGroup =
        document.getElementById(
            "customCardExpirationGroup"
        );


    if (
        !limited ||
        !grade ||
        !expirationGroup
    ) {

        return;

    }


    /* =====================================================
       MAKE SURE W EXISTS
    ===================================================== */

    if (
        !grade.querySelector(
            'option[value="W"]'
        )
    ) {

        const wOption =
            document.createElement(
                "option"
            );

        wOption.value = "W";
        wOption.textContent = "W";

        grade.appendChild(
            wOption
        );

    }


    /* =====================================================
       TOGGLE
    ===================================================== */

    limited.addEventListener(
        "change",
        () => {

            if (
                limited.checked
            ) {

                /*
                 * Limited Edition = W
                 */

                grade.value = "W";

                grade.disabled = true;


                expirationGroup.style.display =
                    "block";

            } else {

                /*
                 * Normal card
                 */

                grade.disabled = false;


                if (
                    grade.value === "W"
                ) {

                    grade.value = "A";

                }


                expirationGroup.style.display =
                    "none";

            }

        }
    );


    /*
     * Apply correct initial state.
     */

    if (
        limited.checked
    ) {

        grade.value = "W";

        grade.disabled = true;

        expirationGroup.style.display =
            "block";

    } else {

        grade.disabled = false;

        expirationGroup.style.display =
            "none";

    }

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /* ================================================
           DATABASE
        ================================================ */

        try {

            await openCustomCardDB();

            await loadCustomCardsIntoMarketplace();

        } catch (error) {

            console.error(
                "Custom card database failed:",
                error
            );

        }


        /* ================================================
           GRADE / LIMITED CONTROLS
        ================================================ */

        initializeCustomCardGradeControls();

    }
);


/* =========================================================
   GLOBALS
========================================================= */

window.openCustomCardDB =
    openCustomCardDB;

window.saveCustomCard =
    saveCustomCard;

window.getCustomCards =
    getCustomCards;

window.deleteCustomCard =
    deleteCustomCard;

window.loadCustomCardsIntoMarketplace =
    loadCustomCardsIntoMarketplace;

window.initializeCustomCardGradeControls =
    initializeCustomCardGradeControls;

/* =========================================================
CUSTOM CARD MANAGER
========================================================= */

async function renderCustomCardsManager() {

    const container =
        document.getElementById(
            "customCardsManager"
        );

    if (!container) {
        return;
    }


    container.innerHTML = "";


    let cards = [];


    /* =====================================================
       LOAD CUSTOM CARDS
    ===================================================== */

    try {

        cards =
            await getCustomCards();

    } catch (error) {

        console.error(
            "Failed to load custom cards:",
            error
        );

        return;

    }


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!cards.length) {

        const empty =
            document.createElement("div");

        empty.className =
            "custom-cards-empty";

        empty.textContent =
            "You haven't created any custom cards yet.";

        container.appendChild(
            empty
        );

        return;

    }


    /* =====================================================
       OWNED CARDS
    ===================================================== */

    let ownedCards = {};

    try {

        ownedCards =
            JSON.parse(
                localStorage.getItem(
                    "ownedCards"
                ) || "{}"
            );

    } catch (error) {

        console.error(
            "Failed to read owned cards:",
            error
        );

        ownedCards = {};

    }


    /* =====================================================
       RENDER CARDS
    ===================================================== */

    cards.forEach(card => {


        /* =================================================
           CARD ROW
        ================================================= */

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "custom-card-manager-item";


        /* =================================================
           IMAGE
        ================================================= */

        const image =
            document.createElement(
                "img"
            );

        image.className =
            "custom-card-manager-image";

        image.src =
            card.image || "";

        image.alt =
            card.title ||
            "Custom Card";


        /* =================================================
           INFO
        ================================================= */

        const info =
            document.createElement(
                "div"
            );

        info.className =
            "custom-card-manager-info";


        /* TITLE */

        const title =
            document.createElement(
                "div"
            );

        title.className =
            "custom-card-manager-title";

        title.textContent =
            card.title ||
            "Untitled";


        /* META */

        const meta =
            document.createElement(
                "div"
            );

        meta.className =
            "custom-card-manager-meta";


        /* GRADE */

        const grade =
            document.createElement(
                "span"
            );

        grade.className =
            "custom-card-manager-grade";

        grade.textContent =
            card.grade ||
            "A";


        /* SEPARATOR */

        const separator =
            document.createElement(
                "span"
            );

        separator.textContent =
            "•";


        /* COST */

        const cost =
            document.createElement(
                "span"
            );

        cost.textContent =
            `${card.cost || 0} pts`;


        meta.appendChild(
            grade
        );

        meta.appendChild(
            separator
        );

        meta.appendChild(
            cost
        );


        /* LIMITED LABEL */

        if (
            card.limited === true ||
            card.grade === "W"
        ) {

            const limited =
                document.createElement(
                    "span"
                );

            limited.textContent =
                "• Limited";

            meta.appendChild(
                limited
            );

        }


        /* OWNED LABEL */

        const isOwned =
            !!ownedCards[
            card.id
            ];


        if (isOwned) {

            const owned =
                document.createElement(
                    "span"
                );

            owned.textContent =
                "• Owned";

            meta.appendChild(
                owned
            );

        }


        info.appendChild(
            title
        );

        info.appendChild(
            meta
        );


        /* =================================================
           ACTIONS
        ================================================= */

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "custom-card-manager-actions";


        /* =================================================
           LIMITED CHECK
        ================================================= */

        const isLimited =
            card.limited === true ||
            card.grade === "W";


        /* =================================================
           EDIT
           
           Only:
           - normal card
           - not owned
        ================================================= */

        if (
            !isOwned &&
            !isLimited
        ) {

            const edit =
                document.createElement(
                    "button"
                );

            edit.type =
                "button";

            edit.className =
                "custom-card-manager-edit";

            edit.title =
                "Edit card";

            edit.textContent =
                "✎";


            edit.onclick = () => {

                openEditCustomCard(
                    card.id
                );

            };


            actions.appendChild(
                edit
            );

        }


        /* =================================================
           REMOVE
           
           Always available.
        ================================================= */

        const remove =
            document.createElement(
                "button"
            );

        remove.type =
            "button";

        remove.className =
            "custom-card-manager-delete";

        remove.title =
            "Remove card";

        remove.textContent =
            "×";


        remove.onclick = () => {

            confirmDeleteCustomCard(
                card.id,
                card.title
            );

        };


        actions.appendChild(
            remove
        );


        /* =================================================
           BUILD ROW
        ================================================= */

        row.appendChild(
            image
        );

        row.appendChild(
            info
        );

        row.appendChild(
            actions
        );


        container.appendChild(
            row
        );

    });

}


/* =========================================================
   DELETE
========================================================= */

function confirmDeleteCustomCard(
    id,
    title
) {

    customConfirm(
        `Remove "${title}" from your custom cards?`,
        async () => {

            try {

                await deleteCustomCard(id);


                /*
                 * Remove from marketplace.
                 */

                window.cardCatalog =
                    (window.cardCatalog || [])
                        .filter(
                            card =>
                                card.id !== id
                        );


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
                 * Refresh manager.
                 */

                await renderCustomCardsManager();


                customAlert(
                    "Custom card removed."
                );

            } catch (error) {

                console.error(
                    "Failed to delete custom card:",
                    error
                );

                customAlert(
                    "Could not remove the card."
                );

            }

        }
    );

}


/* =========================================================
   OPEN CREATOR
========================================================= */

function openCustomCardCreator() {

    window.customCardEditId =
        null;


    resetCustomCardForm();


    const modal =
        document.getElementById(
            "customCardModal"
        );

    if (!modal) {
        return;
    }


    const heading =
        modal.querySelector(
            ".custom-card-modal-header h2"
        );

    if (heading) {

        heading.textContent =
            "Create Custom Card";

    }


    const button =
        modal.querySelector(
            ".custom-card-create"
        );

    if (button) {

        button.textContent =
            "Create Card";

    }


    modal.classList.add(
        "active"
    );

}


/* =========================================================
   OPEN EDITOR
========================================================= */

async function openEditCustomCard(id) {

    let cards;

    try {

        cards =
            await getCustomCards();

    } catch (error) {

        console.error(
            "Failed to load card:",
            error
        );

        customAlert(
            "Could not load this card."
        );

        return;

    }


    const card =
        cards.find(
            item =>
                item.id === id
        );


    if (!card) {

        customAlert(
            "Custom card not found."
        );

        return;

    }

    window.customCardImageData =
    card.image || "";
    /* =====================================================
   EDIT RESTRICTIONS
===================================================== */

    const ownedCards =
        JSON.parse(
            localStorage.getItem("ownedCards") ||
            "{}"
        );


    /* Owned cards cannot be edited */

    if (ownedCards[card.id]) {

        customAlert(
            "Owned cards cannot be edited."
        );

        return;

    }


    /* Limited Edition cards cannot be edited */

    if (
        card.limited === true ||
        card.grade === "W"
    ) {

        customAlert(
            "Limited Edition cards cannot be edited."
        );

        return;

    }


    window.customCardEditId =
        id;


    /*
     * Restore current artwork.
     */

    window.customCardImageData =
        card.image || "";


    const title =
        document.getElementById(
            "customCardTitle"
        );

    const quote =
        document.getElementById(
            "customCardQuote"
        );

    const grade =
        document.getElementById(
            "customCardGrade"
        );

    const cost =
        document.getElementById(
            "customCardCost"
        );

    const limited =
        document.getElementById(
            "customCardLimited"
        );

    const expires =
        document.getElementById(
            "customCardExpiresAt"
        );

    const preview =
        document.getElementById(
            "customCardImagePreview"
        );

    const placeholder =
        document.getElementById(
            "customCardImagePlaceholder"
        );

    const expirationGroup =
        document.getElementById(
            "customCardExpirationGroup"
        );


    if (title) {
        title.value =
            card.title || "";
    }

    if (quote) {
        quote.value =
            card.quote || "";
    }

    if (grade) {
        grade.value =
            card.grade || "A";
    }

    if (cost) {
        cost.value =
            card.cost ?? 0;
    }

    if (limited) {
        limited.checked =
            !!card.limited;
    }

    if (expires) {
        expires.value =
            card.expiresAt || "";
    }


    if (preview && card.image) {

        preview.src =
            card.image;

        preview.style.display =
            "block";

    }


    if (placeholder) {

        placeholder.style.display =
            "none";

    }


    if (expirationGroup) {

        expirationGroup.style.display =
            card.limited
                ? "block"
                : "none";

    }


    const modal =
        document.getElementById(
            "customCardModal"
        );

    if (!modal) {
        return;
    }


    const heading =
        modal.querySelector(
            ".custom-card-modal-header h2"
        );

    if (heading) {

        heading.textContent =
            "Edit Custom Card";

    }


    const button =
        modal.querySelector(
            ".custom-card-create"
        );

    if (button) {

        button.textContent =
            "Save Changes";

    }


    modal.classList.add(
        "active"
    );

}

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await openCustomCardDB();

            await loadCustomCardsIntoMarketplace();

            await renderCustomCardsManager();

        } catch (error) {

            console.error(
                "Custom card initialization failed:",
                error
            );

        }

        initializeCustomCardGradeControls();

    }
);

/* =========================================================
   GLOBALS
========================================================= */

window.renderCustomCardsManager =
    renderCustomCardsManager;

window.confirmDeleteCustomCard =
    confirmDeleteCustomCard;

window.openCustomCardCreator =
    openCustomCardCreator;

window.openEditCustomCard =
    openEditCustomCard;
