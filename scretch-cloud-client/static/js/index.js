const REQUEST_DEFAULT_HEADERS = [
    { "Content-Type": "Application/Json" }
]

if (!MiragoRouter.checkIndex()) {
    const app = new Mirago()

    app.createRoot(Mirago.getRoot())

    const router = new MiragoRouter(app)

    router.setRoute(`register.html`, () => {})
    router.setRoute(`login.html`, () => {})
    router.setRoute(`storages.html`, () => {})
    router.setRoute(`payments.html`, () => {})
    router.setRoute(`apps.html`, () => {})

    MiragoRouter.goToMain()
}
else {
    const app = MiragoRouter.indexPageProvider(Mirago.getRoot())
    const router = new MiragoRouter(app)
    const HTMLProvider = new MiragoHTML(app)

    const parseBooleanPipe = usePipeFactory({
        dynamicTarget: false,
        target: "object",
        executor: (data) => {
            for (let i in data) {
                data[i] = data[i] === "true" ? true : false
            }

            return data
        }
    })

    MiragoRouter.getCurrentQueryArgs(`needReset`, [parseBooleanPipe()]) ? router.routing(`index.html`) : null

    const PROFILE_URL = "http://localhost:3000/api/auth/me"

    const [ getToken, setToken ] = useLocalStorage("accessToken")

    const token = getToken()

    if (!token) router.routing(`login.html`)
    else {
        REQUEST_DEFAULT_HEADERS.push({ "Authorization": `Bearer ${token}` })

        const profile = useHttp(PROFILE_URL, `GET`, ``, REQUEST_DEFAULT_HEADERS)

        if (profile.response) {
            useMainUI(app)
            useMainUI()

            const profileComponent = app.createComponent(`div`, `profile-ui`, ``, ``)
            const buyPremuimButton = app.createComponent(`button`, `premiumButton`, `premium-button`, `Оформить премиум-подписку`)
            const cancelPremiumButton = app.createComponent(`button`, `cancel-premium`, `premium-button`, `Отменить премиум-подписку`)

            HTMLProvider.insertHTML(profileComponent, `toEnd`, `
                 <div class="profile-container" id="profile-container-div">
                    <div class="profile-header" id="profile-header-div">
                        <div class="user-info">
                            <div id="username" class="username">${profile.response.username}</div>
                            <div id="account-type" class="account-type">Тип аккаунта: ${profile.response.accountType}</div>
                        </div>
                  </div>
               </div>  
            `)

            HTMLProvider.deleteFromDOM(buyPremuimButton)
            HTMLProvider.deleteFromDOM(cancelPremiumButton)
            
            if (profile.response.accountType !== "PRO") {
                HTMLProvider.insertComponent(profileComponent, buyPremuimButton, `toEnd`)

                useEvent(buyPremuimButton, `click`, () => {
                    const paymentRequest = useHttp(`http://localhost:3000/api/payment/subcribe`, `GET`, ``, REQUEST_DEFAULT_HEADERS)
                    const [getPaymentURL, setPaymentURL, delPaymentURL] = useLocalStorage(`paymentURL`)
                    const [getPaymentId, setPaymentId] = useLocalStorage(`paymentId`)

                    if (paymentRequest.response && paymentRequest.code < 400) {
                        setPaymentId(paymentRequest.response.payment.paymentUrlTag)
                        setPaymentURL(paymentRequest.response.sessionUrl)

                        window.location.href = getPaymentURL()
                    }
                    else {
                        const isRedirect = confirm(`У вас уже есть сгенерированная сессия оплаты. Нажмите отмена, чтобы ее удалить, либо ОК, чтобы перейти к оплате.`)

                        if (isRedirect) window.location.href = getPaymentURL()
                        else {
                            delPaymentURL()

                            const cancelRequest = useHttp(`http://localhost:3000/api/payment/cancel/${getPaymentId()}`, `DELETE`, ``, REQUEST_DEFAULT_HEADERS)

                            if (cancelRequest.code === 204) window.location.reload()
                            else {
                                return alert(`Произошла непредвиденная ошибка!`)
                            }
                        }
                    }
                }, app)
            }
            else {
                HTMLProvider.insertComponent(profileComponent, cancelPremiumButton, `toEnd`)

                useEvent(cancelPremiumButton, `click`, () => {
                    const cancelRequest = useHttp("http://localhost:3000/api/payment/cancelPlan", `DELETE`, ``, REQUEST_DEFAULT_HEADERS)

                    if (cancelRequest.code === 401) window.location.reload()
                    else if (cancelRequest.code === 204) {
                        alert(`Подписка успешно отменена!`)

                        window.location.reload()
                    }
                    else {
                        alert(`Произошла непредвиденная ошибка: ${cancelRequest.error}, код ошибки: ${cancelRequest.code}`)
                    }
                }, app)
            }
        }
        else if (profile.code === 401) {
            const refresh = useHttp(`http://localhost:3000/api/auth/refresh`, `GET`, ``, REQUEST_DEFAULT_HEADERS)

            if (refresh.response) {
                setToken(refresh.response.access)

                MiragoRouter.goToMain()
            }
            else router.routing(`login.html`)
        }
    }
}