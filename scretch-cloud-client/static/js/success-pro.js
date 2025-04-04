const REQUEST_DEFAULT_HEADERS = [
    { "Content-Type": "Application/Json" }
]
const [getToken] = useLocalStorage(`accessToken`)
const urlTag = MiragoRouter.getCurrentQueryArgs(`urlTag`)

const token = getToken()

if (!token || !urlTag) MiragoRouter.goToMain()

REQUEST_DEFAULT_HEADERS.push({ Authorization: `Bearer ${token}` })

const request = useHttp(`http://localhost:3000/api/payment/validate/${urlTag}`, `GET`, ``, REQUEST_DEFAULT_HEADERS)

if (request.code < 400) MiragoRouter.goToMain()
else {
    alert(`Произошла ошибка: ${request.error}`)
    MiragoRouter.goToMain()
}