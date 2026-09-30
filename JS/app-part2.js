/* =========================================================
   MONTHLY REPORT — MISSION TYPE PERFORMANCE
========================================================= */

function calculateMissionTypePerformance(year, month) {

    const monthPrefix =
        `${year}-${String(month + 1).padStart(2, "0")}`;

    const result = {
        hardcore: 0,
        recurring: 0,
        oneTime: 0
    };

    Object.keys(missionHistory)
        .filter(date =>
            date.startsWith(monthPrefix)
        )
        .forEach(date => {

            const day =
                missionHistory[date];

            const events =
                Array.isArray(day.events)
                    ? day.events
                    : [];

            events.forEach(event => {

                if (event.type === "hardcore") {
                    result.hardcore++;
                }

                else if (
                    event.type === "recurring"
                ) {
                    result.recurring++;
                }

                else if (event.type === "one-time") {
                    result.oneTime++;
                }

            });

        });

    return result;
}
/* =========================================================
   MONTHLY REPORT — DAILY CONSISTENCY DATA
========================================================= */

function calculateDailyConsistency(year, month) {

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();



    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {

        const dateKey =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const dayData =
            missionHistory[dateKey];

        const completed =
            Number(dayData?.completed) || 0;

        const missed =
            Number(dayData?.missed) || 0;

        const total =
            completed + missed;

        const consistency =
            total > 0
                ? Math.round(
                    (completed / total) * 100
                )
                : null;

        result.push({
            day,
            date: dateKey,
            completed,
            missed,
            consistency
        });
    }

    return result;
}

/* =========================================================
   MONTHLY REPORT — MISSION PERFORMANCE
========================================================= */

function calculateMissionPerformance(year, month) {

    const monthPrefix =
        `${year}-${String(month + 1).padStart(2, "0")}`;

    const performance = {
        completed: 0,
        missed: 0,
        total: 0,
        completionRate: 0
    };

    Object.keys(missionHistory)
        .filter(date => date.startsWith(monthPrefix))
        .forEach(date => {

            const day =
                missionHistory[date];

            performance.completed +=
                Number(day.completed) || 0;

            performance.missed +=
                Number(day.missed) || 0;
        });


    performance.total =
        performance.completed +
        performance.missed;


    if (performance.total > 0) {

        performance.completionRate =
            Math.round(
                (
                    performance.completed /
                    performance.total
                ) * 100
            );

    }


    return performance;
}
/* =========================================================
   MONTHLY REPORT — MONTH OVERVIEW
========================================================= */

function renderMonthlyReport() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        now.getMonth();

    const metrics =
        calculateMonthMetrics(
            year,
            month
        );


    /* =========================
       MONTH NAME
    ========================= */

    const monthName =
        new Date(
            year,
            month,
            1
        ).toLocaleDateString(
            [],
            {
                month: "long",
                year: "numeric"
            }
        );


    /* =========================
       UPDATE UI
    ========================= */

    const monthElement =
        document.getElementById(
            "monthlyReportMonth"
        );

    const consistencyElement =
        document.getElementById(
            "monthlyConsistency"
        );

    const completedElement =
        document.getElementById(
            "monthlyCompleted"
        );

    const missedElement =
        document.getElementById(
            "monthlyMissed"
        );

    const activeDaysElement =
        document.getElementById(
            "monthlyActiveDays"
        );

    const pointsElement =
        document.getElementById(
            "monthlyImprovementPoints"
        );


    if (monthElement) {
        monthElement.textContent =
            monthName.toUpperCase();
    }

    if (consistencyElement) {
        consistencyElement.textContent =
            `${metrics.consistency}%`;
    }

    if (completedElement) {
        completedElement.textContent =
            metrics.completed;
    }

    if (missedElement) {
        missedElement.textContent =
            metrics.missed;
    }

    if (activeDaysElement) {
        activeDaysElement.textContent =
            metrics.activeDays;
    }

    if (pointsElement) {
        pointsElement.textContent =
            metrics.improvementPoints;
    }

    renderMonthlyActivityCalendar(
        year,
        month
    );

    renderMonthlyConsistencyChart(
        year,
        month
    );

    renderMonthlyMissionPerformance(
        year,
        month
    );

    renderMonthlyMomentum(
        year,
        month
    );
    renderMonthlyMomentumChart(
        year,
        month
    );
    renderMonthlyGoalsProgress(
        year,
        month
    );
    renderMonthlyInsights(
        year,
        month
    );
    renderMonthlySummary(
        year,
        month
    );
    renderMonthlyDailyChallenges(
        year,
        month
    );
}

function getMonthlyMomentumHistory(year, month) {

    const history = Momentum.getHistory();

    const prefix =
        `${year}-${String(month + 1).padStart(2, "0")}`;

    return Object.entries(history)
        .filter(([date]) =>
            date.startsWith(prefix)
        )
        .map(([date, data]) => ({
            date: date,
            momentum: Number(data.momentum) || 0
        }))
        .sort((a, b) =>
            a.date.localeCompare(b.date)
        );
}

function generateMonthlyInsights(year, month) {

    const metrics =
        calculateMonthMetrics(year, month);

    const performance =
        calculateMissionPerformance(year, month);

    const goals =
        calculateMonthlyGoalMetrics(year, month);

    const insights = [];


    /* =========================
       MISSION PERFORMANCE
    ========================= */

    if (performance.total > 0) {

        if (performance.completionRate >= 80) {

            insights.push({
                type: "positive",
                title: "Strong execution",
                text:
                    `You completed ${performance.completionRate}% of your recorded missions.`
            });

        } else if (
            performance.completionRate >= 50
        ) {

            insights.push({
                type: "neutral",
                title: "Decent execution",
                text:
                    `You completed ${performance.completionRate}% of your recorded missions.`
            });

        } else {

            insights.push({
                type: "warning",
                title: "Execution gap",
                text:
                    `You completed ${performance.completionRate}% of your recorded missions.`
            });

        }

    }


    /* =========================
       CONSISTENCY
    ========================= */

    if (metrics.consistency >= 80) {

        insights.push({
            type: "positive",
            title: "Highly consistent",
            text:
                `Your monthly consistency reached ${metrics.consistency}%.`
        });

    } else if (
        metrics.consistency >= 50
    ) {

        insights.push({
            type: "neutral",
            title: "Room to improve consistency",
            text:
                `Your monthly consistency was ${metrics.consistency}%.`
        });

    } else {

        insights.push({
            type: "warning",
            title: "Consistency needs attention",
            text:
                `Your monthly consistency was ${metrics.consistency}%.`
        });

    }


    /* =========================
       GOALS
    ========================= */

    if (goals.total > 0) {

        if (goals.completionRate === 100) {

            insights.push({
                type: "positive",
                title: "Goals completed",
                text:
                    `You completed all ${goals.total} of your monthly goals.`
            });

        } else {

            insights.push({
                type: "neutral",
                title: "Goal progress",
                text:
                    `You completed ${goals.completed} of ${goals.total} goals.`
            });

        }

    }


    /* =========================
       MOMENTUM
    ========================= */

    if (
        metrics.activeDays > 0 &&
        metrics.momentum !== undefined
    ) {

        insights.push({
            type: "positive",
            title: "Momentum built",
            text:
                `Your current Momentum is ${metrics.momentum}.`
        });

    }


    return insights;
}

/* =========================================================
   MONTHLY REPORT — MOMENTUM METRICS
========================================================= */

function calculateMonthlyMomentum(year, month) {

    const prefix =
        `${year}-${String(month + 1).padStart(2, "0")}`;

    const history =
        Momentum.getHistory();

    const entries =
        Object.entries(history)
            .filter(([date]) =>
                date.startsWith(prefix)
            )
            .sort(
                ([a], [b]) =>
                    a.localeCompare(b)
            );


    const result = {
        started: 0,
        peak: 0,
        ended: 0,
        longest: 0,
        history: []
    };


    if (entries.length === 0) {
        return result;
    }


    /* =========================
       HISTORY
    ========================= */

    result.history =
        entries.map(
            ([date, data]) => ({
                date,
                momentum:
                    Number(data.momentum) || 0,
                energy:
                    Number(data.energy) || 0
            })
        );


    /* =========================
       STARTED
    ========================= */

    result.started =
        result.history[0].momentum;


    /* =========================
       ENDED
    ========================= */

    result.ended =
        result.history[
            result.history.length - 1
        ].momentum;


    /* =========================
       PEAK
    ========================= */

    result.peak =
        Math.max(
            ...result.history.map(
                item => item.momentum
            )
        );


    /* =========================
       LONGEST
    ========================= */

    let currentStreak = 0;

    result.history.forEach(
        item => {

            if (item.momentum > 0) {

                currentStreak =
                    item.momentum;

                result.longest =
                    Math.max(
                        result.longest,
                        currentStreak
                    );

            } else {

                currentStreak = 0;

            }

        }
    );


    return result;
}

/* =========================================================
   MONTHLY REPORT — DAILY CHALLENGES
========================================================= */

/* =========================================================
   MONTHLY REPORT — DAILY CHALLENGE METRICS
========================================================= */

function calculateMonthlyDailyChallenges(year, month) {

    const monthPrefix =
        `${year}-${String(month + 1).padStart(2, "0")}`;

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    const now = new Date();

    const isCurrentMonth =
        year === now.getFullYear() &&
        month === now.getMonth();

    const totalDays =
        isCurrentMonth
            ? now.getDate()
            : daysInMonth;

    let completed = 0;
    let points = 0;

    Object.keys(missionHistory)
        .filter(date =>
            date.startsWith(monthPrefix)
        )
        .forEach(date => {

            const events =
                Array.isArray(
                    missionHistory[date]?.events
                )
                    ? missionHistory[date].events
                    : [];

            events.forEach(event => {

                if (
                    event.type === "daily-challenge" &&
                    event.status === "completed"
                ) {

                    completed++;

                    points +=
                        Number(
                            event.pointsDelta
                        ) || 0;

                }

            });

        });


    return {
        completed,
        total: totalDays,
        points,
        rate:
            totalDays > 0
                ? Math.round(
                    (completed / totalDays) * 100
                )
                : 0
    };
}

