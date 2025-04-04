class MainUI {
    constructor(options) {
        this.options = options
        this.isInited = false
        this.isShowed = false
    }

    init(app) {
        if (this.isInited) return;

        this.options.app = app
        this.options.HTMLProvider = new MiragoHTML(app, { deleteCreatedElements: true })

        const component = app.createComponent(`div`, `main-ui-div`, ``, ``)
        
        this.options.HTMLProvider.insertHTML(component, `toEnd`, `
            <div id="main-box" class="">
                 <nav id="navbar" class="navbar">
                    <ul class="nav-links">
                        <li><a href="http://localhost:5000/storages.html">Мои Хранилища</a></li>
                        <li><a href="http://localhost:5000/payments.html">Платежи</a></li>
                        <li><a href="http://localhost:5000/apps.html">Мои приложения</a></li>
                    </ul>

                    <div class="profile-section">
                        <button id="profile-button" class="profile-button">Мой профиль</button>
                    </div>
                </nav>
            </div>
        `)

        this.isInited = true
        this.activateButton()
        this.options.component = component
        this.options.renderOnFirstUse ? null : this.options.HTMLProvider.deleteFromDOM(component)
    }

    activateButton() {
        if (!this.isInited) return;

        const [navBar, button] = this.options.HTMLProvider.createComponentsByHTMLIds(["navbar", "profile-button"])

        this.options.HTMLProvider.deleteFromDOM(button.IndexInComponents)
        this.options.HTMLProvider.insertComponent(navBar.IndexInComponents, button.IndexInComponents, `toEnd`)

        useEvent(button.IndexInComponents, `click`, () => {
            MiragoRouter.goToMain()
        }, this.options.app)
    }

    render() {
        if (this.isShowed) throw new Error(`Already showed Main UI!`)

        this.options.app.renderComponent(this.options.component)
        this.isShowed = true
    }

    hide() {
        if (!this.isShowed) throw new Error(`Main UI isnt showed!`)

        this.options.HTMLProvider.deleteFromDOM(this.options.component)
        this.isShowed = false
    }

    toggleShowing() {
        this.isShowed ? this.hide() : this.render()
    }
}

const useMainUI = useHookFactory({
    hookHandler: (MainUI, ...args) => {
        MainUI.isInited ? MainUI.toggleShowing : MainUI.init(args[0])
    },
    injectionList: [
        {
            injector: MainUI,
            injectToken: MainUI.name,
            injectorOptions: {
                renderOnFirstUse: true
            }
        }
    ]
})