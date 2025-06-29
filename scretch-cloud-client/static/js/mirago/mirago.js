class Mirago {
    /**
     * @type {HTMLElement}
     */
    ROOT_ELEM = undefined
    /**
     * @type {string[]}
     */
    COMPONENTS_LIST = []
    /**
     * @type {Record<number, MiragoState>}
     */
    STATE = {

    }
    /**
     * @type {MiragoObserver[]}
     */
    OBSERVERS = []

    /**
     * Create a root element of your app
     * @param {HTMLElement} elem - Element with "root" id
     * @returns {null}
     */
    createRoot(elem) {
        if (elem?.getAttribute("id") === "root" && Object.keys(this.ROOT_ELEM ? this.ROOT_ELEM : {}).length === 0) {
            this.ROOT_ELEM = elem 
        }
        else if (this.ROOT_ELEM && this.ROOT_ELEM?.innerHTML) {
            throw new Error(`MiragoError: Cannot create root element: already exists`)
        }
        else {
            throw new Error(`MiragoError: Cannot create root element if is not have "root id" attribute.`)
        }

        return null
    }

    /**
     * Create a component of you app
     * @param {string} type - DOM type of element
     * @param {string} id - ID of element
     * @param {string} classes - Classes of element
     * @param {boolean} autoPatch - Set true, if you want to autoPatch component in routes (if they exisists)
     * @returns {number} Component (id to manupilation)
     */
    createComponent(type, id="", classes="", text="", autoPatch=false) {
        if (!this.checkRoot()) {
            throw new Error(`MiragoError: Root element is undefined.`)
        }

        if (!id) {
            id = this.COMPONENTS_LIST.length + 1
        }

        type = `<${type} id=${id} class=${classes}>${text}</${type}>`

        this.ROOT_ELEM.innerHTML += `
            ${type}
        `

        this.COMPONENTS_LIST.push(type)

        if (autoPatch && MiragoRouter.getRoutes()) MiragoRouter.patchLocalComponents(this)

        return this.COMPONENTS_LIST.indexOf(type)
    }

    /**
     * Set the State to the component
     * @param {number} component - Your created component
     * @param {any} state - State
     * @returns {MiragoState} - Mirago state object
     */
    newState(component, state) {
        if (!this.checkRoot()) {
            throw new Error(`MiragoError: Root element is undefined.`)
        }

        if (typeof(component) !== `number`) {
            throw new Error(`MiragoError: Component argument must be a number`)
        }

        const element = this.COMPONENTS_LIST[component]
        const index = this.COMPONENTS_LIST.indexOf(element)

        if (this.STATE[index]) {
            throw new Error(`MiragoError: State to this component already exists!`)
        }

        this.STATE[`${index}`] = {
            element, state, allowed: false
        }

        return this.STATE[`${index}`]
    }

    /**
     * Allow component to use State in text
     * @param {number} component - Your component to set
     * @returns {null}
     */
    allowState(component) {
        if (!this.checkRoot()) {
            throw new Error(`MiragoError: Root element is undefined.`)
        }

        if (typeof(component) !== `number`) {
            throw new Error(`MiragoError: Component argument must be a number`)
        }

        let element = this.COMPONENTS_LIST[component]

        if (!element) {
            throw new Error(`MiragoError: Cannot find component ${component}`)
        }

        const index = this.COMPONENTS_LIST.indexOf(element)
        const state = this.STATE[index].state 
        
        for (let i in state) {
            const currentState = state[`${i}`]

            element = this.DOMelementByComponent(component)

            element.innerText += `${currentState}`
        }

        this.STATE[index].allowed = true

        return null
    }

    /**
     * Return the DOM element by component id
     * @param {number} component 
     * @returns {HTMLElement} - Element of DOM 
     */
    DOMelementByComponent(component) {
        if (!this.checkRoot()) {
            throw new Error(`MiragoError: Root element is undefined.`)
        }
        if (typeof(component) !== `number`) {
            throw new Error(`MiragoError: Component argument must be a number`)
        }

        let element

        element = this.COMPONENTS_LIST[component]

        if (!element) {
            throw new Error(`MiragoError: Cannot find component index ${component}`)
        }

        element = element.split('id=')
        element = element[1].split(" class")[0].replaceAll("\"", "")
        element = document.getElementById(`${element}`)

        return element
    }

    /**
     * Update state to Component
     * @param {number} component - Your component
     * @param {any} state - New State
     * @returns {null}
     */
    updateState(component, state) {
        if (!this.checkRoot()) {
            throw new Error(`MiragoError: Root element is undefined.`)
        }

        if (typeof(component) !== `number`) throw new Error(`MiragoError: TypeError: Component argument is not a number.`)

        const element = this.COMPONENTS_LIST[component]
        const index = this.COMPONENTS_LIST.indexOf(element)
        const DOMElement = this.DOMelementByComponent(component)

        if (!this.STATE[index]?.allowed) {
            throw new Error(`MiragoError: Cannot update null state.`)
        } 

        this.STATE[index].state = state 

        if (DOMElement) {

        DOMElement.innerText = `${state}`

        for (let i in state) {
            const currentState = state[`${i}`]

            DOMElement.innerText += `${currentState}`
        }

        let newComponent = `<${DOMElement.localName} id=${DOMElement.getAttribute("id")} class=${DOMElement.getAttribute("class")}>${DOMElement.innerText}</${DOMElement.localName}>`
    
        this.STATE[index].element = newComponent
        this.COMPONENTS_LIST[index] = newComponent

        }

        this.checkObserving(component, `stateUpdated`)

        return null
    }

    /**
     * Return component state
     * @param {number} component - Your component
     * @returns {any} Component state
     */
    getState(component) {
        if (typeof(component) !== `number`) {
            throw new Error(`MiragoError: Component argument must be a number`)
        }

        const element = this.COMPONENTS_LIST[component]
        const index = this.COMPONENTS_LIST.indexOf(element)

        return this.STATE[index]
    }

    /**
     * Remove component from page.
     * @param {number} component - Your component
     * @returns {null}
     */
    deleteComponent(component) {
        if (!this.checkRoot()) {
            throw new Error(`MiragoError: Root element is undefined.`)
        }
        if (typeof(component) !== `number`) {
            throw new Error(`MiragoError: Component argument must be a number`)
        }

        const element = this.COMPONENTS_LIST[component]
        const DOMElement = this.DOMelementByComponent(component)

        const index = this.COMPONENTS_LIST.indexOf(element)

        this.checkObserving(component, `deleted`)

        DOMElement.remove()

        delete this.STATE[index]
        this.COMPONENTS_LIST[index] = null

        return null
    }

    /**
     * Debug method. Return a component info + component state.
     * @param {number} component - Your component
     * @returns {MiragoComponentInfo} - Component info
     */
    componentInfo(component) {
        if (typeof(component) !== `number`) {
            throw new Error(`MiragoError: Component argument must be a number`)
        }

        const element = this.COMPONENTS_LIST[component]
        const DOMElement = this.DOMelementByComponent(component)
        const index = this.COMPONENTS_LIST.indexOf(element)
        const state = this.STATE[index]
        const HTMLId = element.split(`id=`)[1].split(` `)[0]

        return {
            Component: element, 
            DOMComponent: DOMElement, 
            IndexInComponents: index, 
            ComponentState: state,
            HTMLId
        }
    }

    /**
     * Return HTML reference of component
     * @param {number} component 
     * @returns {HTMLElement}
     */ 
    getHTMLReference(component) {
        if (!this.checkRoot()) {
            throw new Error(`MiragoError: Root element is undefined.`)
        }
        if (typeof(component) !== `number`) {
            throw new Error(`MiragoError: Component argument must be a number`)
        }

        return this.DOMelementByComponent(component)
    }

    /**
     * Check the root element exsists
     * @returns {boolean} - True if root exsits
     */
    checkRoot() {
        return !(!this.ROOT_ELEM)
    }

    /**
     * Get the mirago App
     * @returns { Mirago } Url to app
     */
    getApp() {
        return this
    }

    /**
     * Get Mirago component by HTML id
     * @param {string} id - A id reference of html 
     * @returns {MiragoComponentInfo} - Component reference
     */
    getComponentByHTMLId(id) {
        const result = this.COMPONENTS_LIST.find((elem) => {
            let temp;
            temp = elem.split('id=')
            temp = temp[1].split(" class")[0]
            
            if (id == temp) return true
        })

        const component = this.COMPONENTS_LIST.indexOf(result)

        return this.componentInfo(component)
    }

    /**
     * Check if component have observser, execute him
     * @param {number} component - Component 
     * @param {`rendered` | `stateUpdated` | `deleted`} event - Type of event
     */
    checkObserving(component, event) {
        for (let i of this.OBSERVERS) {
            if (i.component === component) {
                if (i.destroyOnDelete && event === `deleted`) this.OBSERVERS.splice(this.OBSERVERS.indexOf(i), 1)
                eval('(' + i.observer + ')')(event, this.componentInfo(component), this)
            }
        }
    }

    /**
     * Render component. Returns component info
     * @param {number} component 
     * @returns {MiragoComponentInfo} - Mirago component info interface
     */
    renderComponent(component) {
        if (typeof(component) !== `number`) {
            throw new Error(`MiragoError: Component argument must be a number`)
        }

        const element = this.componentInfo(component)

        this.ROOT_ELEM.innerHTML += element.Component

        return element
    }

    /**
     * Render component by HTML id
     * @param {string} id 
     * @returns {MiragoComponentInfo} Mirago component info interface
     */
    renderByHTMLId(id) {
        const element = this.getComponentByHTMLId(id)

        this.ROOT_ELEM.innerHTML += element.Component

        return element
    }

    /**
     * Inject component, state or observer into appliaction.
     * @param {HTMLElement | MiragoState | MiragoObserver} injectValue 
     * @returns { MiragoComponentInfo | MiragoState | null }
     */
    inject(injectValue) {
        if (MiragoValidator.isComponent(injectValue.outerHTML)) {
            let patchedHTML = injectValue.outerHTML.replaceAll(`"`, "")
            const tempArray = patchedHTML.split(">")

            tempArray[0] = tempArray[0] + ` `
            patchedHTML = tempArray.join(`>`)

            if (!patchedHTML.includes(`class`)) {
                tempArray[0] = tempArray[0] + `class=`

                patchedHTML = tempArray.join(`>`)
            }

            this.COMPONENTS_LIST.push(patchedHTML)
            this.ROOT_ELEM.innerHTML += `
                ${patchedHTML}
            `

            const index = this.COMPONENTS_LIST.indexOf(patchedHTML)

            return this.componentInfo(index)
        }
        else if (MiragoValidator.isState(injectValue)) {
            const index = this.COMPONENTS_LIST.indexOf(injectValue.element)

            this.newState(index, injectValue.state)

            if (injectValue.allowed) this.allowState(index)

            const manager = new MiragoStateManager(this)

            return manager.getComponentState(index)
        }
        else if (MiragoValidator.isObserver(injectValue)) {
            this.OBSERVERS.push(injectValue)
        }
        else { 
            throw new Error(`MiragoError: Unknown inject value`)
        }
    }

    /**
     * Provide mirago app from MiragoRouter
     * @param {MiragoInitPropeties} app - Url to app
     * @param {HTMLElement} elem - Root elem to provide 
     * @returns {Mirago}
     */
    static provideApp(app, elem) {
        const provider = new Mirago()

        for (let i of Object.getOwnPropertyNames(Object.getPrototypeOf(provider))) {
            if (i === `constructor`) continue

            app[i] = provider[i]
        }

        app.createRoot(elem)

        return app
    }

    /**
     * Fast method to select root elem
     * @returns { HTMLElement }
     */
    static getRoot() {
        const element = document.getElementById(`root`)

        if (!element) throw new Error(`MiragoError: Cannot find root elem on page.`)

        return element
    }
}