/* =========================================================
   MONTHLY REPORT — DAILY CHALLENGE UI
========================================================= */

function renderMonthlyDailyChallenges(year, month) {

    const data =
        calculateMonthlyDailyChallenges(
            year,
            month
        );


    const count =
        document.getElementById(
            "monthlyDailyChallengeCount"
        );

    const progress =
        document.getElementById(
            "monthlyDailyChallengeProgress"
        );

    const rate =
        document.getElementById(
            "monthlyDailyChallengeRate"
        );

    const points =
        document.getElementById(
            "monthlyDailyChallengePoints"
        );

    const message =
        document.getElementById(
            "monthlyDailyChallengeMessage"
        );


    if (count) {

        count.textContent =
            `${data.completed} / ${data.total}`;

    }


    if (progress) {

        progress.style.width =
            `${Math.min(data.rate, 100)}%`;

    }


    if (rate) {

        rate.textContent =
            `${data.rate}%`;

    }


    if (points) {

        points.textContent =
            `+${data.points} IP`;

    }


    if (message) {

        if (data.completed === 0) {

            message.textContent =
                "No Daily Challenges completed yet.";

        } else if (
            data.completed === data.total
        ) {

            message.textContent =
                "You conquered every Daily Challenge this month.";

        } else if (
            data.rate >= 75
        ) {

            message.textContent =
                "Excellent consistency. You kept showing up.";

        } else if (
            data.rate >= 50
        ) {

            message.textContent =
                "Good work. Keep building the habit.";

        } else {

            message.textContent =
                "Every challenge conquered is progress.";

        }

    }

}

function generateMonthlySummary(year, month) {

    const metrics =
        calculateMonthMetrics(year, month);

    const performance =
        calculateMissionPerformance(year, month);

    const goals =
        calculateMonthlyGoalMetrics(year, month);

    const dailyChallenges =
        calculateMonthlyDailyChallenges(
            year,
            month
        );

    const monthName =
        new Date(year, month, 1)
            .toLocaleDateString([], {
                month: "long"
            });



    let opening;

    if (performance.total === 0) {

        opening =
            `${monthName} doesn't have enough recorded data for a meaningful summary.`;

    } else if (performance.completionRate >= 80) {

        opening =
            `${monthName} was a strong execution month.`;

    } else if (performance.completionRate >= 50) {

        opening =
            `${monthName} was a moderately productive month.`;

    } else {

        opening =
            `${monthName} was a challenging month.`;
    }


    let consistencyInsight;

    if (performance.total === 0) {

        consistencyInsight =
            `There isn't enough recorded activity to evaluate consistency.`;

    } else if (metrics.consistency >= 80) {

        consistencyInsight =
            `You maintained strong consistency at ${metrics.consistency}%.`;

    } else if (metrics.consistency >= 50) {

        consistencyInsight =
            `Your consistency was ${metrics.consistency}%, leaving room to build a stronger routine.`;

    } else {

        consistencyInsight =
            `Your consistency was ${metrics.consistency}%, making consistency the biggest area to improve.`;
    }

    let goalInsight = "";

    if (goals.total > 0) {

        if (goals.completionRate === 100) {

            goalInsight =
                `You completed all ${goals.total} of your goals.`;

        } else {

            goalInsight =
                `You completed ${goals.completed} of ${goals.total} goals.`;
        }

    }

    let dailyChallengeInsight = "";

    if (dailyChallenges === 1) {

        dailyChallengeInsight =
            "You conquered 1 Daily Challenge this month.";

    } else if (dailyChallenges > 1) {

        dailyChallengeInsight =
            `You conquered ${dailyChallenges} Daily Challenges this month.`;

    }


    return {
        month: monthName,
        opening,
        completionRate:
            performance.completionRate,
        consistency:
            metrics.consistency,
        completedMissions:
            performance.completed,
        missedMissions:
            performance.missed,
        goalsCompleted:
            goals.completed,
        goalsTotal:
            goals.total,
        summary:
            `${opening} You completed ${performance.completionRate}% of your recorded missions. ${consistencyInsight} ${dailyChallengeInsight} ${goalInsight}`
    };
}
/* =========================================================
   MONTHLY REPORT — MISSION PERFORMANCE UI
========================================================= */

function renderMonthlyMissionPerformance(year, month) {

    const performance =
        calculateMissionPerformance(
            year,
            month
        );

    const rate =
        document.getElementById(
            "missionCompletionRate"
        );

    const completed =
        document.getElementById(
            "missionPerformanceCompleted"
        );

    const missed =
        document.getElementById(
            "missionPerformanceMissed"
        );

    const total =
        document.getElementById(
            "missionPerformanceTotal"
        );


    if (rate) {
        rate.textContent =
            `${performance.completionRate}%`;
    }

    if (completed) {
        completed.textContent =
            performance.completed;
    }

    if (missed) {
        missed.textContent =
            performance.missed;
    }

    if (total) {
        total.textContent =
            performance.total;
    }

    const types =
        calculateMissionTypePerformance(
            year,
            month
        );

    const hardcore =
        document.getElementById(
            "missionHardcoreCount"
        );

    const recurring =
        document.getElementById(
            "missionRecurringCount"
        );

    const oneTime =
        document.getElementById(
            "missionOneTimeCount"
        );

    if (hardcore) {
        hardcore.textContent =
            types.hardcore;
    }

    if (recurring) {
        recurring.textContent =
            types.recurring;
    }

    if (oneTime) {
        oneTime.textContent =
            types.oneTime;
    }
}

function renderMonthlyMomentumChart(year, month) {

    const container =
        document.getElementById(
            "monthlyMomentumChart"
        );

    if (!container) {
        return;
    }

    const history =
        getMonthlyMomentumHistory(
            year,
            month
        );

    container.innerHTML = "";


    const yAxis =
        document.getElementById(
            "momentumGraphYAxis"
        );

    const xAxis =
        document.getElementById(
            "momentumGraphXAxis"
        );

    const peakLabel =
        document.getElementById(
            "monthlyMomentumPeakLabel"
        );


    if (yAxis) {
        yAxis.innerHTML = "";
    }

    if (xAxis) {
        xAxis.innerHTML = "";
    }


    /* =========================================
       EMPTY STATE
    ========================================= */

    if (history.length === 0) {

        container.innerHTML = `
            <div class="momentum-graph-empty">
                No Momentum data for this month.
            </div>
        `;

        return;
    }


    /* =========================================
       VALUES
    ========================================= */

    const values =
        history.map(
            item => Number(item.momentum) || 0
        );


    const maxMomentum =
        Math.max(...values, 1);


    const graphMax =
        Math.max(
            1,
            Math.ceil(maxMomentum / 5) * 5
        );


    /* =========================================
       PEAK LABEL
    ========================================= */

    if (peakLabel) {

        peakLabel.textContent =
            `Peak ${maxMomentum}`;

    }


    /* =========================================
       Y AXIS
    ========================================= */

    if (yAxis) {

        const steps = 4;

        for (
            let i = steps;
            i >= 0;
            i--
        ) {

            const value =
                Math.round(
                    (graphMax / steps) * i
                );

            const label =
                document.createElement("span");

            label.textContent = value;

            yAxis.appendChild(label);
        }
    }


    /* =========================================
       SVG
    ========================================= */

    const width = 1000;
    const height = 300;

    const paddingTop = 18;
    const paddingBottom = 18;
    const paddingLeft = 8;
    const paddingRight = 8;

    const graphWidth =
        width -
        paddingLeft -
        paddingRight;

    const graphHeight =
        height -
        paddingTop -
        paddingBottom;


    const points =
        history.map(
            (item, index) => {

                const x =
                    history.length === 1
                        ? width / 2
                        : paddingLeft +
                        (
                            index /
                            (history.length - 1)
                        ) *
                        graphWidth;


                const y =
                    paddingTop +
                    graphHeight -
                    (
                        item.momentum /
                        graphMax
                    ) *
                    graphHeight;


                return {
                    x,
                    y,
                    date: item.date,
                    momentum: item.momentum
                };

            }
        );


    const svg =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );


    svg.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );

    svg.setAttribute(
        "preserveAspectRatio",
        "none"
    );


    /* =========================================
       GRID
    ========================================= */

    const gridSteps = 4;

    for (
        let i = 0;
        i <= gridSteps;
        i++
    ) {

        const y =
            paddingTop +
            (
                graphHeight /
                gridSteps
            ) *
            i;


        const line =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );


        line.setAttribute(
            "x1",
            0
        );

        line.setAttribute(
            "x2",
            width
        );

        line.setAttribute(
            "y1",
            y
        );

        line.setAttribute(
            "y2",
            y
        );

        line.setAttribute(
            "class",
            "momentum-grid-line"
        );


        svg.appendChild(line);
    }


    /* =========================================
       AREA
    ========================================= */

    const areaPoints = [
        `${points[0].x},${height}`,
        ...points.map(
            point =>
                `${point.x},${point.y}`
        ),
        `${points[points.length - 1].x},${height}`
    ];


    const area =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
        );


    area.setAttribute(
        "points",
        areaPoints.join(" ")
    );

    area.setAttribute(
        "class",
        "momentum-chart-area-fill"
    );


    svg.appendChild(area);


    /* =========================================
       LINE
    ========================================= */

    const line =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polyline"
        );


    line.setAttribute(
        "points",
        points
            .map(
                point =>
                    `${point.x},${point.y}`
            )
            .join(" ")
    );


    line.setAttribute(
        "class",
        "momentum-chart-line"
    );


    svg.appendChild(line);


    /* =========================================
       POINTS
    ========================================= */

    points.forEach(
        point => {

            const circle =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "circle"
                );


            circle.setAttribute(
                "cx",
                point.x
            );

            circle.setAttribute(
                "cy",
                point.y
            );

            circle.setAttribute(
                "r",
                "5"
            );

            circle.setAttribute(
                "class",
                "momentum-chart-point"
            );


            svg.appendChild(circle);

        }
    );


    container.appendChild(svg);


    /* =========================================
       X AXIS
    ========================================= */

    if (xAxis) {

        const labels = [];


        if (history.length <= 5) {

            history.forEach(
                item => {

                    labels.push(item);

                }
            );

        } else {

            labels.push(
                history[0]
            );

            labels.push(
                history[
                Math.floor(
                    history.length / 2
                )
                ]
            );

            labels.push(
                history[
                history.length - 1
                ]
            );

        }


        labels.forEach(
            item => {

                const label =
                    document.createElement(
                        "span"
                    );


                const date =
                    new Date(
                        item.date + "T00:00:00"
                    );


                label.textContent =
                    date.toLocaleDateString(
                        [],
                        {
                            day: "numeric",
                            month: "short"
                        }
                    );


                xAxis.appendChild(
                    label
                );

            }
        );

    }

}

