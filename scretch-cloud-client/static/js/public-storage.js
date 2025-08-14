const REQUEST_DEFAULT_HEADERS = [
    { "Content-Type": "Application/Json" }
]

function bootstrap() {
    const {app, router} = builder({
        withRouter: true,
        renderElements: false,
        executeCallback: {
            isNeeded: false
        },
        rootElem: {
            auto: true
        }
    })

    const HTMLProvider = new MiragoHTML(app)
    const id = MiragoRouter.getCurrentQueryArgs(`id`)

    const storage = useHttp(`http://localhost:3000/api/storage/get-public/${id}`, `GET`, ``, REQUEST_DEFAULT_HEADERS)

    if (storage.code === 200) {
        const storageComponent = app.createComponent(`div`, `storage-div`, `storage-container`, ``)

        HTMLProvider.insertHTML(storageComponent, `toEnd`, `
            <div class="storage-card">
               <div class="storage-info">
                   <div class="info-block">
                       <span>Название:</span>
                       <span>${storage.response.name}</span>
                   </div>
                   <div class="info-block">
                       <span>Размер:</span>
                       <span>${storage.response.size / 1024 / 1024} MB</span>
                   </div>
                <h1>${storage.response.files.length !== 0 ? "Файлы:" : "В этом хранилище нет файлов"}</h1>
            </div>    
        `)

        const fileListComponent = app.createComponent(`div`, `file-list`, `file-list`, ``)

        if (storage.response.files) {
            for (const file of storage.response.files) {
                HTMLProvider.insertHTML(fileListComponent, `toEnd`, `
                    <div class="file-item">
                            <span>${file.fileOriginalName}</span>
                             <button id="delete_file_${file.fileName}" class="upload-button upload-file-button" filename="${file.fileOriginalName}">Загрузить</button>
                            <span>${calcFileSize(file.fileSize)}</span>
                        </div>    
                `)
            }

            const uploadButtons = document.querySelectorAll(`.upload-file-button`)

            uploadButtons.forEach(button => {
                button.addEventListener(`click`, (e) => {
                    const fileName = e.target.getAttribute(`id`).split("_").reverse()[0]
                    const fileOriginalName = e.target.getAttribute(`filename`)
                    const file = useHttp(`http://localhost:3000/api/file/get-public/${fileName}`, `GET`, ``, REQUEST_DEFAULT_HEADERS, false)

                    if (file.code === 200) {
                        const bytesArray = Uint8Array.from(file.response)
                        const blob = new Blob([bytesArray])

                        const link = document.createElement(`a`)
                        link.href = window.URL.createObjectURL(blob)
                        link.download = fileOriginalName
                        link.click()
                        link.remove()
                    }
                    else {
                        alert(`Произошла ошибка: ${file.error ? file.error : file.response.message}. Попробуйте ещё раз.`)
                        window.location.reload()
                    }
                })
            })
        }
        else {
            HTMLProvider.deleteFromDOM(fileListComponent)
        }
    }
    else if (storage.code === 404) {
        alert(`Хранилище не найдено!`)
        return MiragoRouter.goToMain()
    }
    else if (storage.code === 403) {
        alert(`Это хранилище приватное!`)
        return MiragoRouter.goToMain()
    }
    else {
        alert(`Произошла непредвиденная ошибка: ${storage.error ? storage.error : storage.code}`)
        return MiragoRouter.goToMain()
    }
}
bootstrap()

function calcFileSize(size) {
    if (size === 0) return `0 B`
    else if (size > 0 && size < 1024) return `${size} B`
    else if (size > 1024 && size < 1024 * 1024) return `${Math.floor(size / 1024)} KB`
    else return `${Math.floor(size / 1024 / 1024)} MB`
}