class MiragoStateManager {
    /**
     * Mirago created app
     * @param {Mirago} app - Mirago app reference 
     */
    constructor(app) {
        this.app = app
    }

    /**
     * Take state and place in text area on component.
     * @param {string} HTMLComponent 
     * @param {any} state - New state
     * @returns {string} - New string component
     */
    static setStateInComponent(HTMLComponent, state) {
        let temp;

        temp = HTMLComponent.split(">")[1].split("<")[0]

        return HTMLComponent.replace(temp, state)
    }

    /**
     * Get component state.
     * @param {number} component 
     * @returns {MiragoState}
     */
    getComponentState(component) {
        if (!this.app.checkRoot()) throw new Error(`MiragoError: Root elem is undefined`)

        const localComponent = this.app.STATE[component]

        return localComponent
    }
}

class MiragoRouter {
    BASE_ROUTE = window.location.href
    ROUTES = MiragoRouter.getRoutes()

    /**
     * Mirago created app
     * @param {Mirago} app - The mirago app
     */
    constructor(app) {
        if (!app.ROOT_ELEM) throw new Error("MiragoError: Cannot init MiragoRouter before Mirago root elem")

        this.MIRAGO_APP = app

        if (!MiragoRouter.getRoutes()[`index.html`]) this.setRoute(`index.html`, () => {})
    }

    /**
     * Routing url and call the callback function
     * @param {string} url - Url to set
     * @param {Function} callback - function
     * @param {any} args - Default args to execute callback 
     * @returns { null }
     */
    setRoute(url, callback, args=null) {
        this.ROUTES[url] = {
            url,
            callback: callback.toString(),
            app: this.MIRAGO_APP,
            args
        }
        
        localStorage.setItem("ROUTES", JSON.stringify(this.ROUTES))
        return null
    }

    /**
     * Routing user to endpoint
     * @param {string} url 
     * @param { ...args } args to callback
     * @returns { null } 
     */
    routing(url, ...args) {
        const callbackObject = this.ROUTES[url]
        const routes = MiragoRouter.getRoutes()

        if (!callbackObject) throw new Error(`MiragoError: Cannot route ${url}: Not Found`)

        this.ROUTES[url]["args"] = args
        routes[url]["args"] = args 

        localStorage.setItem(`ROUTES`, JSON.stringify(routes))

        window.location.href = url
        return null
    }

    /**
     * Synchronize all routes with current app
     * @param {`all` | `observer` | `component` | `state`} syncMode
     * @returns { null }
     */
    synchronize(syncMode=`all`) {
        const routes = MiragoRouter.getRoutes()
        const app = this.MIRAGO_APP.getApp()

        for (let i of Object.keys(routes)) {
            if (syncMode === `all`) {
                routes[i].app = app
            }
            else if (syncMode === `component`) {
                routes[i].app.COMPONENTS_LIST = app.COMPONENTS_LIST
            }
            else if (syncMode === `observer`) {
                routes[i].app.OBSERVERS = app.OBSERVERS
            }
            else if (syncMode === `state`) {
                routes[i].app.STATE = app.STATE
            }
            else {
                throw new Error(`MiragoError: Unknown syncMode in MiragoRouter`)
            }
        }
        
        localStorage.setItem(`ROUTES`, JSON.stringify(routes))

        return null
    }

    /**
     * Go to the main page.
     * @returns {void}
     */
    static goToMain() {
        window.location.href = `index.html`
    }

    /**
     * Delete route
     * @param {string} url to delete 
     * @returns {null}
     */
    deleteRoute(url) {
        if (!this.ROUTES[url]) throw new Error(`MiragoError: Route not found: ${url}`)

        delete this.ROUTES[url]
        return null
    }

    /**
     * Return object with app, callback and url. Use on child pages
     * @param {HTMLElement} elem - Root elem on child page
     * @param {boolean} withRender - Set true, if you need auto render components
     * @returns {{ callback: Function, app: Mirago, url: string }} object
     */
    static childPage(elem, withRender) {
        const object = MiragoRouter.getRoutes()

        if (!object || Object.keys(object).length === 0) MiragoRouter.goToMain()

        const localUrl = MiragoRouter.parseUrl(window.location.href)
        const objectInLocal = object[localUrl]

        if (!object || !objectInLocal) throw new Error(`MiragoError: Route not found: ${url}`)

        const localFunction = eval('(' + objectInLocal["callback"] + ')')

        if (withRender) MiragoRouter.elementRenderer(elem)

        return {
            callback: localFunction,
            app: Mirago.provideApp(objectInLocal["app"], elem),
            url: objectInLocal["url"]
        }
    }

    /**
     * Convert url window to local
     * @param {string} url window
     * @returns {string} local url
     */
    static parseUrl(url) {
        return url.split("/").reverse()[0].split("?")[0]
    }

    /**
     * Give updated routes from local storage.
     * @returns {object}
     */
    static getRoutes() {
        return JSON.parse(localStorage.getItem("ROUTES")) ? JSON.parse(localStorage.getItem("ROUTES")) : {}
    }