function getMonthlyEnergyHistory(year, month) {

    const history = Momentum.getHistory();

    const prefix =
        `${year}-${String(month + 1).padStart(2, "0")}`;

    return Object.entries(history)
        .filter(([date]) =>
            date.startsWith(prefix)
        )
        .map(([date, data]) => ({
            date: date,
            energy: Number(data.energy) || 0
        }))
        .sort((a, b) =>
            a.date.localeCompare(b.date)
        );
}
/* =========================================================
   MONTHLY REPORT — MOMENTUM JOURNEY UI
========================================================= */

function renderMonthlyMomentum(year, month) {

    const momentum =
        calculateMonthlyMomentum(
            year,
            month
        );


    const ended =
        document.getElementById(
            "monthlyMomentumEnded"
        );

    const started =
        document.getElementById(
            "monthlyMomentumStarted"
        );

    const peak =
        document.getElementById(
            "monthlyMomentumPeak"
        );

    const endedStat =
        document.getElementById(
            "monthlyMomentumEndedStat"
        );

    const longest =
        document.getElementById(
            "monthlyMomentumLongest"
        );


    if (ended) {
        ended.textContent =
            momentum.ended;
    }

    if (started) {
        started.textContent =
            momentum.started;
    }

    if (peak) {
        peak.textContent =
            momentum.peak;
    }

    if (endedStat) {
        endedStat.textContent =
            momentum.ended;
    }

    if (longest) {
        longest.textContent =
            `${momentum.longest} ${momentum.longest === 1
                ? "DAY"
                : "DAYS"
            }`;
    }

}

function renderMonthlyInsights(year, month) {

    const container =
        document.getElementById(
            "monthlyInsights"
        );

    if (!container) {
        return;
    }

    const insights =
        generateMonthlyInsights(
            year,
            month
        );

    container.innerHTML = "";


    if (insights.length === 0) {

        container.innerHTML = `
            <div class="monthly-insight-empty">
                Not enough data to generate insights yet.
            </div>
        `;

        return;
    }


    insights.forEach(insight => {

        const item =
            document.createElement("div");

        item.className =
            `monthly-insight monthly-insight-${insight.type}`;


        item.innerHTML = `
            <div class="monthly-insight-indicator"></div>

            <div class="monthly-insight-content">

                <strong>
                    ${insight.title}
                </strong>

                <span>
                    ${insight.text}
                </span>

            </div>
        `;


        container.appendChild(item);

    });

}

function renderMonthlySummary(year, month) {

    const summary =
        generateMonthlySummary(
            year,
            month
        );

    const title =
        document.getElementById(
            "monthlySummaryTitle"
        );

    const text =
        document.getElementById(
            "monthlySummaryText"
        );

    const completion =
        document.getElementById(
            "monthlySummaryCompletion"
        );

    const consistency =
        document.getElementById(
            "monthlySummaryConsistency"
        );

    const goals =
        document.getElementById(
            "monthlySummaryGoals"
        );


    if (title) {
        title.textContent =
            summary.month;
    }


    if (text) {
        text.textContent =
            summary.summary;
    }


    if (completion) {
        completion.textContent =
            `${summary.completionRate}%`;
    }


    if (consistency) {
        consistency.textContent =
            `${summary.consistency}%`;
    }


    if (goals) {
        goals.textContent =
            `${summary.goalsCompleted}/${summary.goalsTotal}`;
    }

}
/* =========================================================
   MONTHLY REPORT — ACTIVITY CALENDAR
========================================================= */

function renderMonthlyActivityCalendar(year, month) {

    const container =
        document.getElementById(
            "monthlyActivityCalendar"
        );

    if (!container) return;

    container.innerHTML = "";


    /* =========================
       MONTH INFORMATION
    ========================= */

    const firstDay =
        new Date(
            year,
            month,
            1
        );

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /*
     * JavaScript:
     *
     * Sunday = 0
     * Monday = 1
     * ...
     *
     * Our calendar starts Monday.
     */
    const firstWeekday =
        (firstDay.getDay() + 6) % 7;


    /* =========================
       WEEKDAY HEADERS
    ========================= */

    const weekdays = [
        "MON",
        "TUE",
        "WED",
        "THU",
        "FRI",
        "SAT",
        "SUN"
    ];

    weekdays.forEach(day => {

        const header =
            document.createElement("div");

        header.className =
            "calendar-weekday";

        header.textContent =
            day;

        container.appendChild(header);

    });


    /* =========================
       EMPTY CELLS
    ========================= */

    for (
        let i = 0;
        i < firstWeekday;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "calendar-day calendar-empty";

        container.appendChild(empty);

    }


    /* =========================
       DAYS
    ========================= */

    const today =
        getISTDate();

    const todayKey =
        today.toISOString()
            .slice(0, 10);


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dateKey =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const dayData =
            missionHistory[dateKey];


        const cell =
            document.createElement("div");

        cell.className =
            "calendar-day";


        /* =========================
           DAY NUMBER
        ========================= */

        const number =
            document.createElement("span");

        number.className =
            "calendar-day-number";

        number.textContent =
            day;

        cell.appendChild(number);


        /* =========================
           ACTIVITY STATE
        ========================= */

        const events =
            dayData &&
                Array.isArray(dayData.events)
                ? dayData.events
                : [];


        const hasCompleted =
            events.some(
                event =>
                    event.status === "completed"
            );

        const hasMissed =
            events.some(
                event =>
                    event.status === "missed"
            );


        if (hasCompleted && hasMissed) {

            cell.classList.add(
                "calendar-partial"
            );

        }
        else if (hasCompleted) {

            cell.classList.add(
                "calendar-active"
            );

        }
        else if (hasMissed) {

            cell.classList.add(
                "calendar-missed"
            );

        }
        else {

            cell.classList.add(
                "calendar-no-activity"
            );

        }

        /* =========================
           TODAY
        ========================= */

        if (dateKey === todayKey) {

            cell.classList.add(
                "calendar-today"
            );

        }


        container.appendChild(cell);

    }

}

function calculateMonthlyGoalMetrics(year, month) {

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    const goals = goalsData.filter(goal => {

        const deadline =
            goal.deadline
                ? new Date(goal.deadline)
                : null;

        const achievedAt =
            goal.achievedAt
                ? new Date(goal.achievedAt)
                : null;

        return (
            (deadline && deadline >= start && deadline < end) ||
            (achievedAt && achievedAt >= start && achievedAt < end)
        );
    });

    const completed =
        goals.filter(goal => goal.achieved).length;

    const active =
        goals.filter(goal =>
            !goal.achieved &&
            new Date(goal.deadline) >= new Date()
        ).length;

    const missed =
        goals.filter(goal =>
            !goal.achieved &&
            goal.deadline &&
            new Date(goal.deadline) < new Date()
        ).length;

    const total = goals.length;

    const completionRate =
        total > 0
            ? Math.round((completed / total) * 100)
            : 0;

    return {
        completed,
        active,
        missed,
        total,
        completionRate
    };
}
/* =========================================================
   MONTHLY REPORT — CONSISTENCY GRAPH
========================================================= */

