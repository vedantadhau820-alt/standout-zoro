/* =========================================================
   SOUND & TONES
   Stand Out
========================================================= */

const SOUND_SETTINGS_KEY = "standout_sound_settings";

const DEFAULT_SOUND_SETTINGS = {
    achievement: "default",
    mission: "default",
    mint: "default"
};


/* =========================================================
   DEFAULT SOUND FILES
========================================================= */

const SOUND_FILES = {

    achievement: "Music/Achievements.mp3",
    mission: "Music/Complete.mp3",
    mint: "Music/CardMint.mp3"

};


/* =========================================================
   INDEXEDDB
   Custom tones are stored here.
========================================================= */

const SOUND_DB_NAME = "standout-sounds";
const SOUND_DB_VERSION = 1;
const SOUND_STORE = "custom-tones";

let soundDB = null;


/* =========================================================
   OPEN SOUND DATABASE
========================================================= */

function openSoundDB() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(
                SOUND_DB_NAME,
                SOUND_DB_VERSION
            );


        request.onupgradeneeded = event => {

            const db =
                event.target.result;

            if (
                !db.objectStoreNames.contains(
                    SOUND_STORE
                )
            ) {

                db.createObjectStore(
                    SOUND_STORE
                );

            }

        };


        request.onsuccess = event => {

            soundDB =
                event.target.result;

            resolve(soundDB);

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}


/* =========================================================
   SAVE CUSTOM TONE
========================================================= */

