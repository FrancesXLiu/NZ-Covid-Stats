const displayDiv = (div) => {
    const tabList = ["dailyCase", "infographic", "statistician"];
    tabList.forEach(e => {
        if (e == div) {
            document.getElementById(`${e}Div`).style.display = "block";
        } else {
            document.getElementById(`${e}Div`).style.display = "none";
        }
    })
}

const fetchVersion = () => {
    fetch("https://cws.auckland.ac.nz/Qz2021JGC/api/Version")
        .then(res => res.text())
        .then(data => {
            document.getElementById("versionLine").innerText = `\u00A9 All rights reserved.  ${data}`;
        })
}

// Daily Cases
const displayCases = () => {
    htmlString = `<div class="casesRow"> <div class="caseKey" style="font-weight:bold">Date</div> <div class="caseValue" style="font-weight:bold">Number of cases</div></div>`;
    fetch("https://cws.auckland.ac.nz/Qz2021JGC/api/CaseCounts")
        .then(res => res.json())
        .then(data => {
            console.log(data);
            for (const [key, value] of Object.entries(data)) {
                htmlString += ` 
                <div class="casesRow">
                    <div class = "caseKey" > ${key} </div> 
                    <div class = "caseValue" > ${value} </div> 
                </div>
                `
            }
            document.getElementById("caseData").innerHTML += htmlString;
        })

}

// Infographic
const fetchIcon = () => {
    fetch("https://cws.auckland.ac.nz/Qz2021JGC/api/PersonIcon")
        .then(res => res.text())
        .then(data => {
            const splitData = data.split("><");
            const idString = splitData.find(e => e.includes('id'));
            document.getElementById("infographic").innerHTML += data;
            const id = idString.slice(idString.search("id") + 4, idString.search("viewBox") - 2);
            fetchCases(id);
        })
}
const fetchCases = (id) => {
    fetch("https://cws.auckland.ac.nz/Qz2021JGC/api/CaseCounts")
        .then(res => {
            return res.json();
        })
        .then(data => {
            const newData = Object.entries(data).slice(-10);
            console.log(newData)
            drawInfographic(newData, id);
            drawGraph(data);
        })
}

const drawInfographic = (data, id) => {
    let htmlString = "";
    for (let i = 0; i < data.length; i++) {
        htmlString += ` 
        <div class = "infoRow">
            <br/><br/><br/><span style = "display: inline-block; vertical-align: middle; line-height: 2em;" >${data[i][0]}: </span>
    `
        const personNumTens = parseInt(data[i][1] / 10);
        const personNumOnes = data[i][1] % 10;
        console.log(data[i][1]);
        console.log("personNumTens: " + personNumTens);
        console.log("personNumOnes: " + personNumOnes);
        htmlString += ` <div class = "iconDiv"> `;
        for (let j = 0; j < personNumTens; j++) {
            htmlString += ` 
            <svg xmlns = 'http://www.w3.org/2000/svg' class = "icon" viewBox = "0 0 10 10" >
                <use xlink: href = "#${id}" / >
            </svg>
            `
        };
        const clipPercent = personNumOnes * 10;
        // console.log(clipPercent);
        htmlString += ` 
        <svg xmlns = 'http://www.w3.org/2000/svg' class = "icon" viewBox = "0 0 10 10" >
            <use xlink: href = "#${id}" style = "clip-path:inset(0 ${100 - clipPercent}% 0 0)" / >
        </svg> </div></div>
        `
    }
    // console.log(htmlString);
    document.getElementById("infographic").innerHTML += htmlString;
}