function renderMonthlyConsistencyChart(year, month) {

    const container =
        document.getElementById(
            "monthlyConsistencyChart"
        );

    if (!container) return;

    container.innerHTML = "";

    const data =
        calculateDailyConsistency(
            year,
            month
        );


    /* =========================
       CHART
    ========================= */

    const chart =
        document.createElement("div");

    chart.className =
        "consistency-chart-inner";


    /* =========================
       Y AXIS
    ========================= */

    const yAxis =
        document.createElement("div");

    yAxis.className =
        "consistency-y-axis";

    [100, 75, 50, 25, 0]
        .forEach(value => {

            const label =
                document.createElement("span");

            label.textContent =
                value + "%";

            yAxis.appendChild(label);

        });


    chart.appendChild(yAxis);


    /* =========================
       GRAPH AREA
    ========================= */

    const graph =
        document.createElement("div");

    graph.className =
        "consistency-graph-area";


    /* =========================
       GRID
    ========================= */

    [100, 75, 50, 25, 0]
        .forEach(value => {

            const line =
                document.createElement("div");

            line.className =
                "consistency-grid-line";

            line.style.bottom =
                `${value}%`;

            graph.appendChild(line);

        });


    /* =========================
       SVG
    ========================= */

    const svg =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

    svg.classList.add(
        "consistency-svg"
    );

    svg.setAttribute(
        "viewBox",
        `0 0 ${data.length * 20} 100`
    );

    svg.setAttribute(
        "preserveAspectRatio",
        "none"
    );


    /* =========================
       POINTS
    ========================= */

    const points = [];

    data.forEach((item, index) => {

        if (item.consistency === null) {
            return;
        }

        const x =
            index * 20 + 10;

        const y =
            100 - item.consistency;

        points.push({
            x,
            y,
            item
        });

    });


    /* =========================
       LINE
    ========================= */

    if (points.length > 1) {

        const path =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "polyline"
            );

        path.setAttribute(
            "points",
            points
                .map(point =>
                    `${point.x},${point.y}`
                )
                .join(" ")
        );

        path.classList.add(
            "consistency-line"
        );

        svg.appendChild(path);

    }


    /* =========================
       POINT DOTS
    ========================= */

    points.forEach(point => {

        const circle =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

        circle.setAttribute(
            "cx",
            point.x
        );

        circle.setAttribute(
            "cy",
            point.y
        );

        circle.setAttribute(
            "r",
            "2"
        );

        circle.classList.add(
            "consistency-point"
        );

        svg.appendChild(circle);

    });


    graph.appendChild(svg);


    /* =========================
       X AXIS
    ========================= */

    const xAxis =
        document.createElement("div");

    xAxis.className =
        "consistency-x-axis";

    data.forEach(item => {

        const label =
            document.createElement("span");

        /*
         * Only show useful labels.
         */
        if (
            item.day === 1 ||
            item.day % 7 === 0 ||
            item.day === data.length
        ) {
            label.textContent =
                item.day;
        }

        xAxis.appendChild(label);

    });

    graph.appendChild(xAxis);

    chart.appendChild(graph);

    container.appendChild(chart);
}

function getMonthlyGoalProgress(year, month) {

    const metrics =
        calculateMonthlyGoalMetrics(
            year,
            month
        );

    return {
        ...metrics,
        progress: metrics.completionRate
    };
}

function renderMonthlyGoalsProgress(year, month) {

    const metrics =
        getMonthlyGoalProgress(
            year,
            month
        );

    const progressValue =
        document.getElementById(
            "monthlyGoalsProgressValue"
        );

    const completedText =
        document.getElementById(
            "monthlyGoalsCompletedText"
        );

    const progressBar =
        document.getElementById(
            "monthlyGoalsProgressBar"
        );

    const completed =
        document.getElementById(
            "monthlyGoalsCompleted"
        );

    const missed =
        document.getElementById(
            "monthlyGoalsMissed"
        );

    const active =
        document.getElementById(
            "monthlyGoalsActive"
        );


    if (progressValue) {
        progressValue.textContent =
            `${metrics.progress}%`;
    }


    if (completedText) {
        completedText.textContent =
            `${metrics.completed} of ${metrics.total}`;
    }


    if (progressBar) {
        progressBar.style.width =
            `${metrics.progress}%`;
    }


    if (completed) {
        completed.textContent =
            metrics.completed;
    }


    if (missed) {
        missed.textContent =
            metrics.missed;
    }


    if (active) {
        active.textContent =
            metrics.active;
    }

}

document.getElementById("missionCounter").textContent = completedMissions;


/* =========================================================
   2. ACHIEVEMENTS SYSTEM
========================================================= */

// Achievement definitions
const achievements = [
    { id: "mission1", title: "First Step", desc: "Complete your very first mission", unlocked: false },
    { id: "mission5", title: "On a Roll", desc: "Complete 5 missions", unlocked: false },
    { id: "mission10", title: "Mission Master", desc: "Complete 10 missions", unlocked: false },
    { id: "mission15", title: "Halfway Hero", desc: "Complete 15 missions", unlocked: false },
    { id: "mission20", title: "Goal Getter", desc: "Complete 20 missions", unlocked: false },
    { id: "mission25", title: "Silver Streak", desc: "Complete 25 missions", unlocked: false },
    { id: "mission30", title: "Mission Maestro", desc: "Complete 30 missions", unlocked: false },
    { id: "mission35", title: "Trailblazer", desc: "Complete 35 missions", unlocked: false },
    { id: "mission40", title: "Achievement Hunter", desc: "Complete 40 missions", unlocked: false },
    { id: "mission45", title: "Mission Veteran", desc: "Complete 45 missions", unlocked: false },
    { id: "mission50", title: "Legendary Milestone", desc: "Complete 50 missions", unlocked: false },
    { id: "mission55", title: "Mastermind", desc: "Complete 55 missions", unlocked: false },
    { id: "mission60", title: "Champion", desc: "Complete 60 missions", unlocked: false },
    { id: "mission65", title: "Pathfinder", desc: "Complete 65 missions", unlocked: false },
    { id: "mission70", title: "Mission Conqueror", desc: "Complete 70 missions", unlocked: false },
    { id: "mission75", title: "Epic Endeavor", desc: "Complete 75 missions", unlocked: false },
    { id: "mission80", title: "Trail Master", desc: "Complete 80 missions", unlocked: false },
    { id: "mission85", title: "Ultimate Achiever", desc: "Complete 85 missions", unlocked: false },
    { id: "mission90", title: "Hero of Tasks", desc: "Complete 90 missions", unlocked: false },
    { id: "mission95", title: "Task Titan", desc: "Complete 95 missions", unlocked: false },
    { id: "mission100", title: "Century Club", desc: "Complete 100 missions", unlocked: false },
    { id: "mission105", title: "Beyond Limits", desc: "Complete 105 missions", unlocked: false },
    { id: "mission110", title: "Relentless", desc: "Complete 110 missions", unlocked: false },
    { id: "mission115", title: "Sky High", desc: "Complete 115 missions", unlocked: false },
    { id: "mission120", title: "Goal Crusher", desc: "Complete 120 missions", unlocked: false },
    { id: "mission125", title: "Mission Marathoner", desc: "Complete 125 missions", unlocked: false },
    { id: "mission130", title: "Infinite Drive", desc: "Complete 130 missions", unlocked: false },
    { id: "mission135", title: "Peak Performer", desc: "Complete 135 missions", unlocked: false },
    { id: "mission140", title: "Legend in Making", desc: "Complete 140 missions", unlocked: false },
    { id: "mission145", title: "Champion of Tasks", desc: "Complete 145 missions", unlocked: false },
    { id: "mission150", title: "Task Legend", desc: "Complete 150 missions", unlocked: false },
    { id: "mission155", title: "Milestone Achiever", desc: "Complete 155 missions", unlocked: false },
    { id: "mission160", title: "Mission Icon", desc: "Complete 160 missions", unlocked: false },
    { id: "mission165", title: "Epic Journey", desc: "Complete 165 missions", unlocked: false },
    { id: "mission170", title: "Task Champion", desc: "Complete 170 missions", unlocked: false },
    { id: "mission175", title: "Master of Milestones", desc: "Complete 175 missions", unlocked: false },
    { id: "mission180", title: "Legendary Achiever", desc: "Complete 180 missions", unlocked: false },
    { id: "mission185", title: "Ultimate Victor", desc: "Complete 185 missions", unlocked: false },
    { id: "mission190", title: "Task Hero", desc: "Complete 190 missions", unlocked: false },
    { id: "mission195", title: "Mission Elite", desc: "Complete 195 missions", unlocked: false },
    { id: "mission200", title: "Two Hundred Triumphs", desc: "Complete 200 missions", unlocked: false },
    { id: "mission205", title: "Beyond Achievement", desc: "Complete 205 missions", unlocked: false },
    { id: "mission210", title: "Victory Streak", desc: "Complete 210 missions", unlocked: false },
    { id: "mission215", title: "Unstoppable", desc: "Complete 215 missions", unlocked: false },
    { id: "mission220", title: "Peak Achiever", desc: "Complete 220 missions", unlocked: false },
    { id: "mission225", title: "Mission Overlord", desc: "Complete 225 missions", unlocked: false },
    { id: "mission230", title: "Epic Victor", desc: "Complete 230 missions", unlocked: false },
    { id: "mission235", title: "Champion of Goals", desc: "Complete 235 missions", unlocked: false },
    { id: "mission240", title: "Task Mastermind", desc: "Complete 240 missions", unlocked: false },
    { id: "mission245", title: "Legendary Hero", desc: "Complete 245 missions", unlocked: false },
    { id: "mission250", title: "Ultimate Legend", desc: "Complete 250 missions", unlocked: false },

    // Every 10 missions: 260 → 500
    { id: "mission260", title: "Elite Tenacity", desc: "Complete 260 missions", unlocked: false },
    { id: "mission270", title: "Relentless Force", desc: "Complete 270 missions", unlocked: false },
    { id: "mission280", title: "Master of Progress", desc: "Complete 280 missions", unlocked: false },
    { id: "mission290", title: "Unbreakable", desc: "Complete 290 missions", unlocked: false },
    { id: "mission300", title: "Three Hundred Triumphs", desc: "Complete 300 missions", unlocked: false },
    { id: "mission310", title: "Elite Performer", desc: "Complete 310 missions", unlocked: false },
    { id: "mission320", title: "Mission Commander", desc: "Complete 320 missions", unlocked: false },
    { id: "mission330", title: "Goal Dominator", desc: "Complete 330 missions", unlocked: false },
    { id: "mission340", title: "Task Conqueror", desc: "Complete 340 missions", unlocked: false },
    { id: "mission350", title: "Master of the Journey", desc: "Complete 350 missions", unlocked: false },
    { id: "mission360", title: "Limit Breaker", desc: "Complete 360 missions", unlocked: false },
    { id: "mission370", title: "Unstoppable Achiever", desc: "Complete 370 missions", unlocked: false },
    { id: "mission380", title: "Mission Legend", desc: "Complete 380 missions", unlocked: false },
    { id: "mission390", title: "Peak of Progress", desc: "Complete 390 missions", unlocked: false },
    { id: "mission400", title: "Four Hundred Triumphs", desc: "Complete 400 missions", unlocked: false },
    { id: "mission410", title: "Task Titan Elite", desc: "Complete 410 missions", unlocked: false },
    { id: "mission420", title: "Mission Vanguard", desc: "Complete 420 missions", unlocked: false },
    { id: "mission430", title: "Goal Master", desc: "Complete 430 missions", unlocked: false },
    { id: "mission440", title: "Legendary Progress", desc: "Complete 440 missions", unlocked: false },
    { id: "mission450", title: "Mission Grandmaster", desc: "Complete 450 missions", unlocked: false },
    { id: "mission460", title: "Beyond Greatness", desc: "Complete 460 missions", unlocked: false },
    { id: "mission470", title: "Task Overlord", desc: "Complete 470 missions", unlocked: false },
    { id: "mission480", title: "Ultimate Performer", desc: "Complete 480 missions", unlocked: false },
    { id: "mission490", title: "Legendary Streak", desc: "Complete 490 missions", unlocked: false },
    { id: "mission500", title: "Five Hundred Triumphs", desc: "Complete 500 missions", unlocked: false },

    // Every 50 missions: 550 → 1000
    { id: "mission550", title: "Beyond Mastery", desc: "Complete 550 missions", unlocked: false },
    { id: "mission600", title: "Six Hundred Triumphs", desc: "Complete 600 missions", unlocked: false },
    { id: "mission650", title: "Unstoppable Legend", desc: "Complete 650 missions", unlocked: false },
    { id: "mission700", title: "Seven Hundred Triumphs", desc: "Complete 700 missions", unlocked: false },
    { id: "mission750", title: "Ultimate Champion", desc: "Complete 750 missions", unlocked: false },
    { id: "mission800", title: "Eight Hundred Triumphs", desc: "Complete 800 missions", unlocked: false },
    { id: "mission850", title: "Immortal Achiever", desc: "Complete 850 missions", unlocked: false },
    { id: "mission900", title: "Nine Hundred Triumphs", desc: "Complete 900 missions", unlocked: false },
    { id: "mission950", title: "Limitless Legend", desc: "Complete 950 missions", unlocked: false },
    { id: "mission1000", title: "Millennium Master", desc: "Complete 1000 missions", unlocked: false }
];

