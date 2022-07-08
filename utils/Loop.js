



export class Loop {

    updatesPhysics = new Set()

    constructor(update, physicsDeltaTime = 0.05, min_dt = 0.1) {

        let last = 0
        const min = Math.min

        const onRaf = (now_ms) => {
            const nowS = now_ms / 1000
            const dt = min(nowS - last, min_dt)
            last = nowS

            this.dtPhysicsRaf += dt
            while (this.dtPhysicsRaf > physicsDeltaTime) {
                for (const cb of updatesPhysics) {
                    cb(physicsDeltaTime)
                }
                this.dtPhysicsRaf -= physicsDeltaTime
            }


            update(dt)

            requestAnimationFrame(onRaf)
        }
        requestAnimationFrame(onRaf)
    }
}