const urlTag = MiragoRouter.getCurrentQueryArgs(`urlTag`)
const [getToken] = useLocalStorage(`accessToken`)
const REQUEST_DEFAULT_HEADERS = [
    { "Content-Type": "Application/Json" }
]

const token = getToken()

if (!token || !urlTag) MiragoRouter.goToMain()

REQUEST_DEFAULT_HEADERS.push({ Authorization: `Bearer ${token}` })

const request = useHttp(`http://localhost:3000/api/payment/cancel/${urlTag}`, `DELETE`, ``, REQUEST_DEFAULT_HEADERS)

if (request.code === 204) MiragoRouter.goToMain()
else {
    alert(`При отмене произошла непредвиденная ошибка: ${request.error}`)
    MiragoRouter.goToMain()
}