// =========================================================
// LOAD + MIGRATE ACHIEVEMENTS
// =========================================================

let achievementsData = [];

try {
    const savedAchievements =
        JSON.parse(localStorage.getItem("achievements"));

    if (Array.isArray(savedAchievements)) {
        achievementsData = savedAchievements;
    }
} catch (error) {
    console.warn(
        "Failed to load saved achievements:",
        error
    );
}

// Add any new achievement definitions that
// don't exist in the user's saved data.
//
// This allows old users who previously had
// achievements only up to 250 to receive
// the newer achievements up to 1000.

const savedAchievementMap =
    new Map(
        achievementsData.map(
            achievement => [
                achievement.id,
                achievement
            ]
        )
    );

achievements.forEach(achievement => {

    if (!savedAchievementMap.has(achievement.id)) {

        achievementsData.push({
            ...achievement
        });

    }

});

// Save the migrated achievement list
localStorage.setItem(
    "achievements",
    JSON.stringify(achievementsData)
);

const quotes = [
    "Discipline is the bridge between goals and achievement.",
    "Consistency creates progress, progress creates success.",
    "Small steps every day lead to big results.",
    "Effort today becomes strength tomorrow.",
    "Stay focused, stay strong, keep moving forward.",
    "Success is the sum of small efforts repeated daily.",
    "Your only limit is your mind.",
    "Great things never come from comfort zones.",
    "Dream it. Believe it. Achieve it.",
    "Push yourself, because no one else is going to do it for you.",
    "The harder you work for something, the greater you’ll feel when you achieve it.",
    "Don’t stop when you’re tired. Stop when you’re done.",
    "Focus on progress, not perfection.",
    "Your future is created by what you do today, not tomorrow.",
    "Small progress is still progress.",
    "Motivation gets you started, habit keeps you going.",
    "Do something today that your future self will thank you for.",
    "Success doesn’t come from what you do occasionally, it comes from what you do consistently.",
    "Believe in yourself and all that you are.",
    "Take the risk or lose the chance."
];

/* Render achievements in account page */
let achievementsExpanded = false;

function renderAchievements() {
    const container = document.getElementById("achievementsViewer");

    if (!container) return;

    container.innerHTML = "";

    let displayList;

    /*
     * ============================
     * EXPANDED VIEW
     * ============================
     */
    if (achievementsExpanded) {

        displayList = achievementsData;

    }

    /*
     * ============================
     * COLLAPSED VIEW
     * ============================
     *
     * Show:
     * - 5 previous achievements
     * - 5 upcoming achievements
     *
     * The first locked achievement is
     * considered the next achievement.
     */
    else {

        const nextIndex = achievementsData.findIndex(
            achievement => !achievement.unlocked
        );

        /*
         * If all achievements are unlocked,
         * show the final 5.
         */
        if (nextIndex === -1) {

            displayList = achievementsData.slice(-5);

        }

        /*
         * Otherwise show:
         *
         * [previous 5] [next 5]
         */
        else {

            const previousStart =
                Math.max(0, nextIndex - 5);

            const previousAchievements =
                achievementsData.slice(
                    previousStart,
                    nextIndex
                );

            const upcomingAchievements =
                achievementsData.slice(
                    nextIndex,
                    nextIndex + 5
                );

            displayList = [
                ...previousAchievements,
                ...upcomingAchievements
            ];
        }
    }

    /*
     * ============================
     * RENDER ACHIEVEMENTS
     * ============================
     */

    displayList.forEach(achievement => {

        const tile = document.createElement("div");

        tile.className =
            "achievement-tile" +
            (achievement.unlocked ? "" : " locked");

        const icon = achievement.unlocked
            ? '<i class="fas fa-trophy"></i>'
            : '<i class="fas fa-lock"></i>';

        tile.innerHTML = `
            <div class="achievement-icon">
                ${icon}
            </div>

            <div class="achievement-title">
                ${achievement.title}
            </div>

            <div class="achievement-desc">
                ${achievement.desc}
            </div>

            ${
                achievement.unlocked &&
                achievement.unlockedAt
                    ? `
                        <div class="achievement-date">
                            Achieved on:
                            ${achievement.unlockedAt}
                        </div>
                      `
                    : ""
            }
        `;

        container.appendChild(tile);
    });

    /*
     * ============================
     * EXPAND / COLLAPSE BUTTON
     * ============================
     */

    if (achievementsData.length > 10) {

        const toggle =
            document.createElement("button");

        toggle.type = "button";

        toggle.className =
            "achievements-toggle";

        toggle.innerHTML = achievementsExpanded
    ? 'Show Recent <i class="fas fa-chevron-up"></i>'
    : 'View All <i class="fas fa-chevron-down"></i>';

        toggle.addEventListener("click", () => {

            achievementsExpanded =
                !achievementsExpanded;

            renderAchievements();
        });

        container.appendChild(toggle);
    }
}

/* Unlock an achievement */
function unlockAchievement(id) {
    const ach = achievementsData.find(a => a.id === id);

    if (ach && !ach.unlocked) {
        ach.unlocked = true;

        /* =====================================================
   SEASON XP
===================================================== */

        if (
            window.StandOutSeason &&
            typeof window.StandOutSeason.addXP === "function"
        ) {

            window.StandOutSeason.addXP(
                25,
                "Achievement"
            );

        }
        ach.unlockedAt = new Date().toDateString(); // 🔥 ADD THIS

        localStorage.setItem("achievements", JSON.stringify(achievementsData));

        pushNotification("🏆 New Achievement", `You unlocked: "${ach.title}"`);
        showAchievementPopup(ach.title, ach.desc);
        renderAchievements();
    }
}

function showAchievementPopup(title, desc) {
    window.isAchievementPlaying = true;

    const popup = document.createElement("div");
    popup.className = "achievement-popup";
    popup.innerHTML = `<h3>${title}</h3><p>${desc}</p>`;
    document.body.appendChild(popup);

    // const audio = new Audio("Music/Achievements.mp3");
    // audio.volume = 0.5;
    // audio.play().catch(() => { });

    // audio.onended = () => { window.isAchievementPlaying = false; };
    const audio = playAppTone("achievement");

    if (audio) {
        window.isAchievementPlaying = true;

        audio.onended = () => {
            window.isAchievementPlaying = false;
        };
    } else {
        window.isAchievementPlaying = false;
    }

    popup.style.opacity = 0;
    popup.style.transform = "translateY(-50px)";
    setTimeout(() => {
        popup.style.transition = "all 0.5s ease";
        popup.style.opacity = 1;
        popup.style.transform = "translateY(0)";
    }, 10);

    setTimeout(() => {
        popup.style.opacity = 0;
        popup.style.transform = "translateY(-50px)";
        setTimeout(() => popup.remove(), 500);
    }, 1500);
}