    /**
     * Patch components on local storage
     * @param {Mirago} app - The Mirago app
     * @returns {null} 
     */
    static patchLocalComponents(app) {
        const routes = MiragoRouter.getRoutes()
        
        for (let i in routes) {
            const currentRoute = routes[i]

            for (let e of app.COMPONENTS_LIST) {
                if (currentRoute.app.COMPONENTS_LIST.includes(e)) continue 

                else {
                    let check;

                    for (let f of currentRoute.app.COMPONENTS_LIST) {
                        if (f == e) check = true
                    }

                    if (check) continue
                    
                    const state = app.STATE[app.COMPONENTS_LIST.indexOf(e)]
                    routes[i].app.COMPONENTS_LIST.push(e)
                    routes[i].app.STATE[routes[i].app.COMPONENTS_LIST.indexOf(e)] = state 

                    localStorage.setItem("ROUTES", JSON.stringify(routes))
                }
            }
        }

        return null
    }

    /**
     * Render all elements from routes local storage on this page.
     * @param {HTMLElement} rootElem - HTML root element 
     * @returns {null}
     */
    static elementRenderer(rootElem) {
        const url = MiragoRouter.parseUrl(window.location.href)
        const routes = MiragoRouter.getRoutes()

        const app = Mirago.provideApp(routes[url].app, rootElem) 

        for (let i of app.COMPONENTS_LIST) {
            rootElem.innerHTML += i

            const index = app.COMPONENTS_LIST.indexOf(i)

            app.checkObserving(index, `rendered`)
        }

        return null
    }

    /**
     * Return instance Mirago app for index.html page
     * @param {HTMLElement} rootElem - Element to provide
     * @returns { Mirago }
     */
    static indexPageProvider(rootElem) {
        const mainPage = MiragoRouter.getRoutes()
        let { app } = mainPage["index.html"]
    
        app = Mirago.provideApp(app, rootElem)

        return app
    }

    /**
     * Get Mirago app by localUrl (from parserUrl)
     * @param {string} localUrl 
     * @return {Mirago} - A Mirago app.
     */
    static getAppReferenceByUrl(localUrl) {
        const routes = MiragoRouter.getRoutes()
        let app;

        if (!routes[localUrl]) {
            throw new Error(`MiragoError: Cannot get empty app reference (Route not created)`)
        }

        if (localUrl === `index.html`) {
            app = MiragoRouter.indexPageProvider(Mirago.getRoot())
        }
        else {
            const object = MiragoRouter.childPage(Mirago.getRoot(), false)
    
            app = object.app
        }

        return app
    }

    /**
     * Delete all routes
     * @returns { null }
     */
    static clearRoutes() {
        localStorage.removeItem(`ROUTES`)

        return null
    }

    /**
     * Set new callback to route.
     * @param {string} route 
     * @param {Function} callback 
     * @returns { null }
     */
    static newCallback(route, callback) {
        const routes = MiragoRouter.getRoutes()

        if (!routes) MiragoRouter.goToMain()

        routes[route].callback = callback.toString()
        localStorage.setItem(`ROUTES`, JSON.stringify(routes))

        return null
    }

    /**
     * Check index.html route exsists 
     * @returns {boolean} True if exsists.
     */
    static checkIndex() {
        const routes = MiragoRouter.getRoutes()

        if (routes.length === 0) return false 

        return routes[`index.html`] ? true : false
    }

    /**
     * Return current callback route args or null if not provided 
     * @param {MiragoPipe[]} pipes
     * @returns {any | null}
     */
    static getCurrentRouteArgs(pipes=[]) {
        const routes = MiragoRouter.getRoutes()
        const localUrl = MiragoRouter.parseUrl(window.location.href)

        if (!pipes.length) return routes[localUrl]["args"] ?? null
        else {
            for (const pipe of pipes) {
                routes[localUrl]["args"] = pipe.executor(routes[localUrl]["args"])
            }


            return routes[localUrl]["args"]
        }
    }

    /**
     * Exctract query value param, also return full query object
     * @param {string | void} query 
     * @param {MiragoPipe[]} pipes
     * @returns {string | Record<string, string}
     */
    static getCurrentQueryArgs(query=null, pipes=[]) {
        const queryUrl = window.location.href.split("/").reverse()[0].split("?")[1]

        if (!queryUrl) return null;

        const queryArray = queryUrl.split("&")

        if (queryArray.length === 0) return null;
        else {
            const keys = []
            const values = []
            let queryObject = {}

            for (const currentQuery of queryArray) {
                const parsedQuery = currentQuery.split("=")

                keys.push(parsedQuery[0])
                values.push(parsedQuery[1])
            }

            for (let i = 0; i < queryArray.length; i++) {
                queryObject[keys[i]] = values[i] // for example test=1, then keys[i] = test, values[i] = 1
            }

            if (!pipes.length) return query ? queryObject[query] : queryObject
            else {
                for (const pipe of pipes) {
                    pipe.target === "query" ? query = pipe.executor(query) : queryObject = pipe.executor(queryObject)
                }

                return query ? queryObject[query] : queryObject
            }
        }
    }
}

class MiragoCacheManager {
    /**
     * Set local response cache. Return cache id
     * @param {MiragoResponse} miragoResponse 
     * @returns { number } Cache id
     */
    static setCache(miragoResponse) {
        if (!MiragoValidator.isResponse(miragoResponse)) throw new Error(`MiragoError: ValidationError: ${miragoResponse} is not a valid MiragoResponse`)
        if (miragoResponse.error) throw new Error(`MiragoError: Cannot set cache with error: ${miragoResponse.error}, error code: ${miragoResponse.code}`)

        const cache = MiragoCacheManager.getCaches()
        const cacheId = Math.random() * cache.length

        const cacheObject = cache.find((elem) => {
            if (elem.url === miragoResponse.url) return elem
        })

        if (cacheObject) {
            const index = cache.indexOf(cacheObject)

            cache[index].cache = miragoResponse.response
        }
        else {
            cache.push({ key: cacheId, cache: miragoResponse.response, url: miragoResponse.url })
        }
        localStorage.setItem(`CACHE`, JSON.stringify(cache))
        return cacheId
    }

    /**
     * Get all cache
     * @returns {MiragoCache[] | []}
     */
    static getCaches() {
        return JSON.parse(localStorage.getItem("CACHE")) ? JSON.parse(localStorage.getItem("CACHE")) : []
    }

    /**
     * Found cache object by url
     * @param {string} url - Server url to found in cache
     * @param {boolean} cacheOnly - Set false, if you need to get full cache object
     * @returns { MiragoCache | MiragoCacheOnly | undefined } Cache or undefined
     */
    static getCacheByUrl(url, cacheOnly=true) {
        const cache = MiragoCacheManager.getCaches()

        const cacheObject = cache.find((elem) => {
            if (elem.url === url) return elem
        })

        if (!cacheObject) return undefined

        return cacheOnly ? cacheObject.cache : cacheObject
    }

    /**
     * Get cache from storage
     * @param {number} cacheId - Id to get cache
     * @param {boolean} cacheOnly - Set false, if you need get full cache object 
     * @returns { MiragoCache | MiragoCacheOnly | undefined} Cache or undefined
     */
    static getCache(cacheId, cacheOnly=true) {
        const cache = MiragoCacheManager.getCaches()

        const cacheObject = cache.find((elem) => {
            if (elem.key === cacheId) return elem
        })

        if (!cacheObject) return undefined

        return cacheOnly ? cacheObject.cache : cacheObject
    }

    /**
     * Delete cache from local storage.
     * @param {number} cacheId 
     * @returns {null | string} Return null if cache not found. Success string in also case.
     */
    static deleteCache(cacheId) {
        const cache = MiragoCacheManager.getCaches()

        const cacheObject = cache.find((elem) => {
            if (elem.key === cacheId) return elem
        })

        if (!cacheObject) return null

        const index = cache.indexOf(cacheObject)

        cache.splice(index, 1)

        localStorage.setItem(`CACHE`, JSON.stringify(cache))

        return `success`
    }

    /**
     * Delete cache from local storage by url
     * @param {string} url 
     * @returns { string | null } Return null if cache not found. Success string in also case.
     */
    static deleteCacheByUrl(url) {
        const cache = MiragoCacheManager.getCaches()

        const cacheObject = cache.find((elem) => {
            if (elem.url === url) return elem
        })

        if (!cacheObject) return null

        const index = cache.indexOf(cacheObject)

        cache.splice(index, 1)

        localStorage.setItem(`CACHE`, JSON.stringify(cache))

        return `success`
    }
}

