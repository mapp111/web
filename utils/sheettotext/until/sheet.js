const CLIENT_ID = '1055118385462-9jqse56ffa8jstjg24pp1fuoj665rs5b.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDAYHYNKRq6zzW2qDan28uqkYOFpOknkQA';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly'
let tokenClient;
let gapiInited = false;
let gisInited = false;
let spreadsheet;
let sheet;
let retryRequest = 5;

document.getElementById("get-link-image-drive").addEventListener("click", getlink);

document.getElementById("getFileButton").addEventListener("click", getSpreadsheetData);
document.getElementById("clearUrl").addEventListener("click", clearUrl);
document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';
document.getElementById("convert").addEventListener("click", convertOnly);
document.getElementById("convert-n-copy").addEventListener("click", convertAndCopy);

function getlink(){
    console.log(typeof(gapi));
}

//setup
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.visibility = 'visible';
    }
}

//for login/auth request
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        document.getElementById('signout_button').style.visibility = 'visible';
        document.getElementById('authorize_button').innerText = 'Refresh';
    };

    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
    }
}
//for signout request
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        document.getElementById('authorize_button').innerText = 'Authorize';
        document.getElementById('signout_button').style.visibility = 'hidden';
        clearUrl();
    }
}

//parse sheet url to id
function getIdFromUrl() {
    let url = document.getElementById("urlFile").value;
    if (url.trim() === '') {
        console.log('Url đang trống');
    } else {
        let id = url.match(/[-\w]{25,}(?!.*[-\w]{25,})/);
        //console.log(id);
        return id;
    }
}

function clearUrl() {
    let urlElement = document.getElementById("urlFile");
    urlElement.value = "";
    spreadsheet = '';
    sheet = '';
    document.getElementById("namefile").innerHTML = 'null';
    document.getElementById("idfile").innerHTML = 'null';
    clearOption(document.getElementById('sheetName'));
}


async function getSpreadsheetData() {
    let res;
    try {
        const request = {
            spreadsheetId: getIdFromUrl(),
            includeGridData: false,
        };
        //console.log(await gapi.client.sheets.spreadsheets.get(request));
        res = await gapi.client.sheets.spreadsheets.get(request);
    } catch (error) {
        console.log("Error get sheetId");
        alert('Error when getting sheet!');
        return;
    }
    //paste namefile, id to interface
    spreadsheet = res.result;
    document.getElementById("namefile").innerHTML = spreadsheet.properties.title;
    document.getElementById("idfile").innerHTML = spreadsheet.spreadsheetId;
    getListSheetsName();
}

//get list of sheets name from spreadsheet
function getListSheetsName() {
    let sheet = spreadsheet.sheets;
    let sheetsNameAttribute = document.getElementById('sheetName');
    clearOption(sheetsNameAttribute);
    for (i = 0; i < sheet.length; i++) {
        //console.log(sheet[i].properties.title);
        let option = document.createElement('option');
        option.value = sheet[i].properties.title;
        option.innerHTML = sheet[i].properties.title;
        sheetsNameAttribute.appendChild(option);
    }
}

function clearOption(attribute) {
    attribute.innerHTML = '';
}

async function getSheetData() {
    let response;
    let sheetId = getIdFromUrl();
    let sheetRange = document.getElementById('sheetName').value;
    try {
        response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: sheetRange,
        });
    } catch (err) {
        console.log(err.message);
        alert('Error when get sheet');
        return;
    }
    const range = response.result;
    if (!range || !range.values || range.values.length == 0) {
        return;
    }
    console.log(range.values[0][0]);
    //return range.value;
}


async function getLiveRowData() {
    let response;
    let sheetId = getIdFromUrl();
    let row = document.getElementById('sheet-row').value;
    let sheetRange = document.getElementById('sheetName').value + '!' + row + ':' + row;
    try {
        response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: sheetRange,
        });
    } catch (err) {
        console.log(err.message);
        alert('Error when get sheet');
        return;
    }
    const range = response.result;
    if (!range || !range.values || range.values.length == 0) {
        return;
    }
    //console.log(range.values);
    return range.values;
}


function lettersToNumber(letters) {
    for (var p = 0, n = 0; p < letters.length; p++) {
        n = letters[p].charCodeAt() - 65 + n * 26;
    }
    return n;
}

function insertTextToOutPut(text, location) {
    quillOutput.insertText(location, text.trim());
}