const drawGraph = (data) => {
    let htmlString = ` 
    <svg xmlns = 'http://www.w3.org/2000/svg' class = 'line' viewBox = '0 0 1020 550' transform = 'scale(1, -1)'> `;
    // console.log(data);
    let xValue = 0;
    const first = Object.keys(data)[0];
    const last = Object.keys(data)[Object.keys(data).length - 1];
    for (const [key, value] of Object.entries(data)) {
        console.log(key, value);
        htmlString += ` 
        <rect x = "${xValue}" y="0" width="2" height="${value * 5}" fill="none" stroke="black" />
        `;
        xValue += 2;
    }
    htmlString += `
    </svg>
    <div style="margin-bottom:45px; margin-top:-15px">
        <p style="float: left">${first}</p> 
        <p style = "float: right"> ${ last } </p>
    </div>`;
    document.getElementById("lineGraph").innerHTML += htmlString;
}

// Statistician

const fetchVCard = (upi, imageId) => {
    fetch(`http://localhost:5050/proxy?url=https://unidirectory.auckland.ac.nz/people/vcard/${upi}`)
        .then(res => res.text())
        .then(data => {
            const dataList = data.split("\n");
            console.log(dataList);
            let fullName = "";
            let ORG = "";
            let TITLE = "";
            let TEL = "";
            let ADR = "";
            let EMAIL = "";
            let REV = "";
            const fullNameString = dataList.find(e => e.includes("FN:"));
            fullName = fullNameString.slice(3);
            const ORGString = dataList.find(e => e.includes("ORG:"));
            if (ORGString !== undefined) {
                ORG = ORGString.slice(4);
            }
            const titleString = dataList.find(e => e.includes("TITLE:"));
            if (titleString !== undefined) {
                TITLE = titleString.slice(6);
            }
            const TelString = dataList.find(e => e.includes("TEL;TYPE"));
            if (TelString !== undefined) {
                // console.log(TelString.search("\\+"));
                TEL = TelString.slice(TelString.search("\\+"));
            }
            const adrString = dataList.find(e => e.includes("ADR;TYPE"));
            if (adrString !== undefined) {
                ADR = adrString.slice(adrString.search(";;") + 2);
            }
            const emailString = dataList.find(e => e.includes("EMAIL;TYPE"));
            if (emailString !== undefined) {
                EMAIL = emailString.slice(emailString.search("INTERNET:") + 9);
            }
            const revString = dataList.find(e => e.includes("REV:"));
            if (revString !== undefined) {
                REV = revString.slice(4);
            }
            displayVCard(upi, fullName, ORG, TITLE, TEL, ADR, EMAIL, REV, imageId);
        })
}

const displayVCard = (upi, fullName, ORG, TITLE, TEL, ADR, EMAIL, REV, imageId) => {
    let htmlString = `<div style="text-align:center"><img src="https://unidirectory.auckland.ac.nz/people/imageraw/${upi}/${imageId}/biggest" alt="Statistician Photo" style="width:300px"/></div><br/><br/>`;
    htmlString += `<div id="vcardContent"> <div style="font-weight: bold; font-size: larger">${fullName}</div><br/><br/>`;
    htmlString += `
    <div>Organization: ${ORG}</div><br/><br/>
    <div>Title: ${TITLE}</div><br/><br/>
    <div>Tel: <a href="tel:${TEL}">${TEL}</a></div><br/><br/>
    <div>Address: ${ADR}</div><br/><br/>
    <div>Email: <a href="mailto:${EMAIL}">${EMAIL}</a></div><br/><br/>
    <div>REV: ${REV}</div><br/><br/>
    <div style="font-weight: bold; font-size: larger"><a href="https://unidirectory.auckland.ac.nz/people/vcard/${upi}">Save to Address book</a></div><br/><br/>
    `;
    document.getElementById("vcard").innerHTML = htmlString;
}

const fetchStatistician = () => {
    fetch("https://cws.auckland.ac.nz/Qz2021JGC/api/Statistician")
        .then(res => res.json())
        .then(data => {
            console.log(data);
            const upi = data.upi;
            const imageId = data.imageId;
            console.log(upi);
            console.log(imageId);
            fetchVCard(upi, imageId);
        })
}

window.onload = () => {
    displayDiv("dailyCase");
    displayCases();
    fetchVersion();
    fetchVersion();
};