/* =========================================================
   3. NAVIGATION SYSTEM
========================================================= */
function showPage(pageId) {
    document.querySelectorAll("section").forEach(sec =>
        sec.classList.remove("active")
    );

    const page = document.getElementById(pageId);
    if (page) page.classList.add("active");

    document.querySelectorAll(".bottom-nav > button")
        .forEach(b => b.classList.remove("active"));

    const btn = document.getElementById("nav-" + pageId);
    if (btn) btn.classList.add("active");

    updatePlusBtn(pageId);

    isMarketplaceOpen = (pageId === "marketplace-cards");


    if (pageId === "account") renderAchievements();
}

function updatePlusBtn(pageId) {
    const btn = document.getElementById("globalAddBtn");
    if (!btn) return;

    if (pageId === "missions") {
        btn.setAttribute("onclick", "openModal('mission')");
        btn.style.display = "block";
    } else if (pageId === "skillset") {
        btn.setAttribute("onclick", "openModal('skill')");
        btn.style.display = "block";
    } else if (pageId === "goals") {
        btn.setAttribute("onclick", "openModal('goal')");
        btn.style.display = "block";
    } else if (pageId === "time") {
        btn.setAttribute("onclick", "openModal('multi-time')");
        btn.style.display = "block";
    } else {
        btn.style.display = "none";
    }
}
// ===============================
// FULLSCREEN TIMER MODE JS
// ===============================



// OPEN FULL SCREEN
document.getElementById("timerIcon").onclick = () => {
    document.getElementById("timerScreen").style.display = "block";
    document.querySelector(".top-navbar").style.display = "none";
    document.querySelector(".bottom-nav").style.display = "none";
};

// EXIT FULL SCREEN
document.getElementById("timerCloseBtn").onclick = () => {
    document.getElementById("timerScreen").style.display = "none";
    document.querySelector(".top-navbar").style.display = "flex";
    document.querySelector(".bottom-nav").style.display = "flex";

    clearInterval(timerInterval);

    stopAllAppAudio();
    music.pause();
    music.currentTime = 0;
};


// MUSIC MODAL
document.getElementById("timerMusicBtn").onclick = () => {
    document.getElementById("musicModal").classList.add("active");

    if (musicMode === "preset") {
        showPresetUI();
    }
};

function closeMusicModal() {
    document.getElementById("musicModal").classList.remove("active");
}


// SETTINGS MODAL
document.getElementById("timerSettingsBtn").onclick = () => {
    document.getElementById("timerSettingModal").classList.add("active");
};

function closeTimerSettingModal() {
    document.getElementById("timerSettingModal").classList.remove("active");
}

// Apply timer settings
function applyTimerSettings() {
    let h = parseInt(document.getElementById("setH").value);
    let m = parseInt(document.getElementById("setM").value);
    let s = parseInt(document.getElementById("setS").value);

    startStaticTimer(h, m, s);
    closeTimerSettingModal();
}


function startStaticTimer(h, m, s) {
    clearInterval(timerInterval);

    let total = h * 3600 + m * 60 + s;

    // Set initial values
    document.getElementById("h").textContent = h.toString().padStart(2, "0");
    document.getElementById("m").textContent = m.toString().padStart(2, "0");
    document.getElementById("s").textContent = s.toString().padStart(2, "0");

    timerInterval = setInterval(() => {
        if (total <= 0) {
            clearInterval(timerInterval);
            stopAllAppAudio();
            return;
        }

        total--;

        const hh = Math.floor(total / 3600);
        const mm = Math.floor((total % 3600) / 60);
        const ss = total % 60;

        document.getElementById("h").textContent = hh.toString().padStart(2, "0");
        document.getElementById("m").textContent = mm.toString().padStart(2, "0");
        document.getElementById("s").textContent = ss.toString().padStart(2, "0");

    }, 1000);
}




/* =========================================================
   4. MODALS (ADD / EDIT / ALERT / CONFIRM)
========================================================= */
function openModal(type, skillDiv = null) {
    const modal = document.getElementById("modal");
    const content = document.getElementById("modal-content");

    modal.classList.add("active");

    // ---- Add Mission ----
    if (type === 'mission') {
        const skills = [...document.querySelectorAll("#skill-list strong")]
            .map(s => `<option value="${s.textContent}">${s.textContent}</option>`)
            .join("");

        content.innerHTML = `
  <h3>Add Mission</h3>
  <input id="missionInput" placeholder="Enter mission">

  <label>Link Skill</label>
  <select id="linkedSkill">
    <option value="">None</option>
    ${skills}
  </select>

  <div class="form-group">

    <label for="missionRepeat">
        Repeat
    </label>

    <select id="missionRepeat">

        <option value="none">
            Doesn't repeat
        </option>

        <option value="daily">
            Every day
        </option>

        <option value="weekly">
            Every week
        </option>

        <option value="monthly">
            Every month
        </option>

    </select>

</div>

  <label>Deadline</label>
  <input id="missionDeadline" type="datetime-local">

  <div class="toggle-row">
  <label class="toggle">
    <input type="checkbox" id="hardcoreToggle">
    <span class="slider"></span>
  </label>
  <span class="toggle-label">Hardcore Mode</span>
</div>

  <button onclick="addMission()">Add</button>
  <button onclick="closeModal()">Cancel</button>
`;

    }

    /* =====================================================
   ADD SKILL
===================================================== */

    if (type === "skill") {

        content.innerHTML = `
        <h3>Add Skill</h3>

        <input
            id="skillInput"
            type="text"
            placeholder="Enter skill name"
            maxlength="50"
            autocomplete="off"
        >

        <button
            type="button"
            onclick="addSkill()"
        >
            Add Skill
        </button>

        <button
            type="button"
            onclick="closeModal()"
        >
            Cancel
        </button>
    `;

        /* Focus input automatically */

        setTimeout(() => {

            document
                .getElementById("skillInput")
                ?.focus();

        }, 50);

    }

   // ---- Edit Skill ----
if (type === "edit-skill" && skillDiv) {

    const oldName =
        skillDiv.querySelector("strong")
            ?.textContent
            .trim() || "";

    const currentXP =
        parseInt(
            skillDiv.dataset.xp || "0",
            10
        );


    content.innerHTML = `

        <h3>Edit Skill</h3>

        <input
            id="editSkillInput"
            type="text"
            value="${oldName.replace(/"/g, "&quot;")}"
            maxlength="50"
            autocomplete="off"
        >

        <p style="
            margin: 10px 0;
            opacity: 0.7;
            font-size: 13px;
        ">
            XP: ${currentXP}
        </p>

        <button
            type="button"
            onclick="updateSkill()"
        >
            Update
        </button>

        <button
            type="button"
            onclick="closeModal()"
        >
            Cancel
        </button>

    `;


    window.skillBeingEdited =
        skillDiv;


    setTimeout(() => {

        document
            .getElementById("editSkillInput")
            ?.focus();

    }, 50);
}

    // ---- Edit Mission ----
    if (type === "edit-mission" && skillDiv) {
        const oldText = skillDiv.querySelector(".mission-text").textContent.replace("🔥", "").trim();
        const oldDeadline = skillDiv.dataset.deadline || "";
        const isHardcore = skillDiv.dataset.hardcore === "true";

        content.innerHTML = `
      <h3>Edit Mission</h3>

      <input id="editMissionInput" value="${oldText}">

<label>Repeat</label>

<select id="editMissionRepeat">

  <option value="none"
    ${skillDiv.dataset.repeat === "none" || !skillDiv.dataset.repeat ? "selected" : ""}>
    Doesn't repeat
  </option>

  <option value="daily"
    ${skillDiv.dataset.repeat === "daily" ? "selected" : ""}>
    Every day
  </option>

  <option value="weekly"
    ${skillDiv.dataset.repeat === "weekly" ? "selected" : ""}>
    Every week
  </option>

  <option value="monthly"
    ${skillDiv.dataset.repeat === "monthly" ? "selected" : ""}>
    Every month
  </option>

</select>

      <label>Deadline</label>
      <input 
        id="editMissionDeadline" 
        type="datetime-local" 
        value="${oldDeadline}"
        ${isHardcore ? "disabled" : ""}
      >

      ${isHardcore
                ? `<p style="color:#ef4444;font-size:12px;margin-top:6px;">
              🔥 Hardcore mission — deadline cannot be changed
            </p>`
                : ""
            }

      <button onclick="updateMission()">Update</button>

      ${isHardcore
                ? `<button disabled 
              style="opacity:0.5;cursor:not-allowed;">
              🔒 Delete
            </button>`
                : `<button onclick="deleteMission()">Delete</button>`
            }

      <button onclick="closeModal()">Cancel</button>
    `;

        window.missionBeingEdited = skillDiv;
    }

    // ---- Add Goal ----
    if (type === "goal") {

        content.innerHTML = `
        <h3>Add Goal</h3>

        <input
            id="goalInput"
            placeholder="Goal"
            maxlength="100"
        >

        <label>Priority</label>

        <select id="priorityInput">
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
        </select>

        <label>Deadline</label>

        <input
            id="goalDeadline"
            type="datetime-local"
        >

        <button onclick="addGoal()">
            Add Goal
        </button>

        <button onclick="closeModal()">
            Cancel
        </button>
    `;

        const now =
            new Date()
                .toISOString()
                .slice(0, 16);

        document.getElementById(
            "goalDeadline"
        ).min = now;
    }


    // ---- Add Goal ----
    if (type === "goal") {
        content.innerHTML = `
    <h3>Add Goal</h3>
    <input id="goalInput" placeholder="Goal">

    <label>Priority</label>
    <select id="priorityInput">
      <option>High</option>
      <option>Medium</option>
      <option>Low</option>
    </select>

    <label>Deadline</label>
    <input id="goalDeadline" type="datetime-local">

    <button onclick="addGoal()">Add</button>
    <button onclick="closeModal()">Cancel</button>
  `;
    }


    // ---- Add Countdown (FIXED) ----
    if (type === "multi-time") {
        content.innerHTML = `
      <h3>Add Countdown</h3>
<input id="countdownTitle" placeholder="Title">
<input id="countdownDateTime" type="datetime-local">

<button onclick="addCountdown()">Add</button>
<button onclick="closeModal()">Cancel</button>

    `;
        const now = new Date().toISOString().slice(0, 16);
        document.getElementById("countdownDateTime").min = now;

    }
}

