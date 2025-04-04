const REQUEST_DEFAULT_HEADERS = [
    { "Content-Type": "Application/Json" }
]

function bootstrap() {
    const { app, router } = builder({
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

    const payments = useHttp(`http://localhost:3000/api/payment/all`, `GET`, ``, REQUEST_DEFAULT_HEADERS)

    if (payments.code === 401) {
        const refresh = useHttp(`http://localhost:3000/api/auth/refresh`, `GET`, ``, REQUEST_DEFAULT_HEADERS)

        if (refresh.response) {
            setToken(refresh.response.access)

            window.location.reload()
        }
        else router.routing(`login.html`)
    }
    else if (payments.response) {
        useMainUI(app)
        useMainUI()

        const paymentComponent = app.createComponent(`div`, `payment-ui`, ``, ``)

        HTMLProvider.insertHTML(paymentComponent, `toEnd`, `
                <div id="payment-container-div" class="payment-container">
    
                </div>
        `)

        const paymentDivComponent = HTMLProvider.createComponentFromHTMLElement(`payment-container-div`)

        paymentDivComponent.DOMComponent.remove()

        HTMLProvider.insertComponent(paymentComponent, paymentDivComponent.IndexInComponents, `toEnd`)

        for (const payment of payments.response) {
            HTMLProvider.insertHTML(paymentDivComponent.IndexInComponents, `toEnd`, `
                <div class="payment-row">
                   <a href=${payment.paymentStripeUrl} class="payment-link">Платеж ${payment.id}</a>
                   <span class="payment-status ${payment.paymentStatus === "PAYED" ? "status-success":"status-pending"}">${payment.paymentStatus === "PAYED" ? "Оплачено":"Ожидание"}</span>
                </div>
            `)
        }

        const button = app.getComponentByHTMLId(`profile-button`)
        
        useEvent(button.IndexInComponents, `click`, () => MiragoRouter.goToMain(), app)
    }
    else MiragoRouter.goToMain()
}
bootstrap()