class MiragoValidator {
    /**
     * Return boolean value, if object is a MiragoComponent return true, also false.
     * @param {string} validateValue
     * @returns {boolean} 
     */
    static isComponent(validateValue) {
        let check = true; 

        if (!validateValue) return false
        if (!validateValue.includes(`<`)) check = false 
        if (!validateValue.includes(`>`)) check = false 
        if (!validateValue.includes(`id=`)) check = false 

        return check
    }

    /**
     * Return boolean, true if validateValute is a MiragoState, also false
     * @param {object} validateValue 
     * @returns {boolean}
     */
    static isState(validateValue) {
        return MiragoValidator.validateByValueAndClass(validateValue, MiragoState)
    }

    /**
     * Returns boolean, true if validateValue is a MiragoObserver, also false
     * @param {object} validateValue 
     * @returns {boolean}
     */
    static isObserver(validateValue) {
        return MiragoValidator.validateByValueAndClass(validateValue, MiragoObserver)
    }

    /**
     * Returns boolean, true if validateValue is a MiragoResponse, also false
     * @param {object} validateValue 
     * @returns {boolean}
     */
    static isResponse(validateValue) {
        return MiragoValidator.validateByValueAndClass(validateValue, MiragoResponse)
    }

    /**
     * Returns boolean, true if validateValue is a MiragoInterceptor, also false.
     * @param {object} validateValue 
     * @returns { boolean }
     */
    static isInterceptor(validateValue) {
        const values = MiragoValidator.getClassParameters(MiragoInterceptor, `keys`)
        const validationValues = Object.keys(validateValue)

        let check = true

        for (let i of validationValues) {
            if (!values.includes(i)) check = false
        }

        return check
    }

    /**
     * Returns boolean, true if validateValue is a MiragoDecorator, also false.
     * @param {object} validateValue 
     * @returns { boolean }
     */
    static isDecorator(validateValue) {
        const values = MiragoValidator.getClassParameters(MiragoDecorator, `keys`)
        const validationValues = Object.keys(validateValue)

        return MiragoValidator.twoArraysValidator(values, validationValues)
    }

    /**
     * Returns boolean, true if validateValue is a MiragoPipe, else false
     * @param {object} validateValue
     * @returns {boolean} 
     */
    static isPipe(validateValue) {
        let values = MiragoValidator.getClassParameters(MiragoPipe, `keys`)
        const validationValues = Object.keys(validateValue)

        if (values.includes("/**")) {
            values = values.slice(values.findIndex(elem => elem.includes("*/")))
            values.shift()
        }

        return MiragoValidator.twoArraysValidator(values, validationValues)
    }

    /**
     * Returns boolean, true if validate success, also false
     * @param {object} validateValue 
     * @param {object} cls 
     * @returns {boolean}
     */
    static validateByValueAndClass(validateValue, cls) {
        const validateKeys = Object.keys(validateValue)
        const validateValues = Object.values(validateValue)
        const stateKeys = MiragoValidator.getClassParameters(cls, `keys`)
        const stateValues = MiragoValidator.getClassParameters(cls, `values`)
        let check = true 

        if (!MiragoValidator.twoArraysValidator(validateKeys, stateKeys)) check = false 

        const valuesArrayCheckFirst = []
        const valuesArrayCheckSecond = []

        for (let i of stateValues) {
           valuesArrayCheckFirst.push(typeof MiragoValidator.stringTypeParser(i))
        }

        for (let i of validateValues) {
           valuesArrayCheckSecond.push(typeof MiragoValidator.stringTypeParser(i))
        }

        if (stateKeys.includes(`state`)) {
            const stateIndex = stateKeys.indexOf(`state`)

            valuesArrayCheckFirst[stateIndex] = valuesArrayCheckSecond[stateIndex]
        }

        if (!MiragoValidator.twoArraysValidator(valuesArrayCheckFirst, valuesArrayCheckSecond)) check = false

        return check
    }

    /**
     * Return a array key:value class parameters
     * @param {object} cls 
     * @returns {string[]}
     */
    static classToKeyValueString(cls) {
        const stringClass = cls.toString()
        const className = cls.name

        let parsed = stringClass.split(className)[1].replaceAll(`=`, ":")
        parsed = parsed.substring(2, parsed.length - 1).replaceAll(` `, ``).replaceAll(`\n`, ` `).slice(2, -2).split(`\r`).join(``).split(` `)

        return parsed
    }

    /**
     * Return class propeties by class instance
     * @param {T} cls 
     * @param {`all` | `keys` | `values` } mode 
     * @returns {string[]} Array of class parameters
     * @example class MyClass { firstParameter = "" secondParameter = {} anyParameters = [] } => [`firstParameter`, `secondParameter`, `anyParameters`]
     */
    static getClassParameters(cls, mode=`all`) {
        const returnArray = []
        const parsed = MiragoValidator.classToKeyValueString(cls)
        
        switch(mode) {
            case `all`:
                return parsed 
            case `keys`: 
                for (let i of parsed) {
                    returnArray.push(i.split(":")[0])
                }
                break
            case "values":
                for (let i of parsed) {
                    returnArray.push(i.split(":")[1])
                }
                break
        }

        return returnArray
    }

    /**
     * Returns boolean, true if all values in first array exists in second, and second values in first, also false
     * @param {Array} firstArray 
     * @param {Array} secondArray
     * @returns {boolean} 
     */
    static twoArraysValidator(firstArray, secondArray) {
        let check = true

        for (let i of firstArray) {
            if (!secondArray.includes(i)) check = false
        }

        for (let i of secondArray) {
            if (!firstArray.includes(i)) check = false
        }

        return check
    }

    /**
     * Try to parse string value to number, array, object. Return undefined if cant parse, string if string is ``
     * @param {string} unknownString 
     * @returns { number | Array | object | boolean | string | undefined  }
     */
    static stringTypeParser(unknownString) {
        if (typeof unknownString === `boolean`) return unknownString
        if (!isNaN(unknownString)) return Number(unknownString)
        if ((unknownString.toString().includes(`[`) || unknownString.toString().includes(`{`)) && !unknownString.toString().includes(`()`)) return {}
        if (unknownString.includes(`()`)) return ``
        if (unknownString.toLowerCase() === `false`) return false 
        if (unknownString.toLowerCase() === `true`) return true
        if (unknownString.includes(`new`)) return {}
        if (MiragoValidator.isComponent(unknownString)) return ``
        if (unknownString === "``" || unknownString === ``) return ``

        return ``
    }
}

class MiragoHTML {
    /**
     * Your mirago created app
     * @param {Mirago} app 
     * @param {MiragoHTMLInitOptions} options 
     */
    constructor(app, options={ deleteCreatedElements: true }) {
        this.app = app
        this.options = options
    }

    /**
     * Create a Mirago component by html id (you need create this element on html file)
     * @param {string} htmlId 
     * @returns { MiragoComponentInfo }
     */
    createComponentFromHTMLElement(htmlId) {
        const element = document.getElementById(htmlId)

        if (!element) throw new Error(`MiragoError: Cannot found HTML element by id ${htmlId}`)

        if (this.options.deleteCreatedElements) element.remove()

        return this.app.inject(element)
    }

    /**
     * Create many Mirago components by string HTML id 
     * @param {string[]} htmlIds 
     * @returns {MiragoComponentInfo[]}
     */
    createComponentsByHTMLIds(htmlIds) {
        const resultArray = []

        for (let i of htmlIds) {
            resultArray.push(this.createComponentFromHTMLElement(i))
        }

        return resultArray
    }

    /**
     * Set attribute value to component.
     * @param {number} component - Mirago component id
     * @param {string} atr - Attribute name
     * @param {string} value - Value to set
     */
    setAttribute(component, atr, value) {
        const element = this.app.componentInfo(component)

        element.DOMComponent.setAttribute(atr, value)
        element.Component = element.DOMComponent.innerText
    }

    /**
     * Get attribute value, return null if atribute not exists
     * @param {number} component 
     * @param {string} atr 
     * @returns { string | null } atribute value or null
     */
    getAttribute(component, atr) {
        const element = this.app.componentInfo(component)

        element.Component = element.DOMComponent.innerText

        return element.DOMComponent.getAttribute(atr)
    }