// ---- FIXED: closeModal OUTSIDE openModal ----
function closeModal() {
    document.getElementById("modal").classList.remove("active");

    // 🔥 RESET ALL MODAL INPUTS
    document.querySelectorAll("#modal input, #modal select").forEach(el => {
        el.value = "";
    });
}



/* Alerts */
/* Alerts */

let alertCallback = null;

function customAlert(msg, callback = null) {

    alertCallback = callback;

    document.getElementById("alertMsg").textContent =
        msg;

    document
        .getElementById("alertModal")
        .classList.add("active");
}


let reloadAfterAlert = false;

function closeAlert() {

    document
        .getElementById("alertModal")
        .classList.remove("active");

    if (reloadAfterAlert) {

        reloadAfterAlert = false;

        location.reload();

    }
}

/* Confirm */
let confirmCallback = null;

function customConfirm(msg, callback) {
    confirmCallback = callback;
    document.getElementById("confirmMsg").textContent = msg;
    document.getElementById("confirmModal").classList.add("active");
}

function confirmYes() {
    if (confirmCallback) confirmCallback();
    document.getElementById("confirmModal").classList.remove("active");
}

function confirmNo() {
    document.getElementById("confirmModal").classList.remove("active");
}


/* =========================================================
   5. MISSIONS MODULE
========================================================= */
const missionMilestones = [1];

for (let i = 5; i <= 250; i += 5) {
    missionMilestones.push(i);
}

function addMission() {

    const text =
        document.getElementById("missionInput")
            .value.trim();

    const deadline =
        document.getElementById("missionDeadline")
            .value;

    const linkedSkill =
        document.getElementById("linkedSkill")
            .value;

    const isHardcore =
        document.getElementById("hardcoreToggle")
            .checked;

    const repeat =
        document.getElementById("missionRepeat")
            .value;


    // ❌ Text required
    if (!text) {
        closeModal();
        return;
    }


    // 🔥 HARDCORE → DEADLINE REQUIRED
    if (isHardcore && !deadline) {

        customAlert(
            "🔥 Hardcore missions require a deadline."
        );

        return;
    }


    // ❌ Past deadline not allowed
    if (
        deadline &&
        isPastDateTime(deadline)
    ) {

        customAlert(
            "Deadline cannot be in the past."
        );

        return;
    }


    const li =
        document.createElement("li");

    li.dataset.missionId = crypto.randomUUID();


    /* =====================================================
       MISSION DATA
    ===================================================== */

    li.dataset.deadline =
        deadline || "";

    li.dataset.skill =
        linkedSkill || "";

    li.dataset.completed =
        "false";

    li.dataset.hardcore =
        isHardcore
            ? "true"
            : "false";

    li.dataset.repeat =
        repeat;

    li.dataset.repeatKey = getRepeatKey(new Date(), repeat);


    /* =====================================================
       FORMAT DEADLINE
    ===================================================== */

    let deadlineText = "";

    if (deadline) {

        const d =
            new Date(deadline);

        const date =
            d.toLocaleDateString(
                [],
                {
                    day: "numeric",
                    month: "short"
                }
            );

        const time =
            d.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        deadlineText =
            `${date}, ${time}`;
    }


    /* =====================================================
       MISSION HTML
    ===================================================== */

    li.innerHTML = `
        <span class="mission-text">
            ${text}
            ${isHardcore ? " 🔥" : ""}
        </span>

       <div class="deadline-row">

    <span class="deadlineDisplay">
        ${deadlineText}
    </span>

    ${repeat !== "none"
            ? `<span class="repeat-badge">
                ↻ ${repeat === "daily"
                ? "Daily"
                : repeat === "weekly"
                    ? "Weekly"
                    : "Monthly"
            }
               </span>`
            : ""
        }

    <span class="overdueMark"></span>

    <button
        class="complete-btn"
        onclick="completeMission(this)"
    >
        ✔
    </button>

</div>
    `;


    /* =====================================================
       CLICK TO EDIT
    ===================================================== */

    li.addEventListener(
        "click",
        (e) => {

            if (
                e.target.classList
                    .contains("complete-btn")
            ) {
                return;
            }

            openModal(
                "edit-mission",
                li
            );
        }
    );


    /* =====================================================
       ADD + SAVE
    ===================================================== */

    document
        .getElementById("mission-list")
        .appendChild(li);

    saveData();

    closeModal();
}




setInterval(checkMissedDeadlines, 30 * 1000); // check every 1 minute
function updateMission() {

    const li =
        window.missionBeingEdited;

    if (!li) return;


    const newText =
        document.getElementById(
            "editMissionInput"
        ).value.trim();


    const newDeadline =
        document.getElementById(
            "editMissionDeadline"
        ).value;


    const newRepeat =
        document.getElementById(
            "editMissionRepeat"
        ).value;


    const isHardcore =
        li.dataset.hardcore === "true";


    if (!newText) {

        closeModal();

        return;
    }


    /* =====================================================
       DEADLINE VALIDATION
    ===================================================== */

    if (
        !isHardcore &&
        newDeadline &&
        isPastDateTime(newDeadline)
    ) {

        customAlert(
            "Deadline cannot be in the past."
        );

        return;
    }


    /* =====================================================
       UPDATE TEXT
    ===================================================== */

    li.querySelector(
        ".mission-text"
    ).innerHTML =
        newText +
        (
            isHardcore
                ? " 🔥"
                : ""
        );


    /* =====================================================
       UPDATE REPEAT
    ===================================================== */

    li.dataset.repeat =
        newRepeat;

    const repeatBadge =
        li.querySelector(".repeat-badge");

    if (repeatBadge) {

        repeatBadge.textContent =
            newRepeat === "daily"
                ? "↻ Daily"
                : newRepeat === "weekly"
                    ? "↻ Weekly"
                    : newRepeat === "monthly"
                        ? "↻ Monthly"
                        : "";

    }

    /*
       If recurrence was changed,
       start a fresh occurrence.
    */

    li.dataset.repeatKey = getRepeatKey(new Date(), newRepeat);


    /* =====================================================
       UPDATE DEADLINE
    ===================================================== */

    if (!isHardcore) {

        if (newDeadline) {

            const d =
                new Date(newDeadline);

            const date =
                d.toLocaleDateString(
                    [],
                    {
                        day: "numeric",
                        month: "short"
                    }
                );

            const time =
                d.toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );

            li.querySelector(
                ".deadlineDisplay"
            ).textContent =
                `${date}, ${time}`;

            li.dataset.deadline =
                newDeadline;

        } else {

            li.querySelector(
                ".deadlineDisplay"
            ).textContent = "";

            li.dataset.deadline =
                "";
        }


        /* Reset overdue state */

        li.querySelector(
            ".overdueMark"
        ).innerHTML = "";

        delete li.dataset.deducted;
        delete li.dataset.overdueNotified;
        delete li.dataset.warned;
    }


    saveData();

    closeModal();
}



function checkMissedDeadlines() {
    const missions = document.querySelectorAll("#mission-list li");
    const now = Date.now();

    missions.forEach(li => {
        const deadline = li.dataset.deadline;
        if (!deadline) return;

        if (li.dataset.completed === "true") return;

        const deadlineTime = new Date(deadline).getTime();
        const timeLeft = deadlineTime - now;

        const overdueSpan = li.querySelector(".overdueMark");
        if (!overdueSpan) return;

        // 🔔 Due soon warning (once)
        if (
            timeLeft > 0 &&
            timeLeft <= 2 * 60 * 60 * 1000 &&
            !li.dataset.warned
        ) {
            li.dataset.warned = "true";
            pushNotification(
                "Mission Deadline",
                `"${li.querySelector('.mission-text').textContent}" is due soon (within 2 hours!)`
            );
        }

        // ⏰ DEADLINE PASSED
        if (timeLeft <= 0) {
            overdueSpan.innerHTML = `<span class="overdue-badge">Overdue</span>`;

            // 🔔 Notify overdue (once)
            if (!li.dataset.overdueNotified) {
                li.dataset.overdueNotified = "true";
                pushNotification(
                    "⚠ Mission Overdue",
                    `"${li.querySelector('.mission-text').textContent}" is overdue!`
                );
            }

            
            // 🔥 HARDCORE MODE — DEDUCT 5 POINTS (ONCE)
            if (
                li.dataset.hardcore === "true" &&
                !li.dataset.hardcorePunished
            ) {

                li.dataset.hardcorePunished = "true";
                li.dataset.deducted = "true";
                const hardcorePenalty = 5;

                const pointsBefore =
                    completedMissions;

                completedMissions = Math.max(
                    0,
                    completedMissions - hardcorePenalty
                );

                const pointsLost =
                    pointsBefore - completedMissions;

                localStorage.setItem(
                    "completedMissions",
                    completedMissions
                );

                document.getElementById(
                    "missionCounter"
                ).textContent =
                    completedMissions;

                renderMarketplace(
                    currentMarketplaceFilter
                );

                renderMyCards();

                showSmartNotification(
                    "🔥 Hardcore Failed",
                    `-${pointsLost} Improvement Points`
                );

                saveData();

                return;
            }

            // ❌ NORMAL MODE — DEDUCT 1 POINT (ONCE)
            if (!li.dataset.deducted) {

                const pointsBefore =
                    completedMissions;


                completedMissions = Math.max(
                    0,
                    completedMissions - 1
                );
                li.dataset.deducted = "true";

                const pointsDelta =
                    completedMissions - pointsBefore;

                recordMissionPerformance(
                    li,
                    "missed",
                    pointsDelta
                );

                document.getElementById(
                    "missionCounter"
                ).textContent =
                    completedMissions;

                localStorage.setItem(
                    "completedMissions",
                    completedMissions
                );

                saveData();
            }
        }
    });
}


