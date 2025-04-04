function bootstrap() {
    const { app, router } = builder({
        withRouter: true,
        rootElem: {
            auto: true
        },
        executeCallback: {
            isNeeded: false
        }
    })

    const HTMLBuilder = new MiragoHTML(app)
    const [form, button] = HTMLBuilder.createComponentsByHTMLIds(["register-form", `submit-button`])
    const REQUEST_DEFAULT_HEADERS = [
        { "Content-Type": "Application/Json" }
    ]

    HTMLBuilder.deleteFromDOM(button.IndexInComponents)
    HTMLBuilder.insertComponent(form.IndexInComponents, button.IndexInComponents, `toEnd`)

    useEvent(button.IndexInComponents, `click`, (e) => {
        e.preventDefault()

        const loginDOM = document.getElementById(`login-input`)
       const passwordDOM = document.getElementById(`password-input`)

       if (!loginDOM.value || !passwordDOM.value) return alert(`Вы не заполнили какое-то поле!`)

       const request = useHttp(`http://localhost:3000/api/auth/register`, `POST`, JSON.stringify({ username: loginDOM.value, password: passwordDOM.value }), REQUEST_DEFAULT_HEADERS)
       
       if (request.code === 400) return alert(`Короткое имя пользователя или пароль!`)
       if (request.code === 201) {
         const [getToken, setToken] = useLocalStorage("accessToken")

         setToken(request.response.access)

         alert(`Вы успешно зарегистрировались!`)

         MiragoRouter.goToMain()
       }
    }, app)
}
bootstrap()