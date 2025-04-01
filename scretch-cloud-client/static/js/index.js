const button = document.getElementById(`button`)
const input = document.getElementById(`test`)

button.addEventListener(`click`, async () => {

    const data = new FormData()
    data.append(`file`, input.files[0])
    data.append(`storageName`, `ХранилищеТест2`)

    const request = await fetch(`http://localhost:3000/api/application/uploadFile`, {
        method: "POST",
        body: data,
        headers: {
            "X-API-KEY": "40c5c614-181f-48d3-b718-bfbfdc6b0c2d"
        }
    })
})