
const quillInput = new Quill('#input-editor');
const quillOutput = new Quill('#output-editor');
const quillNote = new Quill('#note-editor');


document.getElementById("copyOutput").addEventListener("click", addOutputToClipboard);
document.getElementById("goToIndex").addEventListener("click", goToIndex(quillInput));
document.getElementById("input-index-number").addEventListener('input', setTextCursor(quillInput));
//document.getElementById("input-editor-header").addEventListener('click', focusEditor(quillInput));

//Set index after change text cursor
quillInput.on('selection-change', (range, oldRange, source) => {
    if (range) {
        if (range.length == 0) {
            setIndexCounter(range.index)
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

function goToIndex(editor) {
    var bounds = editor.selection.getBounds(
        document.getElementById("input-index-number").value,0
    );
    if (bounds) {
        editor.scrollRectIntoView(bounds);
    }
}
