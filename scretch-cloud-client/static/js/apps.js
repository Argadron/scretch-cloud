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

    const apps = useHttp(`http://localhost:3000/api/application/all`, `GET`, ``, REQUEST_DEFAULT_HEADERS)

    if (apps.code === 401) {
        const refresh = useHttp(`http://localhost:3000/api/auth/refresh`, `GET`, ``, REQUEST_DEFAULT_HEADERS)

        if (refresh.response) {
            setToken(refresh.response.access)

            window.location.reload()
        }
        else router.routing(`login.html`)
    }
    else if (apps.response) {
        useMainUI(app)
        useMainUI()

        const createAppComponent = app.createComponent(`div`, `appContainer`, `app-container`, ``, ``)
        const mainDivContainer = app.createComponent(`div`, `mainAppsContainer`, `app-list`)

        HTMLProvider.insertHTML(createAppComponent, `toEnd`, `
            <button id="create-app-button-first" class="create-app-button">+ Создать приложение</button> 
        `)
        
        const createButton = HTMLProvider.createComponentFromHTMLElement(`create-app-button-first`)
        
        HTMLProvider.deleteFromDOM(createButton.IndexInComponents)
        HTMLProvider.insertComponent(createAppComponent, createButton.IndexInComponents, `toEnd`)

        if (apps.response.length > 0) {
            for (const currentApp of apps.response) {
                HTMLProvider.insertHTML(mainDivContainer, `toEnd`, `
                    <div class="app-card">
                        <div class="app-header">
                            <h2 class="app-name">${currentApp.name}</h2>
                            <div class="action-buttons">
                                <button id="edit-app-button-${currentApp.id}" class="edit-btn edit-app-button">Изменить приложение</button>
                                <button id="delete-app-button-${currentApp.id}" class="delete-btn delete-app-button">Удалить приложение</button>
                            </div>
                            <span class="status ${currentApp.storage ? "status-connected":"status-disconnected"}">${currentApp.storage ? "Подключено":"Отключено"}</span>
                        </div>

                        <div class="key-section">
                            <input
                                type="password"
                                value=${currentApp.secretKey}
                                readonly
                                class="secret-key"
                            >
                            <button class="show-token-btn">Показать токен</button>
                        </div>

                        <button id="change-app-storage-status-button-${currentApp.name}" class="connect-btn" switchmode="${currentApp.storage ? "disconnect":"connect"}">${currentApp.storage ? "Отключить от хранилища":"Подключить к хранилищу"}</button>
                    </div>
                `)
            }

            const editAppButtons = document.querySelectorAll(`.edit-app-button`)
            const deleteAppButtons = document.querySelectorAll(`.delete-app-button`)

            editAppButtons.forEach(button => {
                button.addEventListener(`click`, (e) => {
                    const id = e.target.getAttribute(`id`).split("-").reverse()[0]

                    const name = prompt(`Введите новое название приложения. Оставьте поле пустым, если не хотите его менять.`)
                    const isNeedResetToken = confirm(`Желаете ли вы обновить API токен приложения? Нажмите ОК, если да, Отмена, если нет`)

                    const data = {
                        appId: +id
                    }

                    name ? data.name = name : null 
                    isNeedResetToken ? data.isNeedResetToken = true : data.isNeedResetToken = false 

                    const editRequest = useHttp(`http://localhost:3000/api/application/update`, `PUT`, JSON.stringify(data), REQUEST_DEFAULT_HEADERS)

                    if (editRequest.code === 401) window.location.reload()
                    else if (editRequest.code === 200) {
                        alert(`Приложение успешно обновлено!`)

                        window.location.reload()
                    }
                    else {
                        alert(`Произошла непредвиденная ошибка: ${editRequest.error ? editRequest.error : editRequest.response?.message}. Попробуйте ещё раз.`)

                        window.location.reload()
                    }
                })
            })

            deleteAppButtons.forEach(button => {
                button.addEventListener(`click`, (e) => {
                    const id = e.target.getAttribute(`id`).split("-").reverse()[0]

                    const isReally = confirm(`Вы уверены, что хотите удалить это приложение?`)

                    if (isReally) {
                        const deleteRequest = useHttp(`http://localhost:3000/api/application/delete/${id}`, `DELETE`, ``, REQUEST_DEFAULT_HEADERS)

                        if (deleteRequest.code === 401) window.location.reload()
                        else if (deleteRequest.code === 204) {
                            alert(`Приложение успешно удалено!`)

                            window.location.reload()
                        }
                        else {
                            alert(`Произошла непредвиденная ошибка: ${deleteRequest.error ? deleteRequest.error : deleteRequest.response?.message}. Попробуйте ещё раз.`)

                            window.location.reload()
                        }
                    }
                })
            })

            document.querySelectorAll(`.connect-btn`).forEach(button => {
                button.addEventListener(`click`, (e) => {
                    const appName = e.target.getAttribute(`id`).split("-").reverse()[0]
                    const switchType = e.target.getAttribute(`switchmode`)
                    const searchedApp = apps.response.find(el => el.name === appName)

                    if (switchType === "connect") {
                       if (searchedApp.storage) return alert(`У приложения уже есть подключенное хранилище!`)

                       const storageName = prompt(`Введите название хранилища, к которому хотите подключить это приложение:`)

                       if (!storageName) return alert(`Вы не указали имя!`)

                       const data = JSON.stringify({
                            storageName,
                            appId: searchedApp.id
                       })

                       const connectRequest = useHttp(`http://localhost:3000/api/application/createConnect`, `POST`, data, REQUEST_DEFAULT_HEADERS)

                       if (connectRequest.code === 401) window.location.reload()
                       else if (connectRequest.code === 404) return alert(`Хранилище с указанным именем не найдено!`)
                       else if (connectRequest.code === 400) return alert(`Тип хранилища не является DEVELOPER`)
                       else if (connectRequest.code === 200 && connectRequest.response.storage) {
                          alert(`Хранилище успешно подключено!`)

                          window.location.reload()
                       }
                       else {
                            alert(`Произошла непредвиденная ошибка: ${connectRequest.error ? connectRequest.error : connectRequest.response?.message}. Попробуйте ещё раз.`)

                            window.location.reload()
                       }
                    }
                    else {
                        if (!searchedApp.storage) return alert(`У приложения нет подключенного хранилища!`)

                        const isReally = confirm(`Вы уверены, что хотите отключить это приложение от хранилища?`)

                        if (isReally) {
                            const disconnectRequest = useHttp(`http://localhost:3000/api/application/disconnectStorage/${searchedApp.id}`, `DELETE`, ``, REQUEST_DEFAULT_HEADERS)

                            if (disconnectRequest.code === 401) window.location.reload()
                            else if (disconnectRequest.code === 204) {
                                alert(`Приложение успешно отвязано!`)

                                window.location.reload()
                            }
                            else {
                                alert(`Произошла непредвиденная ошибка: ${disconnectRequest.error ? disconnectRequest.error : disconnectRequest.response?.message}. Попробуйте ещё раз.`)

                                window.location.reload()
                            }
                        }
                    }
                })
            })

            document.querySelectorAll('.show-token-btn').forEach(button => {
                const input = button.previousElementSibling;
            
                button.addEventListener('click', function() {
                    if (input.type === 'password') {
                        input.type = 'text'
                        this.textContent = 'Скрыть токен'
                    } else {
                        input.type = 'password'
                        this.textContent = 'Показать токен'
                    }
                })
            })
        }

        useEvent(createButton.IndexInComponents, `click`, () => {
            const appName = prompt(`Введите название приложения:`)

            if (!appName) return alert(`Вы не указали имя!`)

            const body = JSON.stringify({
                name: appName
            })

            const appRequest = useHttp(`http://localhost:3000/api/application/create`, `POST`, body, REQUEST_DEFAULT_HEADERS)

            if (appRequest.code === 401) window.location.reload()
            else if (appRequest.code === 409) return alert(`Это имя приложения уже занято!`)
            else if (appRequest.code === 201) {
                alert(`Приложение успешно создано!`)

                window.location.reload()
            }
            else {
                alert(`Произошла ошибка при создании приложения: ${appRequest.error ? appRequest.error : appRequest.response?.message}. Попробуйте ещё раз.`)

                window.location.reload()
            }
        }, app)

        const button = app.getComponentByHTMLId(`profile-button`)
        
        useEvent(button.IndexInComponents, `click`, () => MiragoRouter.goToMain(), app)
    }
    else MiragoRouter.goToMain()
}
bootstrap()