function saveCustomTone(type, file) {

    return new Promise(async (resolve, reject) => {

        try {

            const db =
                soundDB ||
                await openSoundDB();


            const transaction =
                db.transaction(
                    SOUND_STORE,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    SOUND_STORE
                );


            store.put(
                {
                    blob: file,
                    name: file.name,
                    type: file.type
                },
                type
            );


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
   GET CUSTOM TONE
========================================================= */

function getCustomTone(type) {

    return new Promise(async (resolve, reject) => {

        try {

            const db =
                soundDB ||
                await openSoundDB();


            const transaction =
                db.transaction(
                    SOUND_STORE,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    SOUND_STORE
                );


            const request =
                store.get(type);


            request.onsuccess = () => {

                resolve(
                    request.result || null
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
   LOAD SOUND SETTINGS
========================================================= */

function loadSoundSettings() {

    try {

        const saved =
            localStorage.getItem(
                SOUND_SETTINGS_KEY
            );


        if (!saved) {

            return {
                ...DEFAULT_SOUND_SETTINGS
            };

        }


        return {
            ...DEFAULT_SOUND_SETTINGS,
            ...JSON.parse(saved)
        };

    } catch (error) {

        console.error(
            "Failed to load sound settings:",
            error
        );


        return {
            ...DEFAULT_SOUND_SETTINGS
        };

    }

}


let soundSettings =
    loadSoundSettings();


/* =========================================================
   SAVE SOUND SETTINGS
========================================================= */

function saveSoundSettings() {

    try {

        localStorage.setItem(
            SOUND_SETTINGS_KEY,
            JSON.stringify(
                soundSettings
            )
        );

    } catch (error) {

        console.error(
            "Failed to save sound settings:",
            error
        );

    }

}


/* =========================================================
   ACTIVE EVENT SOUND
========================================================= */

let activeTone = null;
let toneTimeout = null;
let toneRequestId = 0;

/* =========================================================
   GLOBAL AUDIO CONTROLLER
   Only one application audio source may play at a time.
========================================================= */

function stopAllAppAudio() {

    /* Stop event tone */
    if (typeof stopActiveTone === "function") {
        stopActiveTone();
    }

    /* Stop Account preview */
    if (typeof stopPreview === "function") {
        stopPreview();
    }

    /* Stop timer music */
    if (typeof stopAllMusic === "function") {
        stopAllMusic();
    }

    /* Stop achievement / goal videos */
    document
        .querySelectorAll(
            ".goal-achievement-video video, #mintReveal video"
        )
        .forEach(video => {
            try {
                video.pause();
                video.currentTime = 0;
            } catch (error) {
                console.warn(
                    "Could not stop application video:",
                    error
                );
            }
        });
}


function stopActiveTone() {

    if (toneTimeout) {

        clearTimeout(toneTimeout);

        toneTimeout = null;

    }


    if (!activeTone) {
        return;
    }


    activeTone.pause();

    activeTone.currentTime = 0;


    if (activeTone._objectUrl) {

        URL.revokeObjectURL(
            activeTone._objectUrl
        );

    }


    activeTone = null;

}


/* =========================================================
   PLAY APP TONE
   Used by actual app events.
========================================================= */

async function playAppTone(type) {

    const setting =
        soundSettings[type];


    /* No valid setting */

    if (!setting) {
        return null;
    }


    /* Sound disabled */

    if (setting === "none") {
        return null;
    }


    /*
     * Every new tone request invalidates
     * any older tone request that is still
     * waiting for its audio to load.
     */

    const requestId =
        ++toneRequestId;


    /* Stop everything currently playing */

    stopAllAppAudio();


    let audio = null;


    /* =====================================================
       CUSTOM TONE
    ===================================================== */

    if (setting === "custom") {

        try {

            const custom =
                await getCustomTone(type);


            /*
             * Another tone was requested while
             * this custom tone was loading.
             *
             * This request is now obsolete.
             */

            if (requestId !== toneRequestId) {
                return null;
            }


            if (
                !custom ||
                !custom.blob
            ) {

                console.warn(
                    "Custom tone not found:",
                    type
                );

                return null;

            }


            const url =
                URL.createObjectURL(
                    custom.blob
                );


            audio =
                new Audio(url);


            audio._objectUrl =
                url;

        } catch (error) {

            console.error(
                "Failed to load custom tone:",
                error
            );

            return null;

        }

    }


    /* =====================================================
       DEFAULT TONE
    ===================================================== */

    else {

        const src =
            SOUND_FILES[type];


        if (!src) {
            return null;
        }


        audio =
            new Audio(src);

    }


    /*
     * Check again before allowing the audio
     * to become active.
     */

    if (requestId !== toneRequestId) {

        if (audio?._objectUrl) {

            URL.revokeObjectURL(
                audio._objectUrl
            );

        }

        return null;
    }


    audio.volume = 0.7;

    activeTone = audio;


    audio.onended = () => {

        if (
            activeTone === audio
        ) {

            if (
                audio._objectUrl
            ) {

                URL.revokeObjectURL(
                    audio._objectUrl
                );

            }

            activeTone = null;

        }

    };


    try {

        await audio.play();


        /*
         * Make sure another tone wasn't
         * requested while play() was resolving.
         */

        if (requestId !== toneRequestId) {

            if (activeTone === audio) {
                stopActiveTone();
            }

            return null;
        }


        /*
         * Maximum tone duration:
         * 10 seconds.
         */

        toneTimeout =
            setTimeout(() => {

                if (
                    activeTone === audio
                ) {

                    stopActiveTone();

                }

            }, 5000);


        return audio;

    } catch (error) {

        console.warn(
            "Unable to play tone:",
            error
        );


        if (
            activeTone === audio
        ) {

            activeTone = null;

        }


        if (
            audio._objectUrl
        ) {

            URL.revokeObjectURL(
                audio._objectUrl
            );

        }


        return null;

    }

}


/* =========================================================
   UPDATE SOUND SETTING
========================================================= */

function updateSoundSetting(
    type,
    value
) {

    if (
        !Object.prototype.hasOwnProperty.call(
            DEFAULT_SOUND_SETTINGS,
            type
        )
    ) {

        return;

    }


    soundSettings[type] =
        value;


    saveSoundSettings();


    updateToneControls(
        type
    );

}


/* =========================================================
   PREVIEW SYSTEM
   Account page only.
========================================================= */

let previewAudio = null;
let previewType = null;


/* =========================================================
   STOP PREVIEW
========================================================= */

function stopPreview() {

    if (!previewAudio) {

        return;

    }


    previewAudio.pause();

    previewAudio.currentTime = 0;


    if (
        previewAudio._objectUrl
    ) {

        URL.revokeObjectURL(
            previewAudio._objectUrl
        );

    }


    if (previewType) {

        const prefix =
            previewType === "achievement"
                ? "achievement"
                : previewType === "mission"
                    ? "mission"
                    : "mint";


        const button =
            document.getElementById(
                `${prefix}PreviewBtn`
            );


        if (button) {

            button.textContent =
                "▶";

        }

    }


    previewAudio = null;

    previewType = null;

}


/* =========================================================
   PREVIEW TONE
   Play / Stop toggle.
========================================================= */

async function previewTone(type) {

    /* =====================================================
       CLICK SAME BUTTON WHILE PLAYING
       → STOP
    ===================================================== */

    if (
        previewAudio &&
        previewType === type
    ) {

        stopPreview();

        return;

    }


    /* =====================================================
   STOP ALL OTHER APPLICATION AUDIO
===================================================== */

    stopAllAppAudio();
    stopPreview();


    const setting =
        soundSettings[type];


    /* None */

    if (
        !setting ||
        setting === "none"
    ) {

        return;

    }


    let audio = null;


    /* =====================================================
       CUSTOM
    ===================================================== */

    if (
        setting === "custom"
    ) {

        try {

            const custom =
                await getCustomTone(
                    type
                );


            if (
                !custom ||
                !custom.blob
            ) {

                return;

            }


            const url =
                URL.createObjectURL(
                    custom.blob
                );


            audio =
                new Audio(url);


            audio._objectUrl =
                url;

        } catch (error) {

            console.error(
                "Preview custom tone failed:",
                error
            );

            return;

        }

    }


    /* =====================================================
       DEFAULT
    ===================================================== */

    else {

        const src =
            SOUND_FILES[type];


        if (!src) {

            return;

        }


        audio =
            new Audio(src);

    }


    audio.volume = 0.7;


    previewAudio =
        audio;


    previewType =
        type;


    const prefix =
        type === "achievement"
            ? "achievement"
            : type === "mission"
                ? "mission"
                : "mint";


    const button =
        document.getElementById(
            `${prefix}PreviewBtn`
        );


    if (button) {

        button.textContent =
            "■";

    }


    audio.onended = () => {

        stopPreview();

    };


    try {

        await audio.play();

    } catch (error) {

        console.warn(
            "Preview playback failed:",
            error
        );

        stopPreview();

    }

}


/* =========================================================
   UPDATE ACCOUNT UI
========================================================= */

async function updateToneControls(type) {

    const prefix =
        type === "achievement"
            ? "achievement"
            : type === "mission"
                ? "mission"
                : "mint";


    const select =
        document.getElementById(
            `${prefix}Tone`
        );


    const choose =
        document.getElementById(
            `${prefix}ChooseBtn`
        );


    const preview =
        document.getElementById(
            `${prefix}PreviewBtn`
        );


    const fileName =
        document.getElementById(
            `${prefix}ToneName`
        );


    if (!select) {

        return;

    }


    select.value =
        soundSettings[type];


    /* =====================================================
       CUSTOM
    ===================================================== */

    if (
        soundSettings[type] === "custom"
    ) {

        let custom = null;


        try {

            custom =
                await getCustomTone(
                    type
                );

        } catch (error) {

            console.error(
                "Failed to read custom tone:",
                error
            );

        }


        if (choose) {

            choose.textContent =
                custom?.name
                    ? "Change"
                    : "Choose";


            choose.title =
                custom?.name || "";

        }


        if (preview) {

            preview.disabled =
                !custom;

        }


        if (fileName) {

            fileName.textContent =
                custom?.name
                    ? custom.name
                    : "No custom tone selected";

        }

        return;

    }


    /* =====================================================
       DEFAULT
    ===================================================== */

    if (
        soundSettings[type] === "default"
    ) {

        if (choose) {

            choose.textContent =
                "Choose";

            choose.title = "";

        }


        if (preview) {

            preview.disabled =
                false;

        }


        if (fileName) {

            fileName.textContent =
                "Using default tone";

        }

        return;

    }


    /* =====================================================
       NONE
    ===================================================== */

    if (
        soundSettings[type] === "none"
    ) {

        if (choose) {

            choose.textContent =
                "Choose";

            choose.title = "";

        }


        if (preview) {

            preview.disabled =
                false;

        }


        if (fileName) {

            fileName.textContent =
                "Sound disabled";

        }

    }

}


/* =========================================================
   INITIALIZE ACCOUNT SOUND SETTINGS
========================================================= */

async function initializeSoundSettings() {

    /* =====================================================
       OPEN DATABASE
    ===================================================== */

    try {

        await openSoundDB();

    } catch (error) {

        console.error(
            "Sound database failed:",
            error
        );

    }


    const configs = [

        {
            type: "achievement",

            select:
                "achievementTone",

            file:
                "achievementToneFile",

            choose:
                "achievementChooseBtn",

            preview:
                "achievementPreviewBtn"

        },

        {
            type: "mission",

            select:
                "missionTone",

            file:
                "missionToneFile",

            choose:
                "missionChooseBtn",

            preview:
                "missionPreviewBtn"

        },

        {
            type: "mint",

            select:
                "mintTone",

            file:
                "mintToneFile",

            choose:
                "mintChooseBtn",

            preview:
                "mintPreviewBtn"

        }

    ];


    configs.forEach(config => {

        const select =
            document.getElementById(
                config.select
            );


        const fileInput =
            document.getElementById(
                config.file
            );


        const choose =
            document.getElementById(
                config.choose
            );


        const preview =
            document.getElementById(
                config.preview
            );


        if (!select) {

            return;

        }


        /* =================================================
           RESTORE SETTING
        ================================================= */

        select.value =
            soundSettings[
            config.type
            ];


        /* =================================================
           SELECTOR CHANGE
        ================================================= */

        select.addEventListener(
            "change",
            () => {

                /* Stop preview when changing mode */

                stopPreview();


                updateSoundSetting(
                    config.type,
                    select.value
                );

            }
        );


        /* =================================================
           CHOOSE FILE
        ================================================= */

        if (
            choose &&
            fileInput
        ) {

            choose.addEventListener(
                "click",
                () => {

                    fileInput.click();

                }
            );

        }


        /* =================================================
           FILE SELECTED
        ================================================= */

        if (fileInput) {

            fileInput.addEventListener(
                "change",
                async () => {

                    const file =
                        fileInput.files?.[0];


                    if (!file) {

                        return;

                    }


                    /* Validate */

                    if (
                        !file.type.startsWith(
                            "audio/"
                        )
                    ) {

                        alert(
                            "Please choose an audio file."
                        );


                        fileInput.value =
                            "";


                        return;

                    }


                    try {

                        /* Stop current preview */

                        stopPreview();


                        /* Save file */

                        await saveCustomTone(
                            config.type,
                            file
                        );


                        /* Automatically select Custom */

                        soundSettings[
                            config.type
                        ] = "custom";


                        saveSoundSettings();


                        select.value =
                            "custom";


                        await updateToneControls(
                            config.type
                        );


                        console.log(
                            `Custom ${config.type} tone saved:`,
                            file.name
                        );


                    } catch (error) {

                        console.error(
                            "Failed to save custom tone:",
                            error
                        );


                        alert(
                            "Could not save this audio file."
                        );

                    }


                    /* Allow selecting same file again */

                    fileInput.value =
                        "";

                }
            );

        }


        /* =================================================
           PREVIEW
           ▶ = play
           ■ = stop
        ================================================= */

        if (preview) {

            preview.addEventListener(
                "click",
                async () => {

                    await previewTone(
                        config.type
                    );

                }
            );

        }

    });


    /* =====================================================
       RESTORE UI
    ===================================================== */

    await Promise.all(

        configs.map(
            config =>
                updateToneControls(
                    config.type
                )
        )

    );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeSoundSettings
);