    /**
     * Delete component from DOM tree
     * @param {number} component 
     * @returns {null}
     */
    deleteFromDOM(component) {
        const componentInfo = this.app.componentInfo(component)

        componentInfo.DOMComponent.remove()
    }

    /**
     * Insert HTML code into component, return updated component info
     * @param {number} component 
     * @param {`rewrite` | `toEnd`} insertMode 
     * @param {string} html HTML code
     * @returns {MiragoComponentInfo}
     */
    insertHTML(component, insertMode=`toEnd`, html) {
        const DOMComponent = this.app.getHTMLReference(component)

        insertMode === "toEnd" ? DOMComponent.innerHTML += html : DOMComponent.innerHTML = html

        this.app.COMPONENTS_LIST[component] = DOMComponent.outerHTML

        return this.app.componentInfo(component)
    }

    /**
     * Insert second component to first, return updated component info
     * @param {number} firstComponent 
     * @param {number} insertingComponent 
     * @param {`toEnd` | `rewrite`} insertMode 
     * @returns {MiragoComponentInfo}
     */
    insertComponent(firstComponent, insertingComponent, insertMode=`toEnd`) {
        const firstComponentDOM = this.app.getHTMLReference(firstComponent)
        insertingComponent = this.app.COMPONENTS_LIST[insertingComponent]

        insertMode === `toEnd` ? firstComponentDOM.innerHTML += insertingComponent : firstComponentDOM.innerHTML = insertingComponent

        this.app.COMPONENTS_LIST[firstComponent] = firstComponentDOM.outerHTML
        this.app.checkObserving(insertingComponent, `rendered`)

        return this.app.componentInfo(firstComponent)
    }
}

class MiragoCSS {
    /**
     * Your mirago created app
     * @param {Mirago} app 
     */
    constructor(app) {
        this.app = app
        this.HTMLProvider = new MiragoHTML(app)
    }

    /**
     * Inject CSS style to component. This method override ALL styles to provided
     * @param {number} component 
     * @param {string} CSS - string css styles
     * @returns { MiragoComponentInfo }
     */
    injectStyle(component, CSS) {
        if (typeof component !== `number`) throw new Error(`MiragoError: Component must be a number`)

        const app = this.app.getApp()

        this.HTMLProvider.setAttribute(component, `style`, CSS)

        return app.componentInfo(component)
    }

    /**
     * Delete styles from component
     * @param {number} component 
     * @returns { MiragoComponentInfo }
     */
    deleteStyles(component) {
        if (typeof component !== `number`) throw new Error(`MiragoError: Component must be a number`)

        const app = this.app.getApp()

        this.HTMLProvider.setAttribute(component, `style`, ``)

        return app.componentInfo(component)
    }

    /**
     * Merge component styles and new CSS styles
     * @param {number} component 
     * @param {string} CSS 
     * @returns { MiragoComponentInfo }
     */
    mergeStyles(component, CSS) {
        if (typeof component !== `number`) throw new Error(`MiragoError: Component must be a number`)

        const app = this.app.getApp()
        const oldCSS = this.HTMLProvider.getAttribute(component, `style`)

        this.HTMLProvider.setAttribute(component, `style`, `${oldCSS}; ${CSS}`)

        return app.componentInfo(component)
    }
}

class MiragoReflector {
    /**
     * Set object MetaData
     * @param {object} target 
     * @param {string} key 
     * @param {any} value 
     */
    static defineMetaData(target, key, value) {
        if (!target.__metaData) target.__metaData = {}

        target.__metaData[key] = value 
    }

    /**
     * Extcract MetaData from object
     * @param {object} target 
     * @param {key} key 
     * @returns {any}
     */
    static reflectMetaData(target, key) {
        if (!target.__metaData) return null

        return target.__metaData[key]
    }

    /**
     * Extract decorator from cls 
     * @param {object} target 
     * @returns {MiragoDecorator}
     */
    static reflectDecorator(target) {
        if (!("dec" in target)) throw new Error(`MiragoError: ${target} is not decorated class!`)

        return {
            func: target.dec,
            type: target.decType
        }
    }
}

class MiragoDecoratorFabric {
    /**
     * @type {MiragoDecoratorPropertyTarget[]}
     */
    targets = []

    /**
     * Constructor Decorator Fabric
     * @param {MiragoDecoratorTarget[]} targets 
     */
    constructor(targets=[]) {
        for (const target of targets) {
            if (!target.cls.constructor) throw new Error(`MiragoError: ${target} is not a valid constructor!`)
            
            this.pushTarget(target)
        }
    }

    /**
     * Find target by token
     * @param {string} target 
     * @returns {MiragoDecoratorPropertyTarget}
     */
    findTarget(target) {
        const cls = this.targets.find(elem => elem.targetKey === target)

        if (!cls) throw new Error(`MiragoError: target ${target} is not found in fabric!`)

        return cls
    }
    
    /**
     * Create decorator
     * @param {Function} func 
     * @param {`guard` | `pipe`} type 
     * @returns {MiragoDecorator}
     */
    static createDecorator(func, type="guard") {
        return { 
            func: (...args) => {
                return func(...args)
            },
            type
        }
    }

    /**
     * Create decorator from usePipeFactory hook
     * @param {MiragoPipe} pipe 
     * @returns {MiragoDecorator}
     */
    static fromPipeFactory(pipe) {
        return {
            type: `pipe`,
            func: pipe.executor
        }
    }

    /**
     * External inject MiragoDecorator to class
     * @param {MiragoDecorator} decorator 
     * @param {object} target 
     * @returns {object} - Decorated class
     */
    static externalInject(decorator, target) {
        target.decType = decorator.type 
        target.dec = decorator.func

        return target
    }

    /**
     * Execute decorated class method
     * @param {object} target 
     * @param {string} method 
     * @param  {...any} args 
     */
    static externalExec(target, method, ...args) {
        if (!("dec" in target) || !("decType" in target)) throw new Error(`MiragoError: ${target} is not decorated!`)

        const result = target.dec(...args)

        if (target.decType === "guard" && !result) return;
        else if (target.decType === "guard" && result) return target[method](...args)
        else return target[method](result)
    }

    /**
     * Apply decorator to target class name
     * @param {MiragoDecorator} decorator 
     * @param {string} target 
     */
    applyTo(decorator, target) {
        const cls = this.findTarget(target)

        cls.target.decType = decorator.type
        cls.target.dec = (...args) => decorator.func(args)
    }

    /**
     * Execute class decorated metohd, also you can provide args (if need)
     * @param {string} target 
     * @param {string} method 
     * @param  {...any} args 
     */
    exec(target, method, ...args) {
        const cls = this.findTarget(target)

        if (!(method in cls.target)) throw new Error(`MiragoError: ${method} not found in target ${target}`)
        if (!("dec" in cls.target) || !("decType" in cls.target)) throw new Error(`MiragoError: ${target} is not decorated!`)

        const result = cls.target.dec(...args)

        if (cls.target.decType === "guard" && !result) return;
        else if (cls.target.decType === "pipe") cls.target[method](result)
        else cls.target[method](...args)
    }

    /**
     * Push target to fabric targets array
     * @param {MiragoDecoratorTarget} target 
     */
    pushTarget(target) {
        this.targets.push({
            targetKey: target.cls.name,
            target: new target.cls(target.options)
        })
    }
}

/**
 * Apply event to component, return event to callback
 * @param {number} component 
 * @param {string} event 
 * @param {(e: Event) => void} callback 
 * @param {Mirago} app - Provide app, if you dont want to use auto app extractor from router
 * @returns { null }
 */
function useEvent(component, event, callback, app=undefined) {
    if (!app) {
        const url = MiragoRouter.parseUrl(window.location.href)
        app = MiragoRouter.getAppReferenceByUrl(url)
    }

    const html = app.getHTMLReference(component)

    html.addEventListener(event, callback)

    return null
}

/**
 * Friendy reference to cache manager
 * @param {{ response: string, url: string, code: number, error: string } | number | string} cache - Optional argument. Set cache now or get cache. Returns getCache and setCache funcs, and cache if he provided.
 * @param {boolean} cacheOnly - Optional argument. Set false, if you need get full cache object (if cacheId or url provided)
 * @returns {[ (cacheUnknownType: string | number, cacheOnly?: boolean) => MiragoCache, (miragoResponse: MiragoResponse) => number, (deleteCacheType: string | number) => string | null, MiragoCache | number ]} Array with friendly functions, cache if he requested or cacheId, if you provide cache.
 */
