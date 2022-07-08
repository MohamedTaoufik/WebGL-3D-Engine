

export class CursorView {
    constructor(
        parent,
        title, callback,
        min = -10, max = 10, step = 0.1
    ) {
        this.container = document.createElement('div')
        parent.appendChild(this.container)
        this.container.style.display = 'flex'

        const titleElement = document.createElement('span')
        titleElement.innerHTML = title
        this.container.appendChild(titleElement)

        const input = document.createElement('input')
        input.type = 'range'
        input.min = min
        input.max = max
        input.step = step
        input.value = (min + max) / 2
        this.container.appendChild(input)

        const hint = document.createElement('span')
        this.container.appendChild(hint)

        const on_input = () => {
            hint.innerHTML = input.value
            callback(+input.value)
        }
        on_input()
        input.addEventListener('input', on_input)

        const button = document.createElement('button')
        button.innerHTML = 'Record'
    }
}