function deleteMission() {
    const li = window.missionBeingEdited;
    if (!li) return;

    if (li.dataset.hardcore === "true") {
        const deadline = li.dataset.deadline;
        const now = Date.now();

        if (deadline && new Date(deadline).getTime() <= now) {
            customAlert("🔥 Hardcore missions cannot be deleted after deadline.");
            return;
        }

        customConfirm(
            "🔥 This is a Hardcore mission.\nDelete only if created by mistake?",
            () => {
                li.remove();
                saveData();
                closeModal();
            }
        );
        return;
    }

    // Normal mission
    li.remove();
    saveData();
    closeModal();
}


function completeMission(btn) {

    enforceDailyReset();

    renderMarketplace(currentMarketplaceFilter);


    const li =
        btn.closest("li");

    if (!li) return;


    const linkedSkill =
        li.dataset.skill;

    const deadline =
        li.dataset.deadline;

    const repeat =
        li.dataset.repeat || "none";


    /* =====================================================
       PREVENT DOUBLE COMPLETION
    ===================================================== */

    if (
        li.dataset.completed === "true"
    ) {
        return;
    }


    /* =====================================================
       MARK COMPLETED
    ===================================================== */

    li.dataset.completed = "true";


    /* =====================================================
       OVERDUE → NO REWARD
    ===================================================== */

    if (
        deadline &&
        new Date(deadline).getTime() < Date.now()
    ) {

        /*
         * Mission is already overdue.
         * It gets NO Improvement Point.
         */

        const completeBtn =
            li.querySelector(".complete-btn");

        /*
         * Disable the button immediately.
         * This occurrence is finished.
         */

        if (completeBtn) {

            completeBtn.disabled = true;

            completeBtn.style.opacity = "0.45";

        }


        /*
         * Mark the occurrence visually.
         */

        li.classList.add("completed");


        /*
         * One-time missions disappear.
         */

        if (repeat === "none") {

            li.classList.add("remove");

            setTimeout(() => {

                li.remove();

                saveData();

            }, 400);

        }


        /*
         * Recurring missions stay visible.
         * The recurrence engine will reset them
         * when the next occurrence begins.
         */

        else {

            showPopup(
                "Mission was overdue. No improvement points gained."
            );

            saveData();

        }

        return;
    }


    /* =====================================================
       DAILY LIMIT
    ===================================================== */

    // if (
    //     dailyImprovementCount >=
    //     DAILY_IMPROVEMENT_LIMIT
    // ) {

    //     li.dataset.completed = "false";

    //     showPopup(
    //         "You're too tired today. No improvement points gained."
    //     );

    //     saveData();

    //     return;
    // }


    /* =====================================================
       SUCCESSFUL COMPLETION
    ===================================================== */

    const canEarnImprovementPoint =
    dailyImprovementCount < DAILY_IMPROVEMENT_LIMIT;

if (canEarnImprovementPoint) {
    completedMissionCount++;
    dailyImprovementCount++;
    completedMissions++;
}

const isMissionAchievement =
    missionMilestones.includes(completedMissions);

    if (!isMissionAchievement) {
        playAppTone("mission");
    }

    recordMissionPerformance(
        li,
        "completed",
        1
    );

    /* =====================================================
   SEASON XP
===================================================== */

    if (
        window.StandOutSeason &&
        typeof window.StandOutSeason.addXP === "function"
    ) {

        window.StandOutSeason.addXP(
            10,
            "Mission"
        );

    }

    if (
        typeof Momentum !== "undefined" &&
        typeof Momentum.reload === "function"
    ) {
        Momentum.reload();
    }

    localStorage.setItem(
        "dailyImprovementCount",
        dailyImprovementCount
    );

    localStorage.setItem(
        "completedMissions",
        completedMissions
    );


    document.getElementById(
        "missionCounter"
    ).textContent =
        completedMissions;


    /* =====================================================
       SKILL XP
    ===================================================== */

    if (linkedSkill) {

        increaseSkillXP(
            linkedSkill,
            1
        );

    }


    /* =====================================================
       ACHIEVEMENTS
    ===================================================== */

    checkMissionAchievements();


    /* =====================================================
       RECURRING vs ONE-TIME
    ===================================================== */

    if (repeat === "none") {

        /*
           Normal mission:
           remove it permanently.
        */

        li.classList.add(
            "remove"
        );

        setTimeout(() => {

            li.remove();

            saveData();

        }, 400);


    } else {

        /*
           Recurring mission:
           KEEP the mission.

           It becomes completed for
           the current occurrence.

           Tomorrow/week/month it will
           be reset by the recurrence engine.
        */

        li.classList.add(
            "completed"
        );


        const completeBtn =
            li.querySelector(
                ".complete-btn"
            );

        if (completeBtn) {

            completeBtn.disabled =
                true;

            completeBtn.style.opacity =
                "0.45";

        }


        /*
           Remove deadline warning
           because today's occurrence
           has already been completed.
        */

        const overdueMark =
            li.querySelector(
                ".overdueMark"
            );

        if (overdueMark) {
            overdueMark.innerHTML = "";
        }

    }


   showPopup(
    canEarnImprovementPoint
        ? (
            repeat === "none"
                ? "Mission completed! Improvement point gained."
                : "Mission completed! It will return for the next occurrence."
        )
        : (
            repeat === "none"
                ? "Mission completed! No Improvement Point gained. Daily Improvement Limit Reached."
                : "Mission completed! No Improvement Point gained. Daily Improvement Limit Reached. It will return for the next occurrence."
        )
);


    saveData();
}



window.addImprovementPoints = function (amount) {

    amount = Number(amount) || 0;

    if (amount <= 0) {
        return completedMissions;
    }

    completedMissions += amount;

    localStorage.setItem(
        "completedMissions",
        completedMissions
    );

    const counter =
        document.getElementById(
            "missionCounter"
        );

    if (counter) {
        counter.textContent =
            completedMissions;
    }

    renderMarketplace(
        currentMarketplaceFilter
    );

    return completedMissions;
};
//

/* =========================================================
   RECURRING MISSIONS
========================================================= */

function getRepeatKey(date = new Date(), repeat = "daily") {

    const d = new Date(date);

    if (repeat === "daily") {

        return [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, "0"),
            String(d.getDate()).padStart(2, "0")
        ].join("-");

    }


    if (repeat === "weekly") {

        const day =
            d.getDay();

        d.setDate(
            d.getDate() - day
        );

        return [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, "0"),
            String(d.getDate()).padStart(2, "0")
        ].join("-");

    }


    if (repeat === "monthly") {

        return [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, "0")
        ].join("-");

    }


    return "once";
}


/* =========================================================
   REFRESH RECURRING MISSIONS
========================================================= */

function refreshRecurringMissions() {

    const missions =
        document.querySelectorAll(
            "#mission-list li"
        );

    const today = new Date();

    let changed = false;


    missions.forEach(li => {

        const repeat =
            li.dataset.repeat || "none";

        if (repeat === "none") {
            return;
        }


        const currentKey =
            getRepeatKey(
                today,
                repeat
            );

        const previousKey =
            li.dataset.repeatKey;


        /*
         * First time this mission is using
         * recurrence.
         */

        if (!previousKey) {

            li.dataset.repeatKey =
                currentKey;

            changed = true;

            return;
        }


        /*
         * Same occurrence.
         * Don't reset anything.
         */

        if (previousKey === currentKey) {
            return;
        }


        /*
         * NEW OCCURRENCE
         */

        resetRecurringMission(
            li,
            currentKey
        );

        changed = true;

    });


    if (changed) {
        saveData();
    }
}


/* =========================================================
   RESET ONE RECURRING MISSION
========================================================= */

function resetRecurringMission(li, currentKey) {

    const repeat =
        li.dataset.repeat || "none";


    /* New occurrence */

    li.dataset.repeatKey =
        currentKey;

    li.dataset.completed =
        "false";


    /* Reset visual state */

    li.classList.remove(
        "completed",
        "remove"
    );


    /* Reset old warning / penalty state */

    delete li.dataset.deducted;
    delete li.dataset.overdueNotified;
    delete li.dataset.warned;
    delete li.dataset.hardcorePunished;


    /* Enable complete button */

    const completeBtn =
        li.querySelector(
            ".complete-btn"
        );

    if (completeBtn) {

        completeBtn.disabled =
            false;

        completeBtn.style.opacity =
            "";

    }


    /* Clear overdue indicator */

    const overdueMark =
        li.querySelector(
            ".overdueMark"
        );

    if (overdueMark) {
        overdueMark.textContent = "";
    }


    /* Move deadline */

    if (repeat !== "none") {

        shiftRecurringDeadline(
            li,
            repeat
        );

    }
}


/* =========================================================
   UPDATE DAILY DEADLINE
========================================================= */