function useCache(cache=undefined, cacheOnly=true) {
    function parseCacheGet(getCacheType, cacheOnly) {
        if (typeof(getCacheType) === `string`) {
            return MiragoCacheManager.getCacheByUrl(getCacheType, cacheOnly)
        }
        else {
            return MiragoCacheManager.getCache(getCacheType, cacheOnly)
        }
    }

    function parseCacheDelete(deleteCacheType) {
        if (typeof(deleteCacheType) === `string`) {
            return MiragoCacheManager.deleteCacheByUrl(deleteCacheType)
        }
        else {
            return MiragoCacheManager.deleteCache(deleteCacheType)
        }
    } 

    const baseReturnArray = [parseCacheGet, MiragoCacheManager.setCache, parseCacheDelete]

    if (!cache && cache !== 0) {
        return baseReturnArray
    }
    else if (typeof(cache) === `number` || typeof(cache) === `string`) {
        baseReturnArray.push(parseCacheGet(cache, cacheOnly))

        return baseReturnArray
    }
    else {
        baseReturnArray.push(MiragoCacheManager.setCache(cache))

        return baseReturnArray
    }
}

/**
 * This hook need to create MiragoResponse to use useCache hook.
 * @param {string} url - Url to request
 * @param {`GET` | `POST` | `PUT` | `DELETE`} method - HTTP Method
 * @param {any} body - Request body
 * @param {object[]} headers - Request headers
 * @param {boolean} JSONParser - Set false, if you dont need the auto parse response body to json
 * @param {boolean} withCache - Set true, if you need auto add to cache storage. Return cache key then.
 * @returns {MiragoResponse} - Mirago response interface
 */
function useHttp(url, method=`GET`, body=``, headers=``, JSONParser=true, withCache=false) {
    const response = {
        url,
        code: 0,
        error: ``,
        response: ``,
        cacheKey: 0
    }
    response.url = url
    
    const xhr = new XMLHttpRequest()
  
    xhr.open(method, url, false)

    if (headers) {
        for (let i of headers) {
            for (let e of Object.keys(i)) {
                const value = i[e]

                xhr.setRequestHeader(e, value)
            }
        }
    }
  
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) { 
            if (xhr.status > 400) {
                delete response.response
                response.error = xhr.statusText
                response.code = xhr.status
            }
            else {
                response.code = xhr.status
                response.response = JSONParser ? JSON.parse(xhr.response) : xhr.response
            }   
        }
    }
  
    xhr.send(body || null)

    while (true) {
        let start = performance.now()
        let check = false

        while (performance.now() - start < 100) {
            if (xhr.readyState !== 4) {
                continue
            }
         check = true
         break
        }

        if (check) break
    }

    if (!response.error) {
        if (!withCache) response.cacheKey = 0
        else {
            response.cacheKey = MiragoCacheManager.setCache(response)
        }
    }
    
    return response
}

/**
 * Apply observer to component
 * @param {number} component - Mirago component
 * @param {(event: `rendered` | `stateUpdated` | `deleted`, component: MiragoComponentInfo, app: Mirago) => any} observer - Callback function to observe and includes event status
 * @param {boolean} rewriteMode - Set true if you need to rewrite your observer in routes storage
 * @param {boolean} destroyOnDelete - Set this flag to false, if you not want to destroy observer when component deleted
 * @returns {null}
 */
function useObserver(component, observer, rewriteMode=false, destroyOnDelete=true) {
    if (typeof component !== `number`) throw new Error(`MiragoError: Component must be a number`)

    const localUrl = MiragoRouter.parseUrl(window.location.href)
    const app = MiragoRouter.getAppReferenceByUrl(localUrl)
    const routes = MiragoRouter.getRoutes()
    const router = new MiragoRouter(app)

    const checking = app.OBSERVERS.find((elem) => {
        if (elem.component === component) return elem
    })

    if (!checking && !rewriteMode) {
        app.OBSERVERS.push({
            observer: observer.toString(),
            component,
            destroyOnDelete
        })
    
        if (routes[localUrl]) {
            router.synchronize(`observer`)
        }
    }
    else if (checking && rewriteMode) {
        const index = app.OBSERVERS.indexOf(checking)

        app.OBSERVERS[index] = {
            observer: observer.toString(),
            component,
            destroyOnDelete
        }

        if (routes[localUrl]) {
            router.synchronize(`observer`)
        }
    }

    return null
}

/**
 * Friendly reference to render. Provide array and includes HTML id component or component id in Mirago
 * @param {string[] | number[] | [number | string]} components 
 * @returns { null }
 */
function useRender(components) {
    if (!components || !components?.forEach) throw new Error(`MiragoError: Components argument must be a array`)

    const localUrl = MiragoRouter.parseUrl(window.location.href)
    const app = MiragoRouter.getAppReferenceByUrl(localUrl)

    for (let i of components) {
        if (typeof(i) === `number`) {
            app.renderComponent(i)
        }
        else if (typeof(i) === `string`) {
            app.renderByHTMLId(i)
        }
        else {
            throw new Error(`MiragoError: useRender hook error: ${i} is not a number or string`)
        }
    }
}

/**
 * Apply callback to context
 * @param {(ctx: MiragoContext, ...args) => void} callback 
 * @returns { (...args) => any }
 */
function useContext(callback) {
    const localUrl = MiragoRouter.parseUrl(window.location.href)

    /**
     * MiragoContext generator
     * @param { Mirago } application - Use this on application bundler method
     * @returns { MiragoContext }
     */
    function generateContext(application=undefined) {
        const app = MiragoRouter.getAppReferenceByUrl(localUrl)

        return {
            app: application ? application : app,
            executeTime: new Date(),
            metaData: {
                patch: generateContext,
                url: window.location.href,
                localUrl
            },
            exctractor: {
                component: (id) => {
                    return application ? application.componentInfo(id) : app.componentInfo(id)
                },
                state: (id) => {
                    const manager = new MiragoStateManager(application ? application : app)

                    return manager.getComponentState(id)
                },
                observer: (id) => {
                    const observer = application ? application.OBSERVERS.find((elem) => elem.component === id) : app.OBSERVERS.find((elem) => elem.component === id)

                    return {
                        component: id,
                        observer: observer.observer,
                        destroyOnDelete: observer.destroyOnDelete
                    }
                }
            },
            applicationBundler: (application) => {
               return generateContext(application)
            }
        }
    }

    return function (...args) {
        return callback(generateContext(), ...args)
    }
}

/**
 * Apply interceptor to callback
 * @param {() => void} callback 
 * @param {MiragoInterceptor} interceptor 
 * @param { `before` | `after` } interceptMode - If result, intercept handler call with callback result, also call with callback args
 * @returns { (...args) => any | MiragoInterceptorDefaultReturnValue }
 */
function useInterceptor(callback, interceptor, interceptMode) {
    if (!MiragoValidator.isInterceptor(interceptor)) throw new Error(`MiragoError: useInterceptor hook error: ${interceptor} is not a valid MiragoInterceptor.`)

    return (...args) => {
        let interceptValue;
        let callbackResult;

        if (interceptMode === `before`) {
            interceptValue = interceptor.interceptorHandler(undefined, ...args)
            callbackResult = callback(...args)
        }
        else if (interceptMode === `after`) {
            callbackResult = callback(...args)
            interceptValue = interceptor.interceptorHandler(callbackResult, ...args)
        }

        if (interceptor.acceptedValue) {
            if (interceptValue !== interceptor.acceptedValue) return interceptor.onReject(callbackResult, interceptValue)
            
            return interceptor.onSuccess(callbackResult, interceptValue)
        }

        if (interceptor.rejectedValue) {
            if (interceptValue === interceptor.rejectedValue) return interceptor.onReject(callbackResult, interceptValue)

            return interceptor.onSuccess(callbackResult, interceptValue)
        }

        return {
            callbackResult,
            interceptResult: interceptValue
        }
    }
}

/**
 * Fast method to create form
 * @param {MiragoFormOptions} formOptions 
 * @param {Mirago} app - Provide app if you not want to auto extract app by MiragoRouter.getAppReferenceByUrl method
 * @returns {MiragoForm}
 */
