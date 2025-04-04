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

    const [getToken, setToken] = useLocalStorage(`accessToken`)
    
    const token = getToken()

    if (!token) router.routing(`login.html`)

    REQUEST_DEFAULT_HEADERS.push({ Authorization: `Bearer ${token}` })

    const profile = useHttp(`http://localhost:3000/api/auth/me`, `GET`, ``, REQUEST_DEFAULT_HEADERS)

    if (profile.response) {
        useMainUI(app)
        useMainUI()

        const createStorageDivFormComponent = app.createComponent(`div`, `formContainer`, `form-container`, ``)
        const createStorageComponent = app.createComponent(`div`, `storage-button-div`, `button-container`, ``)
        const modalComponent = app.createComponent(`div`, `detailModal`, `modal`, ``)

        HTMLProvider.insertHTML(modalComponent, `toEnd`, `
            <div id="modal-content" class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Детальный просмотр хранилища</h2>
                
                <div id="file-list" class="file-list" style="display: none">
                    
                </div>
    
                <div class="control-buttons">
                    <div class="upload-wrapper">
                        <button id="upload-file-button" class="upload-button">Отправить файл</button>
                        <span class="file-name">Нет выбранного файла</span>
                        <input type="file" id="fileInput" class="custom-file-input">
                    </div>
                    <button id="edit-storage-button" class="btn-warning">Изменить хранилище</button>
                    <button id="delete-storage-button" class="btn-danger">Удалить хранилище</button>
                </div>
            </div>
        `)

        const [formList, modalContent] = HTMLProvider.createComponentsByHTMLIds(["file-list", `modal-content`])

        HTMLProvider.insertHTML(createStorageComponent, `toEnd`, `
            <button id="create-storage-button-first" class="create-storage-button">+ Создать хранилище</button>    
        `)
        HTMLProvider.deleteFromDOM(modalComponent)
        HTMLProvider.deleteFromDOM(formList.IndexInComponents)
        HTMLProvider.deleteFromDOM(modalContent.IndexInComponents)

        const button = HTMLProvider.createComponentFromHTMLElement(`create-storage-button-first`)

        button.DOMComponent.remove()
        modalContent.DOMComponent.remove()

        HTMLProvider.insertComponent(createStorageComponent, button.IndexInComponents, `toEnd`)
        HTMLProvider.setAttribute(createStorageDivFormComponent, `style`, `display: none`)

        const storagesDivDOM = app.createComponent(`div`, `storages-div`, `storage-container`, ``)

        for (const storage of profile.response.storages) {
            HTMLProvider.insertHTML(storagesDivDOM, `toEnd`, `
                <div class="storage-card">
                    <div class="storage-info">
                        <div class="info-block">
                            <span>Название:</span>
                            <span>${storage.name}</span>
                        </div>
                        <div class="info-block">
                            <span>Размер:</span>
                            <span>${storage.size / 1024 / 1024} MB</span>
                        </div>
                </div>

                <button id="detail-button-${storage.name}" class="detail-button">Детальный просмотр</button>

                <span class="storage-type ${storage.type === "DEFAULT" ? "type-default":"type-developer"}">${storage.type}</span>
            `)
        } 

        detailsButtonsBinder(app, modalComponent, formList.IndexInComponents, HTMLProvider, modalContent.IndexInComponents)

        useEvent(button.IndexInComponents, `click`, () => {
            HTMLProvider.setAttribute(createStorageDivFormComponent, `style`, ``)
            HTMLProvider.insertHTML(createStorageDivFormComponent, `toEnd`, `
                    <form id="storageForm">
                        <label for="storageName">Название хранилища:</label>
                        <input type="text" id="storageName" required>

                        <label for="storageType">Тип хранилища:</label>
                        <select id="storageType" required>
                            <option value="">Выберите тип</option>
                            <option value="normal">Обычное</option>
                            <option value="developer">Developer</option>
                        </select>

                        <label for="storageSize">Размер хранилища (в мегабайтах):</label>
                        <input type="number" id="storageSize" required min="0">

                        <button id="create-storage-button" class="">Создать</button>
                    </form  
            `)

            const [button, form] = HTMLProvider.createComponentsByHTMLIds(["create-storage-button", `storageForm`])

            form.DOMComponent.remove()
            button.DOMComponent.remove()

            document.getElementById(`create-storage-button`).remove()
            
            HTMLProvider.insertComponent(createStorageDivFormComponent, form.IndexInComponents, `toEnd`)
            HTMLProvider.insertComponent(form.IndexInComponents, button.IndexInComponents, `toEnd`)

            useEvent(button.IndexInComponents, `click`, (e) => {
                e.preventDefault()

                const inputNameDOM = document.getElementById(`storageName`)
                const selectTypeDOM = document.getElementById(`storageType`)
                const inputSizeDOM = document.getElementById(`storageSize`)

                if (!inputNameDOM.value || !selectTypeDOM.value) return alert(`Нужно заполнить все поля!`)
                if (inputSizeDOM.value <= 0) return alert(`Размер должен быть минимум 1 байт!`)

                const data = JSON.stringify({
                    name: inputNameDOM.value,
                    type: selectTypeDOM.value === "normal" ? "DEFAULT":"DEVELOPER",
                    size: +inputSizeDOM.value * 1024 * 1024
                })

                const storage = useHttp(`http://localhost:3000/api/storage/create`, `POST`, data, REQUEST_DEFAULT_HEADERS)

                if (storage.response && storage.code === 201) {
                    alert(`Хранилище успешно создано!`)

                    window.location.reload()
                }
                else if (storage.code === 409) return alert(`Это имя хранилища уже занято!`)
            }, app)
        }, app)

        const buttonProfile = app.getComponentByHTMLId(`profile-button`)
        
        useEvent(buttonProfile.IndexInComponents, `click`, () => MiragoRouter.goToMain(), app)
    }
    else if (profile.code === 401) {
        const refresh = useHttp(`http://localhost:3000/api/auth/refresh`, `GET`, ``, REQUEST_DEFAULT_HEADERS)

        if (refresh.response) {
            setToken(refresh.response.access)

            window.location.reload()
        }
        else router.routing(`login.html`)
    }
}
bootstrap()

