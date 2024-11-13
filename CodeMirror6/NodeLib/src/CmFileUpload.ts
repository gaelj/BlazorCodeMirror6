import { EditorView } from "@codemirror/view"
import { EditorSelection } from '@codemirror/state'
import { CmSetup } from "./CmSetup"
import { CMInstances } from "./CmInstance"
import { consoleLog } from "./CmLogging"


function isFileDragEvent(event: DragEvent): boolean {
    let isFile = false
    for (let i = 0; i < event.dataTransfer.types.length; i++) {
        if (event.dataTransfer.types[i] == "Files")
            isFile = true
    }
    return isFile
}

export function getFileUploadExtensions(id: string, setup: CmSetup)
{
    const overlayId = `${id}-file-upload`
    if (document.getElementById(overlayId)) return []

    const overlay = document.createElement("div")
    overlay.id = overlayId
    overlay.innerHTML = `<i class="${setup.fileIcon} me-2"></i> Drop files here`
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10;
        pointer-events: none;
        font-size: x-large;
    `
    let depth = 0

    const editorContainer = document.getElementById(id)
    if (!editorContainer) {
        return []
    }
    editorContainer.style.position = 'relative'
    editorContainer.appendChild(overlay)

    const dragAndDropHandler = EditorView.domEventHandlers({
        dragenter(event, view) {
            if (!CMInstances[id].config.supportFileUpload || !isFileDragEvent(event)) return
            event.preventDefault()
            overlay.style.display = 'flex'
            depth++
        },
        dragleave(event, view) {
            if (!CMInstances[id].config.supportFileUpload || !isFileDragEvent(event)) return
            event.preventDefault();
            depth--
            if (depth === 0) {
                overlay.style.display = 'none'
            }
        },
        dragover(event, view) {
            if (!CMInstances[id].config.supportFileUpload || !isFileDragEvent(event)) return
            event.preventDefault()
            overlay.style.display = 'flex'
        },
        drop(event, view) {
            if (!isFileDragEvent(event)) return
            consoleLog(id, "drop")
            const fileList = event.dataTransfer?.files
            if (fileList) {
                for (let i = 0; i < fileList.length; i++) {
                    consoleLog(id, fileList[i].name, fileList[i].type)
                }
                overlay.style.display = 'none'
                const { clientX, clientY } = event
                const pos = view.posAtCoords({ x: clientX, y: clientY })
                if (pos !== null) {
                    let newSelection = EditorSelection.single(pos)
                    view.dispatch({
                        selection: newSelection
                    });
                }
                processAddedFiles(id, fileList, view, event)
                depth = 0
            }
        }
    })

    return [ dragAndDropHandler ]
}

async function uploadFileWithDotnet(id: string, file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const byteArray = new Uint8Array(arrayBuffer)
    const lastModifiedDate = new Date(file.lastModified)
    return await CMInstances[id].dotNetHelper.invokeMethodAsync('UploadFileFromJS', byteArray, file.name, file.type, lastModifiedDate)
}

async function encodeFileAsDataUrl(id: string, file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = function (e) {
            consoleLog(id, "Encoded file as data URL:", e.target.result as string)
            resolve(e.target.result as string)
        }
        reader.onerror = function (e) {
            consoleLog(id, "Error encoding file as data URL:", e)
            reject(e)
        }
        reader.readAsDataURL(file)
    })
}

export async function processAddedFiles(id: string, fileList: FileList, view: EditorView, event: DragEvent | ClipboardEvent) {
    const hasOtherFileType = Array.from(fileList).some(f => f.type && !f.type.startsWith("text/"))
    if (!CMInstances[id].config.insertDroppedFileContents || hasOtherFileType) {
        event.preventDefault()
        event.stopPropagation()
        uploadFiles(id, fileList, view)
    }
}

export async function uploadFiles(id: string, files: FileList, view: EditorView) {
    if (!CMInstances[id].config.supportFileUpload) return
    const fileUrls = []
    const embedUploadsAsDataUrls = CMInstances[id].config.embedUploadsAsDataUrls
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileUrl = embedUploadsAsDataUrls
            ? await encodeFileAsDataUrl(id, file)
            : await uploadFileWithDotnet(id, file)
        fileUrls.push(fileUrl)
        consoleLog(id, "Uploaded file:", fileUrl)
        const fileName = files[0].name
        var imageChar = file.type.indexOf("image/") === 0 ? "!" : ""
        var mdLink = `\n${imageChar}[${fileName}](${fileUrl})\n`
        const ranges = view.state.selection.ranges;
        const lastRange = ranges[ranges.length - 1];

        view.dispatch(
            {
                changes: { from: view.state.selection.main.from, insert: mdLink },
                selection: { anchor: lastRange.from + mdLink.length, head: lastRange.from + mdLink.length }
            },
            {
                scrollIntoView: true
            }
        )
    }
    return fileUrls
}