function useForm(formOptions, app=undefined) {
    class MiragoForm {
        isShowed = false;
        app = new Mirago();
        htmlProvider = new MiragoHTML();
        cssProvider = new MiragoCSS();
        component = MiragoComponentInfo.prototype;

        /**
         * Build a executable form
         * @param {MiragoFormOptions} options 
         * @param {Mirago} app
         */
        constructor(options, app=undefined) {
            for (let i of Object.keys(options)) {
                if (i === undefined) continue

                this[i] = options[i]
            }

            if (!app) this.app = MiragoRouter.getAppReferenceByUrl(MiragoRouter.parseUrl(window.location.href))
            else this.app = app
            
            let htmlProvider = new MiragoHTML(this.app);
            let cssProvider = new MiragoCSS(this.app);

            if (options.providers?.length > 0) {
                const validationArray = MiragoValidator.getClassParameters(MiragoFormProviderConstants, `values`).map((el) => {
                    if (el.includes(`"`)) return el.replaceAll(`"`, "")
                    else return el
                })

                for (const provider of options.providers) {
                    if (!validationArray.includes(provider.provide)) throw new Error(`MiragoError: Invalid inject provide token: ${provider.provide}`)

                    if (provider.provide === MiragoFormProviderConstants.MIRAGO_CSS) {
                        if (provider.useValue instanceof MiragoCSS) cssProvider = provider.useValue
                        else throw new Error(`MiragoError: useForm hookError in injection dependences: ${provider.useValue} is not a correct instance of ${provider.provide}`)
                    }
                    else if (provider.provide === MiragoFormProviderConstants.MIRAGO_HTML) {
                        if (provider.useValue instanceof MiragoHTML) htmlProvider = provider.useValue
                        else throw new Error(`MiragoError: useForm hookError in injection dependences: ${provider.useValue} is not a correct instance of ${provider.provide}`)
                    }
                }
            }
            
            this.htmlProvider = htmlProvider
            this.cssProvider = cssProvider
            this.app.ROOT_ELEM.innerHTML += `
                <form id="${options.id}" class="empty" method="${options.method}" action=${options.action} style=${this.buildCssFromObjectToString(options.css)}>
                        <h1>${options.textOptions.header ? options.textOptions.header : "Заполните форму:"}</h1>

                        <div id="${options.id}-inputs-div">

                        </div>

                        <p>${options.textOptions.description ? options.textOptions.description : "Описание формы..."}</p>

                        <button id="${options.id}-form-button">${options.textOptions.buttonText ? options.textOptions.buttonText : "Отправить!"}</button>
                </form>
            `

            const button = document.getElementById(`${options.id}-form-button`)
            const div = document.getElementById(`${options.id}-inputs-div`)

            button.addEventListener(`click`, options.textOptions.buttonCallback)

            for (let i of options.inputFieldsOptions) {
                if (options.inputFieldsOptions.length === 0) break 
                const readyObject = {}

                for (let e of Object.keys(i)) {
                    readyObject[e] = i[e]
                }

                if (!readyObject["name"]) throw new Error(`MiragoError: All inputs names must be provided.`)

                div.innerHTML += `
                    <input type="${readyObject["type"] ? readyObject["type"] : "text"}" name="${readyObject["name"].split(" ").join("_")}" placeholder="${readyObject["placeholder"] ? readyObject["placeholder"].split(" ").join("_") : ""}"> <br>
                `
            }

            const component = this.htmlProvider.createComponentFromHTMLElement(options.id)

            this.component = component
            this.isShowed = true

            if (!options.autoShow) {
                this.isShowed = false
                this.component.DOMComponent.remove()
            }
        }

        /**
         * Show your form method
         * @returns {true}
         */
        show() {
            if (this.isShowed) throw new Error(`MiragoError: Form is already showed`)

            this.isShowed = true 
            this.app.renderComponent(this.component.IndexInComponents)

            return true
        }

        /**
         * Hide your form
         * @returns {true}
         */
        hide() {
            if (!this.isShowed) throw new Error(`MiragoError: Form already hidden!`)

            this.isShowed = false 
            document.getElementById(this.component.HTMLId).remove()

            return true
        }

        /**
         * Edit form attribute
         * @param {"method" | "action"} editAtr 
         * @param {string} value 
         * @returns {true}
         */
        edit(editAtr, value) {
            this.htmlProvider.setAttribute(this.component.IndexInComponents, editAtr, value)

            return true
        }

        /**
         * Send form without waiting user click button
         * @returns {true}
         */
        send() {
            document.getElementById(`${this.component.HTMLId}-form-button`).click()

            return true
        }

        /**
         * Build css string
         * @returns {string}
         */
        buildCssFromObjectToString() {
            if (!this.css) return ""

            let css = "";

            for (let i of Object.keys(this.css)) {
                if (i.length === 0) break

                for (let e of Object.values(this.css)) {
                    css += `${i}:${e};`
                }
            }

            return css
        }

        /**
         * Get HTML input by input name
         * @param {string} name
         * @returns {HTMLElement | null}
         */
        getInputByName(name) {
           return document.querySelector(`#${this.component.HTMLId}-inputs-div > input[name=${name}]`)
        }

        /**
         * Return all form inputs value with strict sctructure
         * @returns {MiragoFormInputValue[] | null}
         */
        getAllInputsValues() {
            const inputs = document.querySelectorAll(`#${this.component.HTMLId}-inputs-div > input`)

            if (inputs.length === 0) return null 
            
            const returnArray = []

            for (const input of inputs) {
                returnArray.push({ inputDOM: input, inputValue: input.value, inputHTMLId: input.getAttribute(`id`) })
            }

            return returnArray
        }
    }

    return new MiragoForm(formOptions, app)
}

/**
 * Usefull tool for local storage
 * @param {string} item - Item name in local storage to manipulate
 * @return {[() => any, (value) => void, () => void]} First function use to get value, second to set, three to remove
 */
function useLocalStorage(item) {
    return [() => localStorage.getItem(item), (value) => localStorage.setItem(item, value), () => localStorage.removeItem(item)]
}

/**
 * Create a animation from MiragoComponents list
 * @param {number[]} compList 
 * @param {number} delay - Delay animation in MS
 * @param {Mirago} app
 * @returns {() => void} Animation func
 */
function useAnimtation(compList, delay, app) {
    return () => {
        let lastComp;
        let lastDelay;

        const HTMLProvider = new MiragoHTML(app)

        for (const component of compList) {
            setTimeout(() => {
                lastComp ? HTMLProvider.deleteFromDOM(lastComp) : null

                app.renderComponent(component)
                lastComp = component
            }, lastDelay ? lastDelay+lastDelay : delay)
        }
    }
}

/**
 * Custom hook factory
 * @param {MiragoHookFactoryOptions} options 
 * @returns {(...args) => {}}
 */
function useHookFactory(options) {
    /**
     * Extcract func arguments names
     * @param {(...args) => void} func 
     * @returns {string[]}
     */
    function parametersExtractor(func) {
        let args = func.toString().match(/\(([^)]*)\)/)[1]

        return args.split(",").map((arg) => {
            return arg.replace(/\/\*.*\*/, "").trim()
        })
    }

    function dependenciesInjector() {
        const dependencies = []
        const handlerParameterNames = parametersExtractor(options.hookHandler)

        for (const dependency of handlerParameterNames) {
            if (!options.injectionList) break
            if (dependency === "...args") continue

            const injector = options.injectionList.find(el => el.injectToken === dependency)

            if (!injector) throw new Error(`MiragoError: Mirago cannot inject dependency ${dependency}`)

            dependencies.push(new injector.injector(injector.injectorOptions))
        }

        return dependencies
    }

    if (options.injectionProviderNewInstance) {
        return (...args) => {
            return options.hookHandler(...dependenciesInjector(), ...args)
        }
    }
    else {
        const dependencies = dependenciesInjector()

        return (...args) => {
            return options.hookHandler(...dependencies, ...args)
        }
    }
}

/**
 * Factory to create custom pipe
 * @param {MiragoCustomPipeOptions} options 
 * @returns {(pipeTarget?: `query` | `object`, ...args?) => MiragoPipe}
 */
function usePipeFactory(options) {
    return (pipeTarget=options.target, ...args) => {
        return {
            executor: ((data) => {  
                if (args.length) return options.executor(data, ...args)
                else return options.executor(data)
            }),
            target: options.dynamicTarget ? pipeTarget : options.target
        }
    }
}

/**
 * This function used to fast build your child pages.
 * @param {MiragoBuilderOptions} options - Opitions to build page
 * @returns { MiragoBuildedPage } object with build results
 */