function detailsButtonsBinder(app, modalComponent, formList, HTMLProvider, modalContent) {
    const detailButtons = document.querySelectorAll(`.detail-button`)

    detailButtons.forEach(button => {
        button.addEventListener(`click`, (e) => {
            const id = e.target.getAttribute(`id`).split("-").reverse()[0]

            app.renderComponent(modalComponent)

            document.getElementById(`file-list`).remove()

            HTMLProvider.insertComponent(modalContent, formList, `toEnd`)

            const detailStorageInfo = useHttp(`http://localhost:3000/api/storage/by-name/${id}`, `GET`, ``, REQUEST_DEFAULT_HEADERS)

            const editStorageButton = document.getElementById(`edit-storage-button`)
            const deleteStorageButton = document.getElementById(`delete-storage-button`)
            const uploadFileButton = document.getElementById(`upload-file-button`)

            if (detailStorageInfo.response?.files) {
                for (const file of detailStorageInfo.response.files) {
                    HTMLProvider.insertHTML(formList, `toEnd`, `
                        <div class="file-item">
                            <span>${file.fileOriginalName}</span>
                             <button id="delete_file_${file.fileName}" class="upload-button upload-file-button" filename="${file.fileOriginalName}">Загрузить</button>
                             <button id="delete_file_${file.fileName}" class="delete-button delete-file-button" filename="${file.fileOriginalName}">Удалить</button>
                            <span>${calcFileSize(file.fileSize)}</span>
                        </div>
                    `)
                }

                const uploadButtons = document.querySelectorAll(`.upload-file-button`)
                const deleteButtons = document.querySelectorAll(`.delete-file-button`)

                uploadButtons.forEach(button => {
                    button.addEventListener(`click`, (e) => {
                        const fileName = e.target.getAttribute(`id`).split("_").reverse()[0]
                        const fileOriginalName = e.target.getAttribute(`filename`)

                        const file = useHttp(`http://localhost:3000/api/file/get/${fileName}`, `GET`, ``, REQUEST_DEFAULT_HEADERS, false)

                        if (file.code === 401) window.location.reload()
                        else if (file.code === 200) {
                            const bytesArray = Uint8Array.from(file.response)
                            console.log(file.response)
                            console.log(bytesArray)
                            const blob = new Blob([bytesArray])
                            console.log(blob)

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

                deleteButtons.forEach(button => {
                    button.addEventListener(`click`, (e) => {
                        const fileName = e.target.getAttribute(`id`).split("_").reverse()[0]

                        const deleteRequest = useHttp(`http://localhost:3000/api/file/delete/${fileName}`, `DELETE`, ``, REQUEST_DEFAULT_HEADERS)

                        if (deleteRequest.code === 401) window.location.reload()
                        else if (deleteRequest.code === 204) {
                            alert(`Файл успешно удален!`)

                            window.location.reload()
                        }
                        else {
                            alert(`Произошла ошибка при удалении файла: ${deleteRequest.error ? deleteRequest.error : deleteRequest.response?.message}. Попробуйте ещё раз.`)

                            window.location.reload()
                        }
                    })
                })

                HTMLProvider.setAttribute(formList, `style`, ``)
            }
            else if (detailStorageInfo.code === 401) window.location.reload()
            else {
                alert(`Произошла ошибка при получении данных о хранилище: ${detailStorageInfo.error}. Попробуйте ещё раз.`)

                window.location.reload()
            }

            deleteStorageButton.addEventListener(`click`, () => {
                const isReally = confirm(`Вы уверены, что хотите удалить это хранилище?`)

                if (isReally) {
                    const request = useHttp(`http://localhost:3000/api/storage/delete/${id}`, `DELETE`, ``, REQUEST_DEFAULT_HEADERS)

                    if (request.code < 400) window.location.reload()
                    else {
                        alert(`Возникла ошибка при удалении хранилища: ${request.error}. Попробуйте еще раз.`)

                        window.location.reload()
                    }
                }
            })

            editStorageButton.addEventListener(`click`, () => {
                const newName = prompt(`Введите новое название хранилища. Оставьте это поле пустым, если не хотите его менять.`)
                let newSize = prompt(`Введите новый размер хранилища (в мегабайтах). Оставьте это поле пустым, если не хотите его менять.`)

                newSize ? newSize = Number(newSize) * 1024 * 1024 : null

                const data = {
                    name: id
                }

                newName ? data.newName = newName : null
                newSize ? data.size = newSize : null

                const editRequest = useHttp(`http://localhost:3000/api/storage/update/`, `PUT`, JSON.stringify(data), REQUEST_DEFAULT_HEADERS)

                if (editRequest.code < 400) window.location.reload()
                else {
                    alert(`Произошла ошибка при обновлении хранилища: ${editRequest.error ? editRequest.error : editRequest.response?.message}. Попробуйте ещё раз.`)
                    window.location.reload()
                }
            })

            uploadFileButton.addEventListener(`click`, () => {
                const fileInputDOM = document.getElementById(`fileInput`)

                if (!fileInputDOM.files[0]) return alert(`Файл не выбран!`)
                
                const file = fileInputDOM.files[0]
                const formData = new FormData()

                formData.append(`file`, file)
                formData.append(`storageName`, id)

                const fileRequest = useHttp(`http://localhost:3000/api/file/upload`, `POST`, formData, [REQUEST_DEFAULT_HEADERS[1]])

                if (fileRequest.code !== 201) {
                    alert(`Произошла ошибка: ${fileRequest.response?.message ? fileRequest.response.message : fileRequest.error}. Попробуйте ещё раз`)

                    window.location.reload()
                }
                else {
                    alert(`Файл успешно сохранен в хранилище!`)

                    window.location.reload()
                }
            })
            
            document.querySelector('.close-modal').addEventListener('click', () => {
                window.location.reload()
            })

            document.getElementById('fileInput').addEventListener('change', (e) => {
                const fileName = e.target.files[0].name || 'Нет файла'

                document.querySelector('.file-name').textContent = fileName
            })

            useEvent(modalComponent, `click`, (e) => {
                e.target === app.componentInfo(modalComponent).DOMComponent ? window.location.reload() : null
            }, app)
        })
    })
}

function calcFileSize(size) {
    if (size === 0) return `0 B`
    else if (size > 0 && size < 1024) return `${size} B`
    else if (size > 1024 && size < 1024 * 1024) return `${Math.floor(size / 1024)} KB`
    else return `${Math.floor(size / 1024 / 1024)} MB`
}