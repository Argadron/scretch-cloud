function bootstrap() {
    const { app, router } = builder({
        withRouter: true,
        renderElements: false,
        rootElem: {
            auto: true
        },
        executeCallback: {
            isNeeded: false
        }
    })

    const HTMLBuilder = new MiragoHTML(app)
    const form = HTMLBuilder.createComponentFromHTMLElement("login-form")
    const REQUEST_DEFAULT_HEADERS = [
        { "Content-Type": "Application/Json" }
    ]

    const routes = MiragoRouter.getRoutes()

    routes["index.html"].app.COMPONENTS_LIST.length + 1 === app.COMPONENTS_LIST.length ? null : router.synchronize(`component`)

    const button = HTMLBuilder.createComponentFromHTMLElement(`submit-button`)

    HTMLBuilder.deleteFromDOM(button.IndexInComponents)
    HTMLBuilder.insertComponent(form.IndexInComponents, button.IndexInComponents, `toEnd`)

    useEvent(button.IndexInComponents, `click`, (e) => {
       e.preventDefault()
       const loginDOM = document.getElementById(`login-input`)
       const passwordDOM = document.getElementById(`password-input`)

       if (!loginDOM.value || !passwordDOM.value) return alert(`Вы не заполнили какое-то поле!`)

       const request = useHttp(`http://localhost:3000/api/auth/login`, `POST`, JSON.stringify({ username: loginDOM.value, password: passwordDOM.value }), REQUEST_DEFAULT_HEADERS)
       
       if (request.code === 400 && request.response.message === "Bad request exception") return alert(`Пароль должен содержать минимум 8 символов!`)
       if (request.code === 400 && request.response.message === "Bad password or username") return alert (`Неверное имя пользователя или пароль`)
       if (request.code === 200) {
            const [getAccess, setAccess, delAccess] = useLocalStorage(`accessToken`)

            setAccess(request.response.access)

            alert(`Вы успешно вошли!`)

            MiragoRouter.goToMain()
       }
   }, app)
}
bootstrap()