function builder(options) {
    const { app, callback } = MiragoRouter.childPage(
        options.rootElem.auto ? Mirago.getRoot() : options.rootElem.use ? options.rootElem.use : options.rootElem.useFactory(), options.renderElements
    )

    return {
        app,
        callback,
        manager: options.withManager ? new MiragoStateManager(app) : null,
        router: options.withRouter ? new MiragoRouter(app) : null, 
        callbackResult: options.executeCallback.isNeeded ? options.executeCallback.useProvidedArgs ? callback(MiragoRouter.getCurrentRouteArgs()) : callback(options.executeCallback.args) : null
    }
}

class MiragoResponse {
    url = ``
    code = 0
    error = ``
    response = {}
    cacheKey = 0
}

class MiragoState {
    element = ``
    state = {}
    allowed = false
}

class MiragoComponentInfo {
    Component = ``
    DOMComponent = new HTMLElement()
    IndexInComponents = 0
    ComponentState = new MiragoState()
    HTMLId = ""
}

class MiragoInitPropeties {
    ROOT_ELEM = new HTMLElement()
    /**
     * @type {string[]}
     */
    COMPONENTS_LIST = []
    /**
     * @type {Record<string, MiragoState>}
     */
    STATE = {}
}

class MiragoCache {
    key = 0 
    url = `` 
    cache = {}
}

class MiragoCacheOnly {
    cache = {}
}

class MiragoBuilderOptions {
    /**
     * Set true, if you need to create MiragoRouter instance
     */
    withRouter = false 

    /**
     * Set true, if you need to create MiragoStateManager instance
     */
    withManager = false 

    /**
     * Set true, if you need use MiragoRouter.elementRenderer method
     */
    renderElements = false

    /**
     * Set isNeeded true, if you need to execute current page callback, you also can provide args to callback, or use default provided args
     */
    executeCallback = {
        isNeeded: false, 
        useProvidedArgs: true,
        args: {}
    }

    /**
     * Set true, if you need to auto create root element (Mirago.getRoot method used), or provide your element in use, or provide function with return rootElement
     */
    rootElem = {
        auto: false, 
        use: new HTMLElement,
        useFactory: () => new HTMLElement
    }
}

class MiragoBuildedPage {
    app = new Mirago()
    callback = () => {}
    router = new MiragoRouter()
    manager = new MiragoStateManager()
    callbackResult = {}
}

class MiragoObserver {
    observer = ``
    component = 0
    destroyOnDelete = true
}

class MiragoHTMLInitOptions {
    /**
     * Set this property to false, if you dont need to delete HTML component after create MiragoComponent
     */
    deleteCreatedElements = true
} 

class MiragoContext {
    app = new Mirago()
    executeTime = new Date()
    metaData = {
        /**
         * Patch MiragoContext with current route data.
         * @returns { MiragoContext }
         */
        patch: () => new MiragoContext(),
        url: ``,
        localUrl: ``
    }
    exctractor = {
        /**
         * Exctract component from app by id
         * @param {number} id 
         * @returns { MiragoComponentInfo }
         */
        component: (id) => new MiragoComponentInfo(),


        /**
         * Exctract component state from app by component id
         * @param {number} id - Component id to get state
         * @returns { MiragoState }  
         */
        state: (id) => new MiragoState(),

        /**
         * Exctract component observer from app by component id 
         * @param {number} id - Component id to get observer
         * @returns { MiragoObserver } 
         */
        observer: (id) => new MiragoObserver()
    }

    /**
     * Override context application to external (resolve MiragoRouter conflicts when component not created in MiragoRouter storage)
     * @param {Mirago} app 
     * @returns { MiragoContext }
     */
    applicationBundler = (app) => new MiragoContext()
}

class MiragoInterceptor {
    interceptorHandler = 
    /**
     * Interceptor handler function. Accept callbackResult if intercept mode === `after`, also provide undefiend.
     * @param {any | undefined} callbackResult 
     * @param {any} callbackArgs 
     * @returns { void }
     */
    (callbackResult, callbackArgs) => {}

    /**
     * Accepted interceptorHandler value. Option parameter (if not provided, any value === accepted)
     */
    acceptedValue = undefined 

    /**
     * Rejected interceptorHandler value. Option parameter (if not provided, ignore this)
     */
    rejectedValue = undefined

    /**
     * This function will have been called, if interceptorHandler result satisfies acceptedValue (null value or great provided)
     */
    onSuccess = (callbackResult, interceptResult) => {}

    /**
     * This function will have been called, if interceptorHandler result doesnt satisfies acceptedValue (null value or great provided)
     */
    onReject = (callbackResult, interceptResult) => {}
}

class MiragoInterceptorDefaultReturnValue {
    callbackResult = undefined 
    interceptResult = undefined
}

class MiragoFormOptions {
    url = ""
    action = ""
    id = ""
    /**
     * @type {Record<string, string>}
     */
    css = {}
    autoShow = false
    textOptions = {
        header: "",
        description: "",
        buttonText: "",
        /**
         * 
         * @param {Event} event 
         */
        buttonCallback: (event) => {}
    }
    providers = [new MiragoFormProvider()]
}

class MiragoFormInput {
    name = ""
    type = ""
    placeholder = ""
}

class MiragoFormProvider {
    provide = ""
    useValue = ""
}

class MiragoFormProviderConstants {
    static MIRAGO_HTML = "MIRAGO_HTML"
    static MIRAGO_CSS = "MIRAGO_CSS"
}

class MiragoFormInputValue {
    inputDOM = new HTMLElement()
    inputValue = undefined
    inputHTMLId = ""
}

class MiragoHookFactoryOptions {
    hookHandler = () => {}
    injectionList = [new MiragoInjector]

    /**
     * Set this option to true, if you need to re-generate dependencies in every call hook handler.
     */
    injectionProviderNewInstance = false
}

class MiragoInjector {
    injectToken = ""
    injector = undefined
    /**
     * @type {Record<string, string}
     */
    injectorOptions = {}
}

class MiragoDecoratorTarget {
    cls = class Test {};
    /**
     * @type {Record<string, any>}
     */
    options = {}
}

class MiragoDecoratorPropertyTarget {
    targetKey = ""
    target = {}
}

class MiragoDecorator {
    func = new Function()
    type = ""
}

class MiragoPipe {
    /**
     * Pipe exec handler
     * @param {Object} data 
     * @returns {any} - Updated data
     */
    executor = (data) => {}
    target = ""
}

class MiragoPipes {
    /**
     * Parse all object to int
     * @param {`first` | `second`} parseLevel Level in object to parse
     * @param {`query` | `object`} parseTarget Target to parse to integer
     * @returns {MiragoPipe}
     */
    static IntParsePipe(parseLevel="first", parseTarget="object") {
        return {
            executor: (data) => {
                if (typeof data !== "object") return data

                for (let i in data) {
                    if (parseLevel === "first") data[i] = typeof data[i] === "string" ? parseInt(data[i]) : data[i]
                    else {
                        for (let e in data[i]) {
                           if (typeof data[i] === "object") data[i][e] = typeof data[i][e] === "string" ? parseInt(data[i][e]) : data[i][e]
                        }
                    }
                }

                return data
            },
            target: parseTarget
        }
    }

    /**
     * Parse JSON string pipe
     * @param {`query` | `object`} parseTarget - Target to parse from JSON
     * @returns {MiragoPipe}
     */
    static JSONParsePipe(parseTarget="object") {
        return {
            executor: (data) => {
                if (typeof data === "string") {
                    if (!(data.includes("{"))) return data
                }

                for (let i in data) {
                    data[i] = JSON.parse(data[i].replace(/(\w+)/g, '"$1"'))
                }
               
                return data
            },
            target: parseTarget
        }
    }

    /**
     * Create pipe from MiragoDecorator
     * @param {MiragoDecorator} decorator - Decorator with "pipe" type
     * @param {Pick<MiragoCustomPipeOptions, "dynamicTarget"> & Pick<MiragoCustomPipeOptions, `target`>} options 
     * @returns {(target?: `query` | `object`, ...args) => MiragoPipe}
     */
    static fromFactory(decorator, options) {
        if (decorator.type !== "pipe") throw new Error(`MiragoError: ${decorator.type} is not a pipe!`)
            
       return (target="object", ...args) => ({
           executor: (data) => decorator.func(data, ...args),
           target: options.dynamicTarget ? target : options.target
       })
    }
}

class MiragoCustomPipeOptions {
    executor = (data) => {}
    dynamicTarget = new Boolean()
    target = ""
}