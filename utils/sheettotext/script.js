
const quillInput = new Quill('#input-editor');
const quillOutput = new Quill('#output-editor');
const quillNote = new Quill('#note-editor');


document.getElementById("copyOutput").addEventListener("click", addOutputToClipboard);
document.getElementById("input-index-number").addEventListener('input', setTextCursor(quillInput));
//document.getElementById("input-editor-header").addEventListener('click', focusEditor(quillInput));

document.getElementById("get-image-toogle").addEventListener('change', hideGetImage);
document.getElementById("get-image-toogle").onload = hideGetImage();
document.getElementById("convert-notification-checkbox").onload = checkConvertAlert();
document.getElementById("convert-notification-checkbox").addEventListener('change', changeConvertAlert);
document.getElementById("input-editor").onload = loadInput();
document.getElementById("note-editor").onload = loadNote();

function checkConvertAlert(){
    let check = localStorage.getItem("is-convert-alert-checked");
    let checkbox = document.getElementById("convert-notification-checkbox");
    if(check === "false" || check === false){
        checkbox.checked = false;
    }else{
        checkbox.checked = true;
    }
}
function changeConvertAlert(){
    let checkbox = document.getElementById("convert-notification-checkbox").checked;
    localStorage.setItem("is-convert-alert-checked",checkbox);
}

function hideGetImage(){
    let toogle = document.getElementById('get-image-toogle');
    let isToogleBefore = localStorage.getItem("get-google-image");
    if(isToogleBefore === true){
        toogle.checked = true;
    }else if(isToogleBefore === false){
        toogle.checked = false;
    }

    let body = document.getElementById("get-image-body");
    if(toogle.checked){
        body.hidden = false;
        localStorage.setItem("get-google-image",true);
    }else{
        body.hidden = true;
        localStorage.setItem("get-google-image",false);
    }
}

quillNote.on('text-change', () => {
    localStorage.setItem('note-data', quillNote.getText());
});

function loadNote(){
    let data = localStorage.getItem('note-data');
    if (data != null){
        quillNote.setText(data);
    }
}

function loadInput(){
    let data = localStorage.getItem('input-data');
    if (data != null){
        quillInput.setText(data);
    }
}

quillInput.on('text-change', () => {
    localStorage.setItem('input-data', quillInput.getText());
});

//Set index after change text cursor
quillInput.on('selection-change', (range, oldRange, source) => {
    if (range) {
        if (range.length == 0) {
            setIndexCounter(range.index);
        }
    }
});

//Set max value for input index after change text
quillInput.on('text-change', (delta, oldDelta, source) => {
    let indexAttribute = document.getElementById("input-index-number");
    indexAttribute.max = quillInput.getLength() - 1;
    setIndexCounter(quillInput.getSelection().index)
});

function focusEditor(editor){
    console.log('focused');
    editor.focus();
}

function setTextCursor(editor) {
    let index = document.getElementById("input-index-number");
    editor.setSelection(index.value, 0);
}

function setIndexCounter(index) {
    document.getElementById("input-index-number").value = index;
}

function clearUrl() {
    let urlElement = document.getElementById("urlFile");
    urlElement.value = "";
    setStatus('Waiting for file...', 'black')
}

function setStatus(content, color) {
    let urlElement = document.getElementById("status");
    urlElement.innerText = content;
    urlElement.style.color = color;
}

function addOutputToClipboard() {
    let text = quillOutput.getText();
    navigator.clipboard.writeText(text);
}

const toastTrigger = document.getElementById('liveToastBtn')
const toastLiveExample = document.getElementById('liveToast')

if (toastTrigger) {
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
  toastTrigger.addEventListener('click', () => {
    toastBootstrap.show()
  })
}