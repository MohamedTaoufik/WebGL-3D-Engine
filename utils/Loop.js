



export class Loop {

    constructor(update, min_dt = 0.1) {

        let last = 0
        const Math_min = Math.min

        const on_raf = (now_ms) => {
            const now_s = now_ms / 1000
            const dt = Math_min(now_s - last, min_dt)
            last = now_s

            update(dt)

            requestAnimationFrame(on_raf)
        }
        requestAnimationFrame(on_raf)
    }
}