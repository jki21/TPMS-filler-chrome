function fillTimeSheet() {
    const innerDoc = document.getElementsByTagName("frame")[1].contentDocument.getElementsByTagName("frame")[2].contentDocument;
    function findProjectHours() {
        return [...innerDoc.querySelectorAll("#alcDetail.summary")].map(lbl => lbl.innerText.split(" ")[1]);
    }

    function getCalendarDays() {
        return [...innerDoc.querySelectorAll("tr.heading#projectSection td.sunday, tr.heading#projectSection td.monday, tr.heading#projectSection td.today")].map(e => {
            return {
                isWorkDay: e.className !== "sunday"
            }
        });
    }

    function planDays(projectHours, days) {
        function EmptyDay() {
            return projectHours.map(e => 0);
        }

        function hoursLeftIn(day) {
            return 8 - day.workDetails.reduce((a, b) => a + b, 0);
        }

        let projectHourBalance = projectHours.slice();
        days.forEach(day => {
            day.workDetails = [];
            if (!day.isWorkDay)
                day.workDetails = EmptyDay();
            else {
                projectHourBalance = projectHourBalance.map(projectHours => {
                    const hourLeft = hoursLeftIn(day);

                    if (projectHours <= 0) {
                        day.workDetails.push(0);
                        return projectHours;
                    }

                    if (projectHours > hourLeft) {
                        day.workDetails.push(hourLeft);
                        return projectHours - hourLeft;
                    }

                    day.workDetails.push(projectHours);
                    return 0;
                })
            }
        });
        return days;
    }

    function main() {
        const projectHours = findProjectHours();
        console.log(projectHours);
        const days = planDays(projectHours, getCalendarDays());
        console.log(days);

        let hours = [];
        for (let i = 0; i < projectHours.length; i++) {
            days.forEach(day => hours.push(day.workDetails[i]));
        }
        console.log(hours);
        const inputs = [...innerDoc.querySelectorAll("input.text1")];
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].value = hours[i];
        }
    }


    main();
}


chrome.action.onClicked.addListener((tab) => {
    if (!tab.url.includes("chrome://")) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: fillTimeSheet
        });
    }
});