//do a convert
async function convertText() {
    let listDataType = initializeTest();
    quillOutput.setContents(quillInput.getContents());
    let row = await getLiveRowData();
    for (let i = listDataType.length - 1; i >= 0; i--) {
        switch (listDataType[i].type) {
            case 'value':
                if (!row[0][lettersToNumber(listDataType[i].col)]) {
                    break;
                }
                insertTextToOutPut(row[0][lettersToNumber(listDataType[i].col)], listDataType[i].index);
                break;
            case 'divider':
                if (!row[0][lettersToNumber(listDataType[i].col)]) {
                    break;
                }
                let data = row[0][lettersToNumber(listDataType[i].col)];
                insertTextToOutPut(valueSeperator(data, listDataType[i].separator, listDataType[i].location), listDataType[i].index);
                break;
            case 'replace':
                //console.log('in index:' + i);
                if (!row[0][lettersToNumber(listDataType[i].col)]) {
                    break;
                }
                let text = await replaceConvertion(
                    row[0][lettersToNumber(listDataType[i].col)],
                    listDataType[i].separator,
                    listDataType[i].target,
                    listDataType[i].useZeroRemover
                );
                insertTextToOutPut(text, listDataType[i].index);
                break;
            case 'sheettitle':
                let title = getSheetTitle();
                if (title) {
                    insertTextToOutPut(title, listDataType[i].index);
                }
                break;
            default:
                break;
        }
    }
}

async function convertOnly(){
    await convertText();
    let convertNotificationCheckbox = localStorage.getItem("is-convert-alert-checked");
    if(convertNotificationCheckbox === true || convertNotificationCheckbox ==="true" || convertNotificationCheckbox === "undefined"){
        alert("Convert Completed!");
    }
}

async function convertAndCopy(){
    await convertText();
    addOutputToClipboard();
    let convertNotificationCheckbox = localStorage.getItem("is-convert-alert-checked");
    if(convertNotificationCheckbox === true || convertNotificationCheckbox ==="true" || convertNotificationCheckbox === "undefined"){
        alert("Convert Completed!");
    }
}

function getSheetTitle() {
    let title = document.getElementById('sheetName').value;
    if (title) {
        return title;
    }

}

function valueSeperator(value, separator, index) {
    let array = value.split(separator);
    return array[index - 1];
}

function replaceConvertion(value, separator, target, useZeroRemover) {
    let listTarget
    // console.log(typeof target);
    // console.log(target);
    if (typeof target === 'string') {
        listTarget = [target];
    } else {
        listTarget = target.split(';');
    }
    separator = separator.trim();
    if (useZeroRemover) {
        for (i = (value.length) - 1; i >= 0; i--) {
            if (value.charAt(i) !== '0') {
                value = value.substring(0, i + 1);
                //console.log(value);
                break;
            }
        }
    }
    //count separator of value
    let targetIndex = 0;
    for (i = 0; i < value.length; i++) {
        if (value.charAt(i) === separator) {
            if (targetIndex < listTarget.length) {
                value = value.replace(separator, listTarget[targetIndex]);
                targetIndex++;
            } else {
                targetIndex = 0;
            }
        }
    }
    return value;

}

//prebuilt parameter for testing

function initializeTest() {
    let array = [
        new dataPoint(12, 'B', 'value'),
        new sheetNameDataPoint(18, 'sheettitle'),
        new replaceDataPoint(30, 'C', 'replace', '.', 'tr', true),
        new dataPoint(46, 'E', 'value'),
        new dataPoint(63, 'D', 'value'),
        new dataPoint(78, 'A', 'value'),
        new dataPoint(93, 'G', 'value'),
        new dataPoint(109, 'H', 'value'),
        new dataPoint(114, 'I', 'value'),
        new divideDataPoint(128, 'J', 'divider', '/', 1),
        new divideDataPoint(141, 'J', 'divider', '/', 2),
        new divideDataPoint(157, 'K', 'divider', '/', 1),
        new divideDataPoint(172, 'K', 'divider', '/', 2),
        new divideDataPoint(199, 'K', 'divider', '/', 3),
        new dataPoint(211, 'L', 'value'),
        new dataPoint(227, 'M', 'value')
    ]
    return array;
}

//Datatype Class

class dataPoint {
    constructor(index, col, type) {
        this.index = index;
        this.col = col;
        this.type = type;
    }
}
class divideDataPoint extends dataPoint {
    constructor(index, col, type, separator, location) {
        super(index, col, type);
        this.separator = separator;
        this.location = location;
    }
}
class replaceDataPoint extends dataPoint {
    constructor(index, col, type, separator, target, useZeroRemover) {
        super(index, col, type);
        this.separator = separator;
        this.target = target;
        this.useZeroRemover = useZeroRemover;
    }
}
class sheetNameDataPoint extends dataPoint{
    constructor(index, type){
        super(index, undefined, type